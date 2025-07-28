// The 'vscode' module contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { TextLintEngine } = require("textlint");
const path = require("path");
const fs = require("fs");
const os = require("os");
const yaml = require("js-yaml");
let prhDescMap;
let statusBarItem;
let extensionContext = null;

// Cross-platform path resolver
function resolvePath(inputPath) {
  if (!inputPath || !inputPath.trim()) {
    return inputPath;
  }

  let resolvedPath = inputPath.trim();

  // Handle tilde (~) expansion on Unix-like systems (Mac/Linux)
  if (resolvedPath.startsWith("~")) {
    const homeDir = os.homedir();
    resolvedPath = resolvedPath.replace(/^~(?=\/|\\|$)/, homeDir);
    console.log(`[DEBUG] Expanded tilde path: ${inputPath} -> ${resolvedPath}`);
  }

  // Use path.resolve for absolute path resolution
  const finalPath = path.resolve(resolvedPath);
  console.log(`[DEBUG] Final resolved path: ${inputPath} -> ${finalPath}`);

  return finalPath;
}

// Get user-level default rules folder
function getUserDefaultRulesFolder() {
  const homeDir = os.homedir();
  // Cross-platform path handling - use home directory with subfolder
  return path.join(homeDir, "smart-proofreader", "rules");
}

// Get display path for current platform
function getDefaultRulesDisplayPath() {
  if (process.platform === "win32") {
    return "C:\\Users\\[username]\\smart-proofreader\\rules\\";
  } else {
    return "~/smart-proofreader/rules/";
  }
}

// Initialize user default rules folder with sample files
function initializeUserDefaultRulesFolder() {
  const userRulesPath = getUserDefaultRulesFolder();

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(userRulesPath)) {
      fs.mkdirSync(userRulesPath, { recursive: true });
      console.log(`[INFO] Created user default rules folder: ${userRulesPath}`);
    }

    // Sample rule files to create
    const sampleFiles = {
      "rule1.yml": `# prh ルール例、自由に編集可能
rules:
  - expected: テスト1
    pattern: /test1/
    description: 説明1`,

      "rule2.yml": `# prh ルール例、自由に編集可能
rules:
  - expected: テスト2
    pattern: /test2/
    description: 説明2`,

      "rule3.yml": `# prh ルール例、自由に編集可能
rules:
  - expected: テスト3
    pattern: /test3/
    description: 説明3`,
    };

    // Create sample files if they don't exist
    let createdFiles = [];
    for (const [filename, content] of Object.entries(sampleFiles)) {
      const filePath = path.join(userRulesPath, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, "utf8");
        createdFiles.push(filename);
        console.log(`[INFO] Created sample file: ${filePath}`);
      }
    }

    return { path: userRulesPath, createdFiles };
  } catch (error) {
    console.error(
      "[ERROR] Failed to initialize user default rules folder:",
      error
    );
    return null;
  }
}

// Status bar functions
function updateStatusBar() {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const checkOnSave = config.get("checkOnSave");

  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      1000
    );
    statusBarItem.command = "smartProofreader.toggle";
  }

  if (checkOnSave) {
    statusBarItem.text = "$(check-all) Smart Proofreader: ON";
    statusBarItem.tooltip = "Smart Proofreader is enabled (Click to disable)";
    statusBarItem.backgroundColor = undefined;
  } else {
    statusBarItem.text = "$(circle-slash) Smart Proofreader: OFF";
    statusBarItem.tooltip = "Smart Proofreader is disabled (Click to enable)";
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }

  statusBarItem.show();
}

// File type mappings
const FILE_TYPE_MAPPINGS = {
  plaintext: [".txt"],
  markdown: [".md", ".markdown"],
  html: [".html", ".htm"],
  latex: [".tex"],
  javascript: [".js", ".jsx"],
  typescript: [".ts", ".tsx"],
  vue: [".vue"],
  json: [".json"],
};

function isFileTypeEnabled(languageId) {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const setting = config.get(`enabledFileTypes.${languageId}`);
  console.log(
    `[DEBUG] Checking file type ${languageId}: setting value = ${setting}`
  );

  // If setting is undefined, use default value true
  if (setting === undefined) {
    console.log(
      `[DEBUG] File type ${languageId} setting undefined, using default true`
    );
    return true;
  }

  return setting === true;
}

function shouldCheckDocument(document) {
  if (!document || !document.fileName) return false;

  const languageId = document.languageId;

  // Check if this file type is enabled
  if (!isFileTypeEnabled(languageId)) return false;

  // Check if file extension matches
  const extensions = FILE_TYPE_MAPPINGS[languageId];
  if (!extensions) return false;

  const fileName = document.fileName.toLowerCase();
  return extensions.some((ext) => fileName.endsWith(ext));
}

function getAllRulesFolders(context) {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const userRulesFolder = config.get("rulesFolder");
  const folders = [];

  // Default rules folder is always checked - use context.extensionPath for packaged extension
  const extensionPath = context ? context.extensionPath : __dirname;
  const defaultPath = path.join(extensionPath, "prh-rules");
  folders.push(defaultPath);
  console.log(`[DEBUG] Default rules folder: ${defaultPath}`);
  console.log(`[DEBUG] Extension path: ${extensionPath}`);
  console.log(`[DEBUG] Default path exists: ${fs.existsSync(defaultPath)}`);

  // User default rules folder is always checked
  const userDefaultPath = getUserDefaultRulesFolder();
  if (fs.existsSync(userDefaultPath) && userDefaultPath !== defaultPath) {
    folders.push(userDefaultPath);
    console.log(`[DEBUG] User default rules folder: ${userDefaultPath}`);
  }

  // If user configured a custom rules folder, also check it
  if (userRulesFolder && userRulesFolder.trim()) {
    const resolvedPath = resolvePath(userRulesFolder.trim());
    // Avoid adding duplicate paths
    if (resolvedPath !== defaultPath && resolvedPath !== userDefaultPath) {
      folders.push(resolvedPath);
      console.log(`[DEBUG] User custom rules folder: ${resolvedPath}`);
    }
  }

  console.log(`[DEBUG] All rules folders:`, folders);
  return folders;
}

function getRulesFolder() {
  // Maintain backward compatibility, return first folder (default folder)
  return getAllRulesFolders(extensionContext)[0];
}

function loadPrhDescriptionMap() {
  const rulesFolders = getAllRulesFolders(extensionContext);
  const map = {};
  let totalFiles = 0;
  let totalRules = 0;

  rulesFolders.forEach((rulesFolder) => {
    try {
      if (!fs.existsSync(rulesFolder)) {
        console.warn(`PRH rules folder does not exist: ${rulesFolder}`);
        return;
      }

      // Read all yml files in the folder
      const files = fs
        .readdirSync(rulesFolder)
        .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

      if (files.length === 0) {
        console.warn(`No yml files found in PRH rules folder: ${rulesFolder}`);
        return;
      }

      totalFiles += files.length;

      files.forEach((filename) => {
        const filePath = path.join(rulesFolder, filename);
        // Check if it's the default rules folder
        const extensionPath = extensionContext ? extensionContext.extensionPath : __dirname;
        const defaultPath = path.join(extensionPath, "prh-rules");
        const isDefaultFolder = rulesFolder === defaultPath;
        const sourceLabel = isDefaultFolder ? "default" : filename;

        try {
          const doc = yaml.load(fs.readFileSync(filePath, "utf8"));
          const rules =
            doc && typeof doc === "object" && "rules" in doc
              ? doc.rules
              : undefined;

          if (Array.isArray(rules)) {
            rules.forEach((rule, index) => {
              try {
                console.log(
                  `[DEBUG] Processing rule ${index + 1} in ${filename}:`,
                  JSON.stringify(rule, null, 2)
                );

                if (rule.specs) {
                  // Old format: when specs are present
                  rule.specs.forEach((spec, specIndex) => {
                    try {
                      if (spec.from) {
                        if (!map[spec.from]) {
                          map[spec.from] = [];
                        }
                        map[spec.from].push({
                          description:
                            spec.description || "No description provided",
                          source: sourceLabel,
                          expected: spec.to || rule.expected,
                        });
                        totalRules++;
                      }
                    } catch (specError) {
                      console.warn(
                        `[WARN] Skipping invalid spec ${specIndex + 1} in rule ${index + 1} of ${filename}:`,
                        specError.message
                      );
                    }
                  });
                } else if (rule.pattern && rule.expected) {
                  // New format: when specs are not present, extract candidates from pattern
                  const patternStr = rule.pattern.toString();
                  console.log(
                    `[DEBUG] Processing pattern rule: ${patternStr} -> ${rule.expected}`
                  );

                  // Validate pattern before processing
                  try {
                    // Test if pattern is a valid regex
                    if (patternStr.startsWith('/') && patternStr.endsWith('/')) {
                      const testPattern = patternStr.slice(1, -1);
                      new RegExp(testPattern); // This will throw if invalid
                    }
                  } catch (patternError) {
                    console.warn(
                      `[WARN] Skipping rule ${index + 1} in ${filename} - Invalid pattern "${patternStr}":`,
                      patternError.message
                    );
                    return; // Skip this rule entirely
                  }

                  // For complex regex patterns, store the entire rule info using the pattern as key
                  // This allows us to match against it later during diagnostics
                  const patternKey = `__PATTERN__${patternStr}`;
                  if (!map[patternKey]) {
                    map[patternKey] = [];
                  }
                  map[patternKey].push({
                    description: rule.description || "No description provided",
                    source: sourceLabel,
                    expected: rule.expected,
                    originalPattern: patternStr
                  });
                  totalRules++;
                  console.log(
                    `[DEBUG] Added complex pattern rule: ${patternStr} -> ${rule.expected} [${sourceLabel}]`
                  );

                  // Extract the core pattern content for simple cases
                  const matches = patternStr.match(/\/(.+?)\//);
                  if (matches && matches[1]) {
                    const patternContent = matches[1];

                    try {
                      // Handle different pattern formats
                      if (patternContent.includes("|")) {
                        // Multiple alternatives: /VScode|VSCode|vscode/
                        const alternatives = patternContent.split("|");
                        alternatives.forEach((alt) => {
                          try {
                            const cleanAlt = alt.replace(/[()]/g, "").trim();
                            if (cleanAlt && cleanAlt !== rule.expected && !cleanAlt.includes("?") && !cleanAlt.includes("{") && !cleanAlt.includes("+") && !cleanAlt.includes("*")) {
                              if (!map[cleanAlt]) {
                                map[cleanAlt] = [];
                              }
                              map[cleanAlt].push({
                                description:
                                  rule.description || "No description provided",
                                source: sourceLabel,
                                expected: rule.expected,
                              });
                              totalRules++;
                              console.log(
                                `[DEBUG] Added pattern rule: ${cleanAlt} -> ${rule.expected} [${sourceLabel}]`
                              );
                            }
                          } catch (altError) {
                            console.warn(
                              `[WARN] Skipping alternative "${alt}" in rule ${index + 1} of ${filename}:`,
                              altError.message
                            );
                          }
                        });
                      } else if (!patternContent.includes("?") && !patternContent.includes("{") && !patternContent.includes("+") && !patternContent.includes("*") && !patternContent.includes("(")) {
                        // Simple single pattern: /wrong/ (avoid complex regex features)
                        const cleanPattern = patternContent
                          .replace(/[()]/g, "")
                          .trim();
                        if (cleanPattern && cleanPattern !== rule.expected) {
                          if (!map[cleanPattern]) {
                            map[cleanPattern] = [];
                          }
                          map[cleanPattern].push({
                            description:
                              rule.description || "No description provided",
                            source: sourceLabel,
                            expected: rule.expected,
                          });
                          totalRules++;
                          console.log(
                            `[DEBUG] Added single pattern rule: ${cleanPattern} -> ${rule.expected} [${sourceLabel}]`
                          );
                        }
                      }
                    } catch (contentError) {
                      console.warn(
                        `[WARN] Skipping pattern content processing for rule ${index + 1} in ${filename}:`,
                        contentError.message
                      );
                    }
                  } else {
                    // Pattern might be a simple string or other format
                    console.log(`[DEBUG] Could not parse pattern: ${patternStr}`);
                  }
                } else {
                  console.log(
                    `[DEBUG] Skipping rule ${index + 1} in ${filename} - Missing required pattern or expected field`
                  );
                }
              } catch (ruleError) {
                console.warn(
                  `[WARN] Skipping invalid rule ${index + 1} in ${filename}:`,
                  ruleError.message,
                  rule
                );
              }
            });
          }
        } catch (e) {
          console.error(`PRH rules file parsing error: ${filePath}`, e);
        }
      });
    } catch (e) {
      console.error(`PRH rules folder reading error: ${rulesFolder}`, e);
    }
  });

  console.log(
    `Loaded ${totalFiles} PRH rules files from ${rulesFolders.length} folders, registered ${totalRules} rules total`
  );
  return map;
}
prhDescMap = loadPrhDescriptionMap();

let folderWatchers = [];
let cachedRulesConfig = null;
let cachedRulesTimestamp = null;

// Get modification timestamps of all rule files
function getRulesTimestamp() {
  const rulesFolders = getAllRulesFolders(extensionContext);
  let latestTimestamp = 0;

  rulesFolders.forEach((rulesFolder) => {
    if (fs.existsSync(rulesFolder)) {
      const files = fs
        .readdirSync(rulesFolder)
        .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
      files.forEach((file) => {
        const filePath = path.join(rulesFolder, file);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          latestTimestamp = Math.max(latestTimestamp, stat.mtime.getTime());
        }
      });
    }
  });

  return latestTimestamp;
}

// Validate and clean a single rule
function validateAndCleanRule(rule, ruleIndex, filename) {
  try {
    // Check required fields
    if (!rule.pattern || !rule.expected) {
      console.warn(`[WARN] Rule ${ruleIndex + 1} in ${filename} missing required fields`);
      return null;
    }

    // Validate pattern
    const patternStr = rule.pattern.toString();
    if (patternStr === '?' || patternStr === '') {
      console.warn(`[WARN] Rule ${ruleIndex + 1} in ${filename} has invalid pattern: "${patternStr}"`);
      return null;
    }

    // Test regex pattern if it looks like one
    if (patternStr.startsWith('/') && patternStr.endsWith('/')) {
      try {
        const testPattern = patternStr.slice(1, -1);
        new RegExp(testPattern);
      } catch (patternError) {
        console.warn(`[WARN] Rule ${ruleIndex + 1} in ${filename} has invalid regex pattern: "${patternStr}"`);
        return null;
      }
    }

    // Return cleaned rule (remove non-standard fields like 'prh')
    const cleanedRule = {
      pattern: rule.pattern,
      expected: rule.expected
    };

    if (rule.description) {
      cleanedRule.description = rule.description;
    }

    if (rule.specs) {
      cleanedRule.specs = rule.specs;
    }

    return cleanedRule;
  } catch (error) {
    console.warn(`[WARN] Error validating rule ${ruleIndex + 1} in ${filename}:`, error.message);
    return null;
  }
}

// Create cleaned rule files for TextLint
function createCleanedRuleFiles() {
  const rulesFolders = getAllRulesFolders(extensionContext);
  const cleanedFiles = [];
  const tempDir = path.join(__dirname, 'temp-rules');

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let fileCounter = 0;

    rulesFolders.forEach((rulesFolder) => {
      if (fs.existsSync(rulesFolder)) {
        const files = fs
          .readdirSync(rulesFolder)
          .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

        files.forEach((filename) => {
          const filePath = path.join(rulesFolder, filename);
          
          try {
            const doc = yaml.load(fs.readFileSync(filePath, "utf8"));
            const rules = doc && typeof doc === "object" && "rules" in doc ? doc.rules : undefined;

            if (Array.isArray(rules)) {
              const validRules = [];

              rules.forEach((rule, index) => {
                const cleanedRule = validateAndCleanRule(rule, index, filename);
                if (cleanedRule) {
                  validRules.push(cleanedRule);
                }
              });

              // Only create cleaned file if there are valid rules
              if (validRules.length > 0) {
                const cleanedDoc = {
                  version: (doc && typeof doc === 'object' && 'version' in doc) ? doc.version : 1,
                  rules: validRules
                };

                const cleanedFileName = `cleaned-${fileCounter}-${filename}`;
                const cleanedFilePath = path.join(tempDir, cleanedFileName);
                
                fs.writeFileSync(cleanedFilePath, yaml.dump(cleanedDoc), 'utf8');
                cleanedFiles.push(cleanedFilePath);
                fileCounter++;

                console.log(`[INFO] Created cleaned rule file: ${cleanedFileName} (${validRules.length}/${rules.length} rules valid)`);
              } else {
                console.warn(`[WARN] No valid rules found in ${filename}, skipping file`);
              }
            }
          } catch (fileError) {
            console.error(`[ERROR] Failed to process rule file ${filename}:`, fileError.message);
          }
        });
      }
    });

    return cleanedFiles;
  } catch (error) {
    console.error("[ERROR] Failed to create cleaned rule files:", error);
    return [];
  }
}

// Get cached textlint config or create new one if cache is invalid
function getCachedTextlintConfig() {
  const currentTimestamp = getRulesTimestamp();

  if (cachedRulesConfig && cachedRulesTimestamp === currentTimestamp) {
    console.log("[DEBUG] Using cached textlint config");
    return cachedRulesConfig;
  }

  console.log("[DEBUG] Cache miss or outdated, generating new textlint config");

  // Create cleaned rule files (filters out invalid rules)
  const cleanedRulePaths = createCleanedRuleFiles();

  let finalRulePaths = cleanedRulePaths;
  if (cleanedRulePaths.length === 0) {
    const extensionPath = extensionContext ? extensionContext.extensionPath : __dirname;
    const defaultRulePath = path.join(extensionPath, "prh-rules", "prh.yml");
    if (fs.existsSync(defaultRulePath)) {
      finalRulePaths = [defaultRulePath];
    }
  }

  const configContent = `
module.exports = {
  rules: {
    prh: {
      rulePaths: ${JSON.stringify(finalRulePaths)},
    },
  },
};`;

  // Cache the result
  cachedRulesConfig = { 
    configContent, 
    rulePaths: finalRulePaths,
    cleanedFiles: cleanedRulePaths // Keep track of cleaned files for cleanup
  };
  cachedRulesTimestamp = currentTimestamp;

  return cachedRulesConfig;
}

function setupRulesFolderWatcher() {
  // Clean up old watchers
  folderWatchers.forEach((watcher) => {
    if (watcher) {
      watcher.close();
    }
  });
  folderWatchers = [];

  const rulesFolders = getAllRulesFolders(extensionContext);

  rulesFolders.forEach((rulesFolder) => {
    if (fs.existsSync(rulesFolder)) {
      try {
        const watcher = fs.watch(rulesFolder, (eventType, filename) => {
          if (
            filename &&
            (filename.endsWith(".yml") || filename.endsWith(".yaml"))
          ) {
            console.log(
              `PRH rules file changed: ${filename} in ${rulesFolder}`
            );
            // Clear cache when files change
            cachedRulesConfig = null;
            cachedRulesTimestamp = null;
            prhDescMap = loadPrhDescriptionMap();
            console.log("[DEBUG] Cache cleared due to rule file change");
          }
        });
        folderWatchers.push(watcher);
        console.log(`Watching PRH rules folder: ${rulesFolder}`);
      } catch (e) {
        console.error(`Failed to set up folder watcher: ${rulesFolder}`, e);
      }
    } else {
      console.warn(
        `PRH rules folder does not exist, skipping watch: ${rulesFolder}`
      );
    }
  });
}

setupRulesFolderWatcher();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Extension activation message
  console.log("Smart Proofreader extension is now active!");

  // Store context globally for use in other functions
  extensionContext = context;

  const isFirstTime = !context.globalState.get(
    "smartProofreader.hasShownSetup",
    false
  );
  if (isFirstTime) {
    vscode.window
      .showInformationMessage(
        "Smart Proofreader: Welcome! Would you like to set up custom rules folder now?",
        "Set up now",
        "Set up later"
      )
      .then((selection) => {
        if (selection === "Set up now") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "smartProofreader.rulesFolder"
          );
        }
        context.globalState.update("smartProofreader.hasShownSetup", true);
      });
  }

  // Register command: Check current file
  const checkFileDisposable = vscode.commands.registerCommand(
    "smartProofreader.checkFile",
    async function () {
      const config = vscode.workspace.getConfiguration("smartProofreader");
      const checkOnSave = config.get("checkOnSave");

      // Check if Smart Proofreader is enabled
      if (!checkOnSave) {
        vscode.window.showWarningMessage(
          "Smart Proofreader is currently disabled. Please enable it first by clicking the status bar button."
        );
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.document) {
        vscode.window.showWarningMessage("Please open a file to check.");
        return;
      }

      if (!shouldCheckDocument(editor.document)) {
        vscode.window.showInformationMessage(
          `File type '${editor.document.languageId}' is not enabled for checking or not supported.`
        );
        return;
      }

      // Reload rules before manual check to ensure latest rules are used
      console.log("[DEBUG] Manual check: Reloading PRH rules...");
      prhDescMap = loadPrhDescriptionMap();
      setupRulesFolderWatcher(); // Also refresh file watchers

      // Execute manual check
      await lintDocument(editor.document);

      vscode.window.showInformationMessage(
        `File checked: ${path.basename(editor.document.fileName)}`
      );
    }
  );

  // Register command: Clear all diagnostics
  const clearDiagnosticsDisposable = vscode.commands.registerCommand(
    "smartProofreader.clear",
    function () {
      // Clear all diagnostic information
      diagnosticCollection.clear();

      vscode.window.showInformationMessage(
        "All Smart Proofreader diagnostics cleared."
      );
    }
  );

  // Register command: Toggle auto check
  const toggleDisposable = vscode.commands.registerCommand(
    "smartProofreader.toggle",
    async function () {
      const config = vscode.workspace.getConfiguration("smartProofreader");
      const currentSetting = config.get("checkOnSave");
      const newSetting = !currentSetting;

      try {
        await config.update(
          "checkOnSave",
          newSetting,
          vscode.ConfigurationTarget.Workspace
        );

        if (newSetting) {
          vscode.window.showInformationMessage(
            "Smart Proofreader: Auto check enabled"
          );
          // Reload rules before checking to ensure latest rules are used
          console.log("[DEBUG] Status bar toggle: Reloading PRH rules...");
          prhDescMap = loadPrhDescriptionMap();
          setupRulesFolderWatcher(); // Also refresh file watchers

          // Check current document if enabled
          if (vscode.window.activeTextEditor) {
            lintDocument(vscode.window.activeTextEditor.document);
          }
        } else {
          vscode.window.showInformationMessage(
            "Smart Proofreader: Auto check disabled"
          );
          // Clear diagnostics when disabled
          diagnosticCollection.clear();
          // Clear cache when manually disabled
          cachedRulesConfig = null;
          cachedRulesTimestamp = null;
          console.log("[DEBUG] Cache cleared due to manual disable");
        }

        updateStatusBar();
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to toggle Smart Proofreader: ${error.message}`
        );
      }
    }
  );

  // Register command: Open rules folder
  const openRulesFolderDisposable = vscode.commands.registerCommand(
    "smartProofreader.openRulesFolder",
    function () {
      const userDefaultPath = getUserDefaultRulesFolder();
      const allFolders = getAllRulesFolders(extensionContext);

      if (allFolders.length === 1) {
        // Only default extension rules folder exists
        vscode.window
          .showInformationMessage(
            `Default Rules Location: ${userDefaultPath}`,
            "Open Folder",
            "Create Sample Files"
          )
          .then((selection) => {
            if (selection === "Open Folder") {
              // Try to reveal a file inside the folder instead of just the folder
              if (fs.existsSync(userDefaultPath)) {
                const files = fs
                  .readdirSync(userDefaultPath)
                  .filter(
                    (file) => file.endsWith(".yml") || file.endsWith(".yaml")
                  );
                if (files.length > 0) {
                  // For Windows, open the file first then reveal it
                  const firstFile = path.join(userDefaultPath, files[0]);
                  if (process.platform === "win32") {
                    // On Windows, open the file to ensure it's selected in explorer
                    vscode.workspace
                      .openTextDocument(vscode.Uri.file(firstFile))
                      .then(() => {
                        vscode.commands.executeCommand(
                          "revealFileInOS",
                          vscode.Uri.file(firstFile)
                        );
                      });
                  } else {
                    // On Mac/Linux, direct reveal should work
                    vscode.commands.executeCommand(
                      "revealFileInOS",
                      vscode.Uri.file(firstFile)
                    );
                  }
                } else {
                  // No files exist, just show the folder
                  vscode.commands.executeCommand(
                    "revealFileInOS",
                    vscode.Uri.file(userDefaultPath)
                  );
                }
              } else {
                vscode.window.showWarningMessage(
                  "Rules folder does not exist. Please create it first using 'Init Rules Folder' command."
                );
              }
            } else if (selection === "Create Sample Files") {
              const result = initializeUserDefaultRulesFolder();
              if (result) {
                vscode.window
                  .showInformationMessage(
                    `Created ${result.createdFiles.length} sample files in ${result.path}`,
                    "Open Folder"
                  )
                  .then((sel) => {
                    if (sel === "Open Folder") {
                      // Reveal the first created file to show folder contents
                      if (result.createdFiles.length > 0) {
                        const firstFile = path.join(
                          result.path,
                          result.createdFiles[0]
                        );
                        if (process.platform === "win32") {
                          // On Windows, open the file to ensure it's selected in explorer
                          vscode.workspace
                            .openTextDocument(vscode.Uri.file(firstFile))
                            .then(() => {
                              vscode.commands.executeCommand(
                                "revealFileInOS",
                                vscode.Uri.file(firstFile)
                              );
                            });
                        } else {
                          // On Mac/Linux, direct reveal should work
                          vscode.commands.executeCommand(
                            "revealFileInOS",
                            vscode.Uri.file(firstFile)
                          );
                        }
                      } else {
                        vscode.commands.executeCommand(
                          "revealFileInOS",
                          vscode.Uri.file(result.path)
                        );
                      }
                    }
                  });
              }
            }
          });
      } else {
        // Multiple folders exist, show options
        const options = [];
        allFolders.forEach((folder, index) => {
          const isDefault = folder === path.resolve(__dirname, "./prh-rules");
          const isUserDefault = folder === userDefaultPath;
          let label = "";
          if (isDefault) {
            label = `Built-in Rules: ${folder}`;
          } else if (isUserDefault) {
            label = `User Default Rules: ${folder}`;
          } else {
            label = `Custom Rules: ${folder}`;
          }
          options.push({ label, folder });
        });

        vscode.window
          .showQuickPick(
            options.map((opt) => opt.label),
            {
              placeHolder: "Select rules folder to open",
            }
          )
          .then((selected) => {
            if (selected) {
              const selectedOption = options.find(
                (opt) => opt.label === selected
              );
              if (selectedOption) {
                vscode.commands.executeCommand(
                  "revealFileInOS",
                  vscode.Uri.file(selectedOption.folder)
                );
              }
            }
          });
      }
    }
  );

  // Register command: Init rules folder
  const initRulesFolderDisposable = vscode.commands.registerCommand(
    "smartProofreader.initRulesFolder",
    function () {
      const config = vscode.workspace.getConfiguration("smartProofreader");
      const configuredPath = config.get("rulesFolder");

      // Use configured path or default
      const targetPath =
        configuredPath && configuredPath.trim()
          ? resolvePath(configuredPath.trim())
          : getUserDefaultRulesFolder();

      const result = initializeUserDefaultRulesFolder();
      if (result) {
        vscode.window
          .showInformationMessage(
            `Created ${result.createdFiles.length} sample rule files in ${result.path}`,
            "Open Folder"
          )
          .then((selection) => {
            if (selection === "Open Folder") {
              // Reveal the first created file to show folder contents
              if (result.createdFiles.length > 0) {
                const firstFile = path.join(
                  result.path,
                  result.createdFiles[0]
                );
                if (process.platform === "win32") {
                  // On Windows, open the file to ensure it's selected in explorer
                  vscode.workspace
                    .openTextDocument(vscode.Uri.file(firstFile))
                    .then(() => {
                      vscode.commands.executeCommand(
                        "revealFileInOS",
                        vscode.Uri.file(firstFile)
                      );
                    });
                } else {
                  // On Mac/Linux, direct reveal should work
                  vscode.commands.executeCommand(
                    "revealFileInOS",
                    vscode.Uri.file(firstFile)
                  );
                }
              } else {
                vscode.commands.executeCommand(
                  "revealFileInOS",
                  vscode.Uri.file(result.path)
                );
              }
            }
          });

        // Reload rules after initialization
        prhDescMap = loadPrhDescriptionMap();
        setupRulesFolderWatcher();
      } else {
        vscode.window.showErrorMessage(
          "Failed to initialize rules folder. Please check the path and permissions."
        );
      }
    }
  );

  // Diagnostics collection
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("smart-proofreader");
  context.subscriptions.push(diagnosticCollection);

  // Initialize status bar
  updateStatusBar();
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    checkFileDisposable,
    clearDiagnosticsDisposable,
    toggleDisposable,
    openRulesFolderDisposable,
    initRulesFolderDisposable
  );

  async function lintDocument(document) {
    // Check if this document should be checked
    if (!shouldCheckDocument(document)) {
      return;
    }

    const { TextLintEngine } = require("textlint");
    const path = require("path");

    // Use cached config instead of regenerating every time
    const cachedConfig = getCachedTextlintConfig();

    if (
      !cachedConfig ||
      !cachedConfig.rulePaths ||
      cachedConfig.rulePaths.length === 0
    ) {
      console.warn(
        "[DEBUG] No valid PRH rule files found, skipping lint process"
      );
      return;
    }

    console.log(
      `[DEBUG] Using cached config with ${cachedConfig.rulePaths.length} rule files`
    );

    // Create temporary config file (still needed for TextLintEngine)
    const timestamp = Date.now();
    const tempConfigPath = path.join(
      __dirname,
      `temp-textlint-config-lint-${timestamp}.js`
    );

    try {
      fs.writeFileSync(tempConfigPath, cachedConfig.configContent);

      const engine = new TextLintEngine({
        configFile: tempConfigPath,
      });
      const results = await engine.executeOnFiles([document.fileName]);

      // Delete temporary configuration file
      fs.unlinkSync(tempConfigPath);

      const diagnostics = [];
      if (results && results[0] && results[0].messages.length > 0) {
        console.log(`[DEBUG] Total messages from textlint: ${results[0].messages.length}`);
        
        for (const msg of results[0].messages) {
          console.log(`[DEBUG] Raw textlint message:`, {
            message: msg.message,
            line: msg.line,
            column: msg.column,
            range: msg.range,
            ruleId: msg.ruleId
          });
          
          // Skip messages that don't look like PRH corrections
          if (!msg.message || typeof msg.message !== 'string') {
            console.log(`[DEBUG] Skipping non-string message:`, msg.message);
            continue;
          }
          
          // Check if message matches the expected PRH format "original => expected"
          const match = /^(.*?) => (.*)$/.exec(msg.message.trim());
          if (!match) {
            console.log(`[DEBUG] Skipping message with unexpected format: "${msg.message}"`);
            continue;
          }
          
          let diagMsg = msg.message;
          // Add PRH description with source file information
          if (match) {
            const originalText = match[1];
            const expectedText = match[2];

            console.log(`[DEBUG] Looking for rule info for: "${originalText}"`);
            console.log(
              `[DEBUG] Available keys in prhDescMap:`,
              Object.keys(prhDescMap)
            );

            let ruleInfos = prhDescMap[originalText];

            // If direct match fails, try enhanced pattern matching
            if (!ruleInfos) {
              console.log(
                `[DEBUG] Direct match failed, trying enhanced matching for: "${originalText}"`
              );
              
              // Try partial matching - look for keys that are substrings of originalText
              for (const [key, infos] of Object.entries(prhDescMap)) {
                try {
                  // Method 1: Check stored pattern keys (complex regex patterns)
                  if (key.startsWith('__PATTERN__')) {
                    const patternStr = key.substring('__PATTERN__'.length);
                    console.log(`[DEBUG] Testing stored pattern: ${patternStr} against "${originalText}"`);
                    
                    // Extract regex from pattern string like /pattern/flags
                    const matches = patternStr.match(/^\/(.+?)\/([gimuy]*)$/);
                    if (matches) {
                      try {
                        const regexPattern = new RegExp(matches[1], matches[2]);
                        if (regexPattern.test(originalText)) {
                          console.log(
                            `[DEBUG] Stored pattern match found: "${patternStr}" matches "${originalText}"`
                          );
                          ruleInfos = infos;
                          break;
                        }
                      } catch (regexError) {
                        console.log(`[DEBUG] Error testing stored pattern "${patternStr}":`, regexError.message);
                      }
                    }
                    continue;
                  }
                  
                  // Method 2: Check if the key is contained in originalText
                  if (originalText.includes(key)) {
                    console.log(
                      `[DEBUG] Substring match found: "${key}" in "${originalText}"`
                    );
                    ruleInfos = infos;
                    break;
                  }
                  
                  // Method 3: Check if originalText is contained in key (reverse check)
                  if (key.includes(originalText)) {
                    console.log(
                      `[DEBUG] Reverse substring match found: "${originalText}" in "${key}"`
                    );
                    ruleInfos = infos;
                    break;
                  }
                  
                  // Method 4: Regex pattern matching for complex patterns
                  if (
                    key.includes("[") ||
                    key.includes("+") ||
                    key.includes("*") ||
                    key.includes("?") ||
                    key.includes("|")
                  ) {
                    const regexPattern = new RegExp(key, "g");
                    if (regexPattern.test(originalText)) {
                      console.log(
                        `[DEBUG] Regex pattern "${key}" matches "${originalText}"`
                      );
                      ruleInfos = infos;
                      break;
                    }
                  }
                } catch (e) {
                  // Ignore regex errors and continue
                  console.log(`[DEBUG] Error testing pattern "${key}":`, e.message);
                }
              }
            }

            if (ruleInfos && Array.isArray(ruleInfos)) {
              if (ruleInfos.length === 1) {
                // Single rule
                const ruleInfo = ruleInfos[0];
                diagMsg = `${originalText} => ${expectedText} [${ruleInfo.source}] (${ruleInfo.description} [${ruleInfo.source}])`;
              } else {
                // Multiple rules
                const expectedSources = ruleInfos
                  .map((info) => `${expectedText} [${info.source}]`)
                  .join(", ");
                const descSources = ruleInfos
                  .map((info) => `${info.description} [${info.source}]`)
                  .join(", ");
                diagMsg = `${originalText} => ${expectedSources} (${descSources})`;
              }
            } else {
              console.log(`[DEBUG] No rule info found for: "${originalText}"`);
            }
          }
          // Calculate the range to highlight the complete matched text
          let startPos = new vscode.Position(msg.line - 1, msg.column - 1);
          let endPos;
          let rangeLength = 1; // Default to 1 character

          console.log(
            `[DEBUG] Processing diagnostic message: "${msg.message}"`
          );
          console.log(`[DEBUG] msg.range:`, msg.range);
          console.log(
            `[DEBUG] msg.line: ${msg.line}, msg.column: ${msg.column}`
          );

          // Try to extract the original text from the message first (more reliable)
          const messageMatch = /^(.*?) => (.*)$/.exec(msg.message);
          if (messageMatch) {
            const originalText = messageMatch[1];
            const expectedText = messageMatch[2];
            
            // Skip diagnostics with empty or whitespace-only content on either side
            if (!originalText || originalText.trim() === '' || 
                !expectedText || expectedText.trim() === '') {
              console.log(`[DEBUG] Skipping diagnostic with empty content: "${msg.message}"`);
              continue;
            }
            
            // Skip diagnostics where original and expected are the same
            if (originalText.trim() === expectedText.trim()) {
              console.log(`[DEBUG] Skipping diagnostic with identical content: "${msg.message}"`);
              continue;
            }
            
            rangeLength = originalText.length;
            console.log(
              `[DEBUG] Extracted original text: "${originalText}", length: ${rangeLength}`
            );
          } else {
            // If message doesn't match expected format, skip this diagnostic
            console.log(`[DEBUG] Skipping diagnostic with unexpected format: "${msg.message}"`);
            continue;
          }

          // Ensure minimum range length of 1 to avoid zero-width diagnostics
          if (rangeLength <= 0) {
            rangeLength = 1;
            console.log(`[DEBUG] Adjusted range length to minimum: ${rangeLength}`);
          }

          endPos = new vscode.Position(
            msg.line - 1,
            msg.column - 1 + rangeLength
          );

          console.log(
            `[DEBUG] Final range: line ${msg.line - 1}, col ${
              msg.column - 1
            } to col ${msg.column - 1 + rangeLength}`
          );

          diagnostics.push(
            new vscode.Diagnostic(
              new vscode.Range(startPos, endPos),
              diagMsg,
              vscode.DiagnosticSeverity.Information
            )
          );
        }
      }
      diagnosticCollection.set(document.uri, diagnostics);
    } catch (e) {
      console.error("lintDocument execution error:", e);
      // Delete temporary file on error as well
      if (fs.existsSync(tempConfigPath)) {
        fs.unlinkSync(tempConfigPath);
      }
    }
  }

  // Auto-check on save (optional)
  const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
    const config = vscode.workspace.getConfiguration("smartProofreader");
    const checkOnSave = config.get("checkOnSave");

    if (checkOnSave) {
      lintDocument(document);
    }
  });
  context.subscriptions.push(saveDisposable);

  // Check when opening files (optional)
  const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
    const config = vscode.workspace.getConfiguration("smartProofreader");
    const checkOnSave = config.get("checkOnSave");

    if (checkOnSave) {
      lintDocument(document);
    }
  });
  context.subscriptions.push(openDisposable);


  // Check active editor on startup (optional)
  if (vscode.window.activeTextEditor) {
    const config = vscode.workspace.getConfiguration("smartProofreader");
    const checkOnSave = config.get("checkOnSave");

    if (checkOnSave) {
      lintDocument(vscode.window.activeTextEditor.document);
    }
  }

  // Monitor configuration changes
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("smartProofreader.rulesFolder")) {
        console.log(
          "Smart Proofreader rules folder setting changed. Reloading rules..."
        );
        // Clear cache when rules folder path changes
        cachedRulesConfig = null;
        cachedRulesTimestamp = null;
        prhDescMap = loadPrhDescriptionMap();
        setupRulesFolderWatcher();
        console.log("[DEBUG] Cache cleared due to rules folder path change");
      }
      if (e.affectsConfiguration("smartProofreader.enabledFileTypes")) {
        console.log(
          "File type settings changed, re-checking current documents..."
        );
        // Re-check current active document
        if (vscode.window.activeTextEditor) {
          lintDocument(vscode.window.activeTextEditor.document);
        }
        // Re-check all open documents
        vscode.workspace.textDocuments.forEach((document) => {
          lintDocument(document);
        });
      }
      if (e.affectsConfiguration("smartProofreader.checkOnSave")) {
        console.log("Check on save setting changed, updating status bar...");
        updateStatusBar();
      }
    }
  );
  context.subscriptions.push(configChangeDisposable);
}

// Clean up temporary rule files
function cleanupTempFiles() {
  try {
    const tempDir = path.join(__dirname, 'temp-rules');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`[DEBUG] Cleaned up temp file: ${file}`);
        } catch (deleteError) {
          console.warn(`[WARN] Failed to delete temp file ${file}:`, deleteError.message);
        }
      });
      
      // Try to remove the directory if empty
      try {
        fs.rmdirSync(tempDir);
        console.log(`[DEBUG] Cleaned up temp directory: ${tempDir}`);
      } catch (dirError) {
        // Directory not empty or other error, ignore
      }
    }
  } catch (error) {
    console.warn("[WARN] Error during temp files cleanup:", error.message);
  }
}

// This method is called when your extension is deactivated
function deactivate() {
  // Clean up all folder watchers
  folderWatchers.forEach((watcher) => {
    if (watcher) {
      watcher.close();
    }
  });
  folderWatchers = [];
  
  // Clean up temporary files
  cleanupTempFiles();
}

module.exports = {
  activate,
  deactivate,
};
