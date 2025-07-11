// The 'vscode' module contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { TextLintEngine } = require("textlint");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
let prhDescMap;
let statusBarItem;

// Status bar functions
function updateStatusBar() {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const checkOnSave = config.get("checkOnSave");
  
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    statusBarItem.command = "smartProofreader.toggle";
  }
  
  if (checkOnSave) {
    statusBarItem.text = "$(check-all) Smart Proofreader: ON";
    statusBarItem.tooltip = "Smart Proofreader is enabled (Click to disable)";
    statusBarItem.backgroundColor = undefined;
  } else {
    statusBarItem.text = "$(circle-slash) Smart Proofreader: OFF";
    statusBarItem.tooltip = "Smart Proofreader is disabled (Click to enable)";
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }
  
  statusBarItem.show();
}

// File type mappings
const FILE_TYPE_MAPPINGS = {
  plaintext: ['.txt'],
  markdown: ['.md', '.markdown'],
  html: ['.html', '.htm'],
  latex: ['.tex'],
  javascript: ['.js', '.jsx'],
  typescript: ['.ts', '.tsx'],
  vue: ['.vue'],
  json: ['.json']
};

function isFileTypeEnabled(languageId) {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const setting = config.get(`enabledFileTypes.${languageId}`);
  console.log(`[DEBUG] Checking file type ${languageId}: setting value = ${setting}`);
  
  // If setting is undefined, use default value true
  if (setting === undefined) {
    console.log(`[DEBUG] File type ${languageId} setting undefined, using default true`);
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
  return extensions.some(ext => fileName.endsWith(ext));
}

function getAllRulesFolders() {
  const config = vscode.workspace.getConfiguration("smartProofreader");
  const userRulesFolder = config.get("rulesFolder");
  const folders = [];

  // Default rules folder is always checked
  const defaultPath = path.resolve(__dirname, "./prh-rules");
  folders.push(defaultPath);
  console.log(`[DEBUG] Default rules folder: ${defaultPath}`);

  // If user configured a rules folder, also check it
  if (userRulesFolder && userRulesFolder.trim()) {
    const resolvedPath = path.resolve(userRulesFolder.trim());
    // Avoid adding duplicate paths
    if (resolvedPath !== defaultPath) {
      folders.push(resolvedPath);
      console.log(`[DEBUG] User rules folder: ${resolvedPath}`);
    }
  }

  console.log(`[DEBUG] All rules folders:`, folders);
  return folders;
}

function getRulesFolder() {
  // Maintain backward compatibility, return first folder (default folder)
  return getAllRulesFolders()[0];
}

function loadPrhDescriptionMap() {
  const rulesFolders = getAllRulesFolders();
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
        console.warn(
          `No yml files found in PRH rules folder: ${rulesFolder}`
        );
        return;
      }

      totalFiles += files.length;

      files.forEach((filename) => {
        const filePath = path.join(rulesFolder, filename);
        // Check if it's the default rules folder
        const defaultPath = path.resolve(__dirname, "./prh-rules");
        const isDefaultFolder = rulesFolder === defaultPath;
        const sourceLabel = isDefaultFolder ? "default" : filename;
        
        try {
          const doc = yaml.load(fs.readFileSync(filePath, "utf8"));
          const rules =
            doc && typeof doc === "object" && "rules" in doc
              ? doc.rules
              : undefined;

          if (Array.isArray(rules)) {
            rules.forEach((rule) => {
              if (rule.specs) {
                // Old format: when specs are present
                rule.specs.forEach((spec) => {
                  if (spec.from && spec.description) {
                    if (!map[spec.from]) {
                      map[spec.from] = [];
                    }
                    map[spec.from].push({
                      description: spec.description,
                      source: sourceLabel,
                      expected: spec.to || rule.expected
                    });
                    totalRules++;
                  }
                });
              } else if (rule.description && rule.pattern) {
                // New format: when specs are not present, extract candidates from pattern
                const patternStr = rule.pattern.toString();
                // Extract choices from regex (e.g., from /VScode|VSCode|vscode/ get VScode, VSCode, vscode)
                const matches = patternStr.match(/\/(.+?)\//);
                if (matches && matches[1]) {
                  const alternatives = matches[1].split("|");
                  alternatives.forEach((alt) => {
                    // Remove regex special characters
                    const cleanAlt = alt.replace(/[()]/g, "");
                    if (cleanAlt && cleanAlt !== rule.expected) {
                      if (!map[cleanAlt]) {
                        map[cleanAlt] = [];
                      }
                      map[cleanAlt].push({
                        description: rule.description,
                        source: sourceLabel,
                        expected: rule.expected
                      });
                      totalRules++;
                    }
                  });
                }
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

function setupRulesFolderWatcher() {
  // Clean up old watchers
  folderWatchers.forEach(watcher => {
    if (watcher) {
      watcher.close();
    }
  });
  folderWatchers = [];

  const rulesFolders = getAllRulesFolders();

  rulesFolders.forEach((rulesFolder) => {
    if (fs.existsSync(rulesFolder)) {
      try {
        const watcher = fs.watch(rulesFolder, (eventType, filename) => {
          if (
            filename &&
            (filename.endsWith(".yml") || filename.endsWith(".yaml"))
          ) {
            console.log(`PRH rules file changed: ${filename} in ${rulesFolder}`);
            prhDescMap = loadPrhDescriptionMap();
          }
        });
        folderWatchers.push(watcher);
        console.log(`Watching PRH rules folder: ${rulesFolder}`);
      } catch (e) {
        console.error(`Failed to set up folder watcher: ${rulesFolder}`, e);
      }
    } else {
      console.warn(`PRH rules folder does not exist, skipping watch: ${rulesFolder}`);
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
        vscode.window.showWarningMessage(
          "Please open a file to check."
        );
        return;
      }

      if (!shouldCheckDocument(editor.document)) {
        vscode.window.showInformationMessage(
          `File type '${editor.document.languageId}' is not enabled for checking or not supported.`
        );
        return;
      }

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
        await config.update("checkOnSave", newSetting, vscode.ConfigurationTarget.Workspace);
        
        if (newSetting) {
          vscode.window.showInformationMessage("Smart Proofreader: Auto check enabled");
          // Check current document if enabled
          if (vscode.window.activeTextEditor) {
            lintDocument(vscode.window.activeTextEditor.document);
          }
        } else {
          vscode.window.showInformationMessage("Smart Proofreader: Auto check disabled");
          // Clear diagnostics when disabled
          diagnosticCollection.clear();
        }
        
        updateStatusBar();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to toggle Smart Proofreader: ${error.message}`);
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

  context.subscriptions.push(checkFileDisposable, clearDiagnosticsDisposable, toggleDisposable);

  async function lintDocument(document) {
    // Check if this document should be checked
    if (!shouldCheckDocument(document)) {
      return;
    }
    
    const { TextLintEngine } = require("textlint");
    const path = require("path");

    // Dynamically set PRH rules paths - all rules folders
    const rulesFolders = getAllRulesFolders();
    const ymlFiles = [];

    rulesFolders.forEach((rulesFolder) => {
      if (fs.existsSync(rulesFolder)) {
        const files = fs
          .readdirSync(rulesFolder)
          .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
        files.forEach((file) => {
          ymlFiles.push(path.join(rulesFolder, file));
        });
      }
    });

    console.log(`[DEBUG] lintDocument PRH files for (${document.languageId}):`, ymlFiles);

    // Dynamically generate configuration file
    const tempConfigPath = path.join(__dirname, 'temp-textlint-config-lint.js');
    const configContent = `
module.exports = {
  rules: {
    prh: {
      rulePaths: ${JSON.stringify(ymlFiles.length > 0 ? ymlFiles : [path.resolve(__dirname, './prh-rules/prh.yml')])},
    },
  },
};`;

    try {
      fs.writeFileSync(tempConfigPath, configContent);
      
      const engine = new TextLintEngine({
        configFile: tempConfigPath,
      });
      const results = await engine.executeOnFiles([document.fileName]);
      
      // Delete temporary configuration file
      fs.unlinkSync(tempConfigPath);
      
      const diagnostics = [];
      if (results && results[0] && results[0].messages.length > 0) {
        for (const msg of results[0].messages) {
          let diagMsg = msg.message;
          // Add PRH description with source file information
          const match = /^(.*?) => (.*)$/.exec(msg.message);
          if (match && prhDescMap[match[1]]) {
            const ruleInfos = prhDescMap[match[1]];
            if (Array.isArray(ruleInfos)) {
              if (ruleInfos.length === 1) {
                // Single rule
                const ruleInfo = ruleInfos[0];
                diagMsg = `${match[1]} => ${ruleInfo.expected} [${ruleInfo.source}] (${ruleInfo.description} [${ruleInfo.source}])`;
              } else {
                // Multiple rules
                const expectedSources = ruleInfos.map(info => `${info.expected} [${info.source}]`).join(', ');
                const descSources = ruleInfos.map(info => `${info.description} [${info.source}]`).join(', ');
                diagMsg = `${match[1]} => ${expectedSources} (${descSources})`;
              }
            }
          }
          diagnostics.push(
            new vscode.Diagnostic(
              new vscode.Range(
                new vscode.Position(msg.line - 1, msg.column - 1),
                new vscode.Position(
                  msg.line - 1,
                  msg.column -
                    1 +
                    (msg.range && msg.range[1] ? msg.range[1] - msg.range[0] : 1)
                )
              ),
              diagMsg,
              vscode.DiagnosticSeverity.Information
            )
          );
        }
      }
      diagnosticCollection.set(document.uri, diagnostics);
    } catch (e) {
      console.error('lintDocument execution error:', e);
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
        prhDescMap = loadPrhDescriptionMap();
        setupRulesFolderWatcher();
      }
      if (e.affectsConfiguration("smartProofreader.enabledFileTypes")) {
        console.log("File type settings changed, re-checking current documents...");
        // Re-check current active document
        if (vscode.window.activeTextEditor) {
          lintDocument(vscode.window.activeTextEditor.document);
        }
        // Re-check all open documents
        vscode.workspace.textDocuments.forEach(document => {
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

// This method is called when your extension is deactivated
function deactivate() {
  // Clean up all folder watchers
  folderWatchers.forEach(watcher => {
    if (watcher) {
      watcher.close();
    }
  });
  folderWatchers = [];
}

module.exports = {
  activate,
  deactivate,
};
