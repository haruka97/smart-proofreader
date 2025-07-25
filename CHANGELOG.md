# Change Log

All notable changes to the "Smart Proofreader" extension will be documented in this file.

## [0.1.9] - 2025-07-25

### 🚨 Critical Complex Regex Pattern Support

#### **Fixed Complex Regular Expression Diagnostic Display**
- **Issue**: Complex regex patterns with advanced features not displaying diagnostic information
- **User Report**: Rules with negative lookahead, quantifiers, and complex patterns showed no rule source or description
- **Root Cause**: Pattern parsing logic only handled simple string literals, failed on advanced regex syntax
- **Impact**: Many sophisticated PRH rules were not providing complete user feedback

#### **Specific Pattern Types Fixed**
- **Negative Lookahead**: `(?<!prefix\s)` patterns now fully supported
- **Non-capturing Groups**: `(?:...)` patterns correctly matched
- **Quantifiers**: `{2,}`, `+`, `*` patterns now work with diagnostics
- **Complex Alternatives**: Multi-level `|` patterns with nested groups
- **Unicode Patterns**: Japanese character patterns with advanced regex features

#### **Examples of Fixed Rules**
```yaml
# Complex pattern with negative lookahead - NOW WORKS
- expected: Correct Term
  pattern: /(?<!Prefix\s)(?:Term\s*(?:Variant1|Variant2)|Alternative\s*表記)/
  description: 正しい表記を使用してください

# Consecutive punctuation rules - NOW WORK
- expected: "、"
  pattern: /、{2,}/
  description: 連続使用は避けてください

- expected: "。"
  pattern: /。{2,}/
  description: 連続使用は避けてください
```

#### **Advanced Pattern Storage System**
- **Dual Storage Strategy**: Store both simplified and complex pattern representations
- **Pattern Key System**: Use `__PATTERN__` prefix for complex regex patterns
- **Runtime Pattern Matching**: Test actual regex patterns against detected text
- **Fallback Mechanisms**: Multiple matching strategies ensure maximum coverage

#### **Technical Implementation**
```javascript
// New complex pattern storage
const patternKey = `__PATTERN__${patternStr}`;
map[patternKey].push({
  description: rule.description,
  source: sourceLabel,
  expected: rule.expected,
  originalPattern: patternStr
});

// Enhanced diagnostic matching
if (key.startsWith('__PATTERN__')) {
  const matches = patternStr.match(/^\/(.+?)\/([gimuy]*)$/);
  const regexPattern = new RegExp(matches[1], matches[2]);
  if (regexPattern.test(originalText)) {
    ruleInfos = infos; // Match found
  }
}
```

### 🎯 User Experience Improvements

#### **Comprehensive Pattern Support**
- **Before**: Only simple literal patterns showed diagnostic information
- **After**: All regex pattern types display complete rule details
- **Coverage**: Supports negative assertions, quantifiers, groups, alternatives

#### **Specific Issue Resolutions**
- **Complex Pattern Terms**: Negative lookahead patterns ✅
- **Consecutive Punctuation**: Quantifier patterns (`{2,}`) ✅
- **Advanced Unicode**: Japanese text with complex regex features ✅
- **Nested Patterns**: Multi-level grouping and alternatives ✅

### 🔧 Technical Enhancements

#### **Multi-Tier Matching Algorithm**
1. **Direct Match**: Exact key lookup (fastest for simple cases)
2. **Pattern Match**: Complex regex pattern evaluation
3. **Substring Match**: Partial text matching
4. **Reverse Match**: Contained text matching
5. **Legacy Match**: Simple regex patterns

#### **Performance Optimizations**
- **Pattern Caching**: Compiled regex patterns cached for performance
- **Early Termination**: Loop breaks on first successful match
- **Error Resilience**: Regex compilation errors don't break matching
- **Debug Logging**: Comprehensive matching trace for troubleshooting

#### **Backward Compatibility**
- **Zero Breaking Changes**: All existing simple patterns continue working
- **Enhanced Coverage**: Only adds new matching capabilities
- **Pattern Migration**: Automatic handling of both old and new pattern formats
- **Performance Preservation**: Simple patterns maintain fast direct lookup

### 📊 Pattern Coverage Statistics

#### **Supported Regex Features**
- ✅ **Literals**: `/word/`, `/text/`
- ✅ **Alternatives**: `/opt1|opt2|opt3/`
- ✅ **Quantifiers**: `/word{2,}/`, `/char+/`, `/item*/`
- ✅ **Groups**: `/(group1|group2)/`, `/(?:non-capture)/`
- ✅ **Assertions**: `/(?<!negative)/`, `/(?=positive)/`
- ✅ **Character Classes**: `/[abc]/`, `/\w+/`, `/\s*/`
- ✅ **Flags**: `/pattern/gi`, `/pattern/imu`
- ✅ **Unicode**: `/[\u3000-\u3fff]/`, `/[ぁ-ん]/`

This comprehensive regex support ensures that sophisticated PRH rules now provide complete diagnostic information, significantly improving the user experience for complex language checking scenarios.

## [0.1.8] - 2025-07-25

### 🚨 Critical Robustness Fix: Invalid Rule Handling

#### **Fixed Complete System Failure on Invalid Rules**
- **Issue**: Single invalid rule in any rule file would cause all proofreading to stop working
- **User Report**: Rules with syntax like `pattern: ?` without proper regex format broke entire extension
- **Root Cause**: No error handling for malformed rules - one bad rule killed all functionality
- **Impact**: Users lost all proofreading capabilities when any rule file contained errors

#### **Comprehensive Error Handling System**
- **Rule-Level Protection**: Each individual rule wrapped in try-catch blocks
- **Spec-Level Protection**: Individual rule specs handled separately with error isolation  
- **Pattern Validation**: Pre-validation of regex patterns before processing
- **Graceful Degradation**: Invalid rules are skipped while valid rules continue to work

#### **Technical Implementation**
```javascript
// Multi-layer error handling
rules.forEach((rule, index) => {
  try {
    // Rule processing with validation
    if (patternStr.startsWith('/') && patternStr.endsWith('/')) {
      const testPattern = patternStr.slice(1, -1);
      new RegExp(testPattern); // Validate regex before use
    }
    // Process valid rule...
  } catch (ruleError) {
    console.warn(`[WARN] Skipping invalid rule ${index + 1}:`, ruleError.message);
    // Continue with next rule instead of crashing
  }
});
```

#### **Enhanced Error Reporting**
- **Detailed Warnings**: Specific rule index and filename for easy debugging
- **Pattern Validation**: Clear messages for invalid regex patterns
- **Spec-Level Reporting**: Individual spec errors within multi-spec rules
- **Non-Breaking Logs**: Warnings logged without stopping execution

### 🛡️ Robustness Improvements

#### **Fault Isolation**
- **Rule Independence**: Invalid rules don't affect valid rules in same file
- **File Independence**: Invalid rules in one file don't affect other files
- **Spec Independence**: Invalid specs don't affect other specs in same rule
- **Alternative Independence**: Invalid alternatives don't affect other alternatives

#### **Validation Layers**
1. **File Level**: YAML parsing errors isolated per file
2. **Rule Level**: Individual rule structure validation
3. **Pattern Level**: Regex pattern syntax validation
4. **Spec Level**: Individual spec validation within rules
5. **Alternative Level**: Multi-alternative pattern validation

#### **Error Categories Handled**
- **Invalid Regex Patterns**: `pattern: ?`, `pattern: /[/`, etc.
- **Missing Required Fields**: Rules without `pattern` or `expected`
- **Malformed YAML**: Syntax errors in rule files
- **Pattern Processing Errors**: Complex regex parsing failures
- **Spec Structure Errors**: Invalid spec formats

### 🎯 User Experience Enhancement

#### **Continuous Operation**
- **Before**: One bad rule = complete system failure
- **After**: Invalid rules skipped, valid rules continue working normally
- **Reliability**: Extension remains functional even with rule file errors
- **Productivity**: Users can continue working while fixing rule issues

#### **Better Debugging**
- **Specific Error Messages**: Exact rule and file location for issues
- **Non-Intrusive Warnings**: Errors logged to console without user interruption
- **Easy Identification**: Clear rule indexing for quick problem location
- **Helpful Context**: Full rule content included in error messages

### 🔧 Technical Benefits

#### **System Stability**
- **No More Crashes**: Extension continues running despite rule errors
- **Graceful Degradation**: Partial functionality better than complete failure
- **Error Isolation**: Problems contained to specific rules/files
- **Recovery Capability**: Fixed rules automatically work on next file change

#### **Development Friendly**
- **Rule Testing**: Can test experimental rules without breaking system
- **Incremental Development**: Add rules progressively without risk
- **Error Feedback**: Clear indication of what needs fixing
- **Hot Reloading**: Fixed rules work immediately via file watching

This fix transforms the extension from brittle (one error breaks everything) to robust (errors are isolated and handled gracefully), significantly improving reliability for users with complex rule sets.

## [0.1.7] - 2025-07-25

### 🚨 Critical Diagnostic Matching Fix

#### **Fixed Missing Diagnostic Information Issue**
- **Issue**: Some PRH rules were not displaying diagnostic information despite being detected by TextLint
- **User Report**: Some specific rules were not showing source info, while others worked fine
- **Root Cause**: Rigid exact-match logic failed when TextLint output didn't perfectly match rule mapping keys
- **Impact**: Users missed important rule source information and descriptions for many valid detections

#### **Enhanced Pattern Matching System**
- **Multi-Layer Matching**: Implemented intelligent 3-tier matching algorithm
- **Substring Matching**: Rules now match when key is contained in detected text
- **Reverse Matching**: Handles cases where detected text is contained in rule key
- **Regex Pattern Support**: Improved handling of complex regular expression patterns

#### **Technical Implementation**
```javascript
// Enhanced matching logic
if (!ruleInfos) {
  for (const [key, infos] of Object.entries(prhDescMap)) {
    // Method 1: Substring matching
    if (originalText.includes(key)) {
      ruleInfos = infos;
      break;
    }
    
    // Method 2: Reverse substring matching
    if (key.includes(originalText)) {
      ruleInfos = infos;
      break;
    }
    
    // Method 3: Enhanced regex pattern matching
    if (key.includes("|") || key.includes("[") || ...) {
      const regexPattern = new RegExp(key, "g");
      if (regexPattern.test(originalText)) {
        ruleInfos = infos;
        break;
      }
    }
  }
}
```

#### **Debug Logging Enhanced**
- **Substring Match Logs**: `"[DEBUG] Substring match found: \"key\" in \"originalText\""`
- **Reverse Match Logs**: `"[DEBUG] Reverse substring match found: \"originalText\" in \"key\""`
- **Pattern Match Logs**: `"[DEBUG] Regex pattern \"key\" matches \"originalText\""`
- **Error Handling**: Graceful handling of regex pattern errors with detailed logging

### 🎯 User Experience Improvements

#### **Comprehensive Rule Coverage**
- **Before**: Only exact matches showed diagnostic information
- **After**: Partial matches, contained text, and complex patterns all display full diagnostic info
- **Coverage**: Significantly increased number of rules showing complete source information

#### **Specific Issue Resolutions**
- **Japanese Terms**: Now displays diagnostic information with rule source ✅
- **Partial Matches**: Now shows complete rule description and source ✅  
- **English Terms**: Terms with spaces now handled correctly ✅
- **Complex Patterns**: Multi-alternative patterns (e.g., `/option1|option2|option3/`) now work ✅

### 🔧 Technical Details

#### **Matching Algorithm Priority**
1. **Direct Match**: Exact key match (fastest, maintains existing behavior)
2. **Substring Match**: Key contained in detected text (handles partial matches)
3. **Reverse Match**: Detected text contained in key (handles expanded forms)
4. **Regex Match**: Complex pattern matching with error handling

#### **Performance Optimization**
- **Early Break**: Loop terminates immediately upon first successful match
- **Error Resilience**: Regex errors don't crash the matching process
- **Maintain Speed**: Direct matches still use fast hash lookup

#### **Backward Compatibility**
- **Zero Breaking Changes**: All existing exact matches continue to work
- **Enhanced Coverage**: Only adds new matching capabilities
- **Preserved Behavior**: CloudWatch Events and other working rules unchanged

This fix resolves the diagnostic information gap that was causing users to miss important rule context for many valid PRH rule detections.

## [0.1.6] - 2025-07-17

### 🚨 Critical Cache Issue Fix

#### **Fixed Configuration Change Cache Bug**
- **Issue**: Rules folder path changes in marketplace version required VS Code restart to take effect
- **Root Cause**: Cache was not being cleared when configuration changed, causing old textlint config to persist
- **User Impact**: Debug mode worked correctly, but packaged extension needed restart for new rule paths
- **Solution**: Added comprehensive cache clearing logic to all relevant operations

#### **Enhanced Cache Invalidation System**
- **Rule File Changes**: Cache cleared when rule files are modified (existing + enhanced logging)
- **Rules Folder Path Changes**: Cache cleared when user changes rules folder setting (NEW)
- **Manual Extension Disable**: Cache cleared when user toggles extension off (NEW)

#### **Technical Implementation**
```javascript
// Added to configuration change listener
if (e.affectsConfiguration("smartProofreader.rulesFolder")) {
  cachedRulesConfig = null;        // Clear cached config
  cachedRulesTimestamp = null;     // Clear timestamp cache
  // ... existing logic
  console.log("[DEBUG] Cache cleared due to rules folder path change");
}

// Added to toggle command (disable branch)
} else {
  diagnosticCollection.clear();
  cachedRulesConfig = null;        // Clear cached config  
  cachedRulesTimestamp = null;     // Clear timestamp cache
  console.log("[DEBUG] Cache cleared due to manual disable");
}
```

#### **Debug Logging Enhanced**
- **File Change Logs**: `"[DEBUG] Cache cleared due to rule file change"`
- **Path Change Logs**: `"[DEBUG] Cache cleared due to rules folder path change"`
- **Manual Disable Logs**: `"[DEBUG] Cache cleared due to manual disable"`

### 🎯 User Experience Improvements

#### **Immediate Configuration Response**
- **Before**: Rules folder path changes required VS Code restart in marketplace version
- **After**: Changes take effect immediately, matching debug mode behavior
- **Consistency**: Debug and marketplace versions now behave identically

#### **Enhanced Reliability**
- **Smart Cache Management**: Cache invalidation occurs at all appropriate points
- **Real-time Updates**: All configuration changes now reflect immediately
- **Better Debugging**: Enhanced logging helps diagnose cache-related issues

### 🔧 Technical Details

#### **Cache Clearing Triggers**
1. **File System Changes**: Rule files modified/added/deleted (existing)
2. **Configuration Changes**: Rules folder path modified (NEW)
3. **Extension State Changes**: Manual disable via status bar (NEW)

#### **Cache Lifecycle**
- **Cache Hit**: Valid cache used for faster performance
- **Cache Miss**: New config generated when cache invalid or cleared
- **Cache Clear**: Forced invalidation on relevant user actions
- **Cache Rebuild**: Automatic regeneration on next lint operation

This fix resolves the inconsistency between development and production environments, ensuring seamless rule management across all deployment scenarios.

## [0.1.4] - 2025-07-14

### 🚨 Critical Path Resolution Fix

#### **Fixed Marketplace Version Issue** 
- **User Report**: Extension versions 0.0.7+ not working in marketplace, but 0.0.6 and earlier work fine
- **Root Cause**: Inconsistent path resolution between development and packaged environments
- **Impact**: All marketplace users affected since v0.0.7

#### **Path Resolution Inconsistencies Fixed**
- **Problem 1**: Mixed use of `__dirname` and `context.extensionPath` in different parts of code
- **Problem 2**: `loadPrhDescriptionMap()` used old `__dirname` path resolution  
- **Problem 3**: `getCachedTextlintConfig()` fallback used outdated path resolution
- **Result**: Default rules folder could not be found in packaged extensions

#### **Technical Fixes Applied**
```javascript
// Fixed in loadPrhDescriptionMap()
const extensionPath = extensionContext ? extensionContext.extensionPath : __dirname;
const defaultPath = path.join(extensionPath, "prh-rules");

// Fixed in getCachedTextlintConfig() 
const extensionPath = extensionContext ? extensionContext.extensionPath : __dirname;
const defaultRulePath = path.join(extensionPath, "prh-rules", "prh.yml");
```

#### **Dependency Optimization**
- **Fixed Version Ranges**: Removed `^` prefixes to ensure consistent versions across environments
- **Added Missing Dependencies**: 
  - `@textlint/kernel`: Core textlint functionality
  - `@textlint/textlint-plugin-text`: Text processing plugin
- **Version Lock**: All dependencies now use exact versions for reliability

### 🔧 Complete Path Standardization

#### **Consistent Context Usage**
- All path resolution now uses `extensionContext.extensionPath` when available
- Proper fallback to `__dirname` for development environment
- Eliminated mixed path resolution approaches

#### **Validated Locations Fixed**
- `getAllRulesFolders()` ✅ Already fixed in v0.1.2
- `loadPrhDescriptionMap()` ✅ Fixed in v0.1.4  
- `getCachedTextlintConfig()` ✅ Fixed in v0.1.4
- `setupRulesFolderWatcher()` ✅ Already fixed in v0.1.2

### 📦 Production Readiness

#### **Marketplace Compatibility**
- ✅ **Default Rules Loading**: Built-in PRH rules now accessible in packaged extensions
- ✅ **Path Resolution**: Consistent behavior between development and production
- ✅ **Dependency Stability**: Fixed version dependencies prevent runtime errors
- ✅ **Cross-Platform**: Windows, Mac, Linux all supported in packaged form

This fix should restore full functionality to marketplace versions 0.0.7+ by ensuring consistent path resolution and dependency management.

## [0.1.3] - 2025-07-14

### 🔧 Stability Fix: Real-Time Feature Rollback

#### **Removed Real-Time Checking**
- **Issue**: Real-time checking feature causing compatibility problems in production environment
- **User Feedback**: Marketplace version still not working properly despite previous fixes
- **Decision**: Temporarily remove real-time checking to ensure core functionality works
- **Impact**: Extension now uses only stable checking methods

#### **Reverted to Stable Checking Mode**
- **Save-triggered checking**: ✅ Retained (works reliably)
- **Manual checking**: ✅ Retained (user-initiated via command)
- **Open file checking**: ✅ Retained (when files are opened)
- **Real-time checking**: ❌ Removed (was causing issues)

#### **Technical Changes**
```javascript
// Removed this entire section:
// const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
//   // Real-time checking logic
// });
```

#### **User Experience Impact**
- **More Stable**: Reduced chance of runtime errors in packaged extension
- **Reliable Core**: All essential functionality preserved
- **Performance**: Potentially better performance without continuous text monitoring
- **Backward Compatible**: No breaking changes to existing workflows

#### **Checking Methods Available**
1. **Manual Check**: `Ctrl+Shift+P` → "Smart Proofreader: Check This File"
2. **Save Check**: Automatically checks when saving files (if enabled)
3. **Open File Check**: Checks files when they are opened
4. **Toggle Control**: Status bar button to enable/disable checking

### 📝 Rationale
Real-time checking was a recent addition that may have introduced instability in certain environments. By reverting to the proven, stable checking methods, we ensure the extension works reliably for all users while we investigate the underlying issues with real-time functionality.

## [0.1.2] - 2025-07-14

### 🚨 Critical Production Bug Fixes

#### **Fixed Packaged Extension Issues**
- **Issue**: Extension published to marketplace was not working - no checking functionality and no setup prompt
- **Root Cause**: Path resolution problems in packaged extensions vs development environment
- **Impact**: All marketplace users were affected, extension was completely non-functional

#### **Path Resolution Fix**
- **Problem**: Used `__dirname` which points to different locations in packaged vs development environment
- **Solution**: Implemented `context.extensionPath` for proper packaged extension path resolution
- **Result**: Default rules folder now correctly found in packaged extensions

#### **Function Parameter Updates**
- **Enhanced**: `getAllRulesFolders()` now accepts context parameter for proper path resolution
- **Fixed**: Updated all function calls to pass `extensionContext` parameter
- **Improved**: Added global `extensionContext` variable for consistent access across functions

#### **Debug Logging Enhanced**
- **Added**: Comprehensive path debugging information
- **Logging**: Extension path, default path existence, and folder detection status
- **Troubleshooting**: Better error reporting for path-related issues

### 🔧 Technical Implementation

```javascript
// Before (broken in packaged extension)
const defaultPath = path.resolve(__dirname, "./prh-rules");

// After (works in both development and packaged)
const extensionPath = context ? context.extensionPath : __dirname;
const defaultPath = path.join(extensionPath, "prh-rules");
```

#### **Fixed Functions**
- `getAllRulesFolders(context)` - Now properly resolves paths in packaged extensions
- `loadPrhDescriptionMap()` - Uses correct context-aware path resolution
- `getRulesTimestamp()` - Cache system works with correct paths
- `getCachedTextlintConfig()` - Caching now functional in production
- `setupRulesFolderWatcher()` - File watching works in packaged extensions

### 🎯 Production Impact

#### **Resolved Issues**
- ✅ **Default rules loading**: Built-in PRH rules now work in marketplace version
- ✅ **Setup prompt display**: First-time user experience now functional
- ✅ **File checking**: All proofreading functionality restored
- ✅ **Path detection**: Cross-platform path handling fixed for packaged extensions

#### **User Experience**
- **Immediate Fix**: Marketplace users can now use the extension properly
- **Setup Process**: Welcome prompt appears correctly for new installations
- **Rule Loading**: Default rules load automatically without user configuration
- **Cross-Platform**: Works correctly on Windows, Mac, and Linux in packaged form

### 📦 Packaging Considerations

#### **Development vs Production**
- **Development**: Uses `__dirname` pointing to source directory
- **Production**: Uses `context.extensionPath` pointing to installed extension directory
- **Compatibility**: Code now works seamlessly in both environments

This fix resolves the critical production issue where the extension appeared to install but provided no functionality to marketplace users.

## [0.1.1] - 2025-07-14

### 🚀 Performance Optimization: Rules Caching System

#### **Major Performance Issue Fixed**
- **Issue**: Extension became slow when users had many rule files, especially with real-time checking
- **Root Cause**: Every `lintDocument` call was re-reading all rule files from disk
- **Impact**: Each check (every 500ms in real-time mode) caused unnecessary file I/O operations

#### **Smart Caching Implementation**
- **File Timestamp Tracking**: Monitor modification times of all rule files
- **Intelligent Cache Invalidation**: Only reload when files actually change
- **Memory Optimization**: Cache textlint configuration to avoid repeated generation
- **Zero Cache Overhead**: Cache clears automatically when rules are modified

#### **Technical Implementation**

```javascript
// New caching functions
function getRulesTimestamp() {
  // Get latest modification time across all rule files
}

function getCachedTextlintConfig() {
  if (cachedRulesConfig && cachedRulesTimestamp === currentTimestamp) {
    return cachedRulesConfig; // Use cache
  }
  // Generate new config only when needed
}
```

#### **Performance Improvements**
- **Eliminated Redundant I/O**: No more reading rule files on every check
- **Faster Real-time Checking**: Dramatically reduced 500ms debounce processing time
- **Scalable Architecture**: Performance stays constant regardless of rule file count
- **Smart File Watching**: Cache invalidation integrated with existing file watchers

#### **User Experience Benefits**
- **Instant Response**: Real-time checking now truly instantaneous
- **Heavy Rule Sets**: Supports large numbers of rule files without slowdown
- **Background Efficiency**: No noticeable performance impact during typing
- **Resource Friendly**: Reduced CPU and disk usage

### 🔧 Technical Details

#### **Cache Lifecycle**
1. **Cache Miss**: First check or after file modification
2. **Cache Hit**: Subsequent checks use cached configuration
3. **Auto-Invalidation**: File watcher clears cache when rules change
4. **Memory Management**: Proper cleanup prevents memory leaks

#### **Compatibility**
- **Zero Breaking Changes**: All existing functionality preserved
- **Transparent Optimization**: Users see only performance improvements
- **File Watching**: Enhanced integration with existing rule monitoring
- **Cross-Platform**: Optimizations work on Windows, Mac, and Linux

## [0.1.0] - 2025-07-14

### 🚀 Major Feature: Real-Time Proofreading

#### **Added True Real-Time Checking**
- **Issue**: Mac users reported only manual save triggered checking, no real-time proofreading
- **Root Cause**: Extension only checked on save/open events, not during text editing
- **Solution**: Added `onDidChangeTextDocument` listener with intelligent debouncing
- **Result**: All users now get genuine real-time proofreading while typing

#### **Smart Debouncing System**
- **Debounce Delay**: 500ms after user stops typing before checking
- **Performance Optimized**: Prevents excessive checking during active typing
- **Cross-Platform**: Works consistently on Windows, Mac, and Linux
- **Resource Efficient**: Clears previous timers to avoid memory leaks

#### **Enhanced User Experience**
- **Instant Feedback**: See proofreading suggestions appear as you type
- **Seamless Integration**: Works alongside existing save-triggered checking
- **No Performance Impact**: Intelligent timing prevents slowdowns
- **Universal Coverage**: All supported file types get real-time checking

### 🔧 Technical Implementation

#### **Event Listener Architecture**
```javascript
// Real-time checking with debounce
const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
  // 500ms delay after user stops typing
  changeTimer = setTimeout(() => {
    lintDocument(document);
  }, 500);
});
```

#### **Multiple Trigger Points**
1. **Real-time**: Text changes (with 500ms debounce)
2. **Save-triggered**: File save events  
3. **Open-triggered**: File open events
4. **Startup**: Active editor on extension activation

### 📊 Performance Considerations
- **Memory Safe**: Proper timer cleanup prevents memory leaks
- **Efficient Processing**: Only processes supported file types
- **Smart Filtering**: Respects user's enabled file type settings
- **Balanced Timing**: 500ms provides responsive feel without overwhelming system

### 🎯 User Impact
- **Mac Users**: Now get the same real-time experience as Windows users
- **All Users**: Enhanced productivity with immediate proofreading feedback
- **Seamless Workflow**: No need to manually save to see suggestions
- **Consistent Experience**: Uniform behavior across all platforms

## [0.0.9] - 2025-07-14

### 🔧 User Interface Fix

#### **Fixed Diagnostic Range Highlighting**
- **Issue**: Diagnostic underlines (波浪线) were only covering the first character of flagged text
- **Solution**: Improved Range calculation logic to highlight the complete matched text
- **Implementation**: 
  - Enhanced range calculation using textlint's range information when available
  - Added fallback logic to extract original text length from diagnostic messages
  - Ensures complete words/phrases are underlined instead of just single characters

#### **Technical Improvements**
- Better handling of textlint range data (`msg.range[1] - msg.range[0]`)
- Improved fallback mechanism when range information is unavailable
- Enhanced diagnostic position calculation for accurate text highlighting

### 📝 User Experience Enhancement
- Users now see complete words underlined rather than just the first letter
- Visual feedback is more intuitive and easier to understand
- Improved readability of proofreading suggestions

## [0.0.8] - 2025-07-14

### 🚨 Critical Fix

#### **Fixed First-Time Setup Issue**
- **Issue**: Welcome setup prompt was not appearing for new users after installation
- **Cause**: Extension activation events were too restrictive - only activated when specific file types were opened or commands executed
- **Solution**: Changed activation event from specific language triggers to `"onStartupFinished"`
- **Result**: Extension now properly activates after VS Code startup, ensuring first-time users see the setup prompt

#### **Improved Extension Activation**
- **Before**: Only activated when opening .txt, .md, .html, .tex, .js, .ts, .vue, .json files or executing specific commands
- **After**: Activates automatically after VS Code startup completes (non-blocking)
- **Benefits**: 
  - Ensures first-time setup experience works for all users
  - Maintains good startup performance (activates after startup finished)
  - Setup prompt appears regardless of which files user opens first

### 🔧 Technical Changes
- Updated `activationEvents` from specific language/command triggers to `"onStartupFinished"`
- This ensures the welcome prompt and extension initialization happen reliably for new installations

## [0.0.7] - 2025-07-11

### 🎉 Major User Experience Overhaul

#### **New Installation Experience**
- **Welcome Setup Prompt**: First-time users get a friendly setup prompt with "Set up now" or "Set up later" options
- **Guided Configuration**: Clicking "Set up now" automatically opens the Rules Folder settings page
- **No Auto-Creation**: Removed automatic file creation on install - users now have full control

#### **Enhanced Settings Integration**
- **In-Settings Button**: Added "Init Rules Folder" button directly in VS Code settings page
- **Clear Path Display**: Default path shows `~/smart-proofreader/rules/` with Windows equivalents
- **One-Click Setup**: Users can initialize their rules folder without using command palette

#### **Streamlined Default Rules System**
- **Three-Tier Architecture**: 
  1. **Built-in Rules**: Extension's embedded PRH rules (always active)
  2. **User Default Rules**: `~/smart-proofreader/rules/` (automatically checked)
  3. **Custom Rules**: User-specified paths via settings
- **Always-Active Defaults**: Default rules are checked regardless of user configuration
- **No-Error Policy**: Missing user default folder won't cause errors

#### **Simplified Sample Files**
- **Three Clean Examples**: Creates `rule1.yml`, `rule2.yml`, `rule3.yml`
- **Minimal Format**: Each file contains simple `expected/pattern/description` examples
- **Ready-to-Edit**: Files include Japanese comment "# prh ルール例、自由に編集可能"

### 🔧 Technical Improvements

#### **Cross-Platform Enhancements**
- **Windows Compatibility**: Fixed Open Folder behavior to show file contents instead of just folder
- **Path Resolution**: Improved tilde (~) expansion and absolute path handling
- **Platform-Specific UI**: Different path examples for Windows vs Mac/Linux users

#### **Build Optimization** 
- **Fixed Package Size**: Updated `.vscodeignore` to exclude `node_modules/**` and other unnecessary files
- **Reduced Distribution**: Fixed warning about 7850+ files in extension package

#### **New Commands**
- **`Smart Proofreader: Init Rules Folder`**: Initialize user default rules folder with samples
- **`Smart Proofreader: Open Rules Folder`**: Smart folder opening with multi-folder support

### 🎯 Path Standardization
- **Final Location**: `~/smart-proofreader/rules/` (not hidden, easily accessible)
- **Windows Path**: `C:\Users\[username]\smart-proofreader\rules\`
- **Cross-Platform**: Consistent behavior across all operating systems

### 🚀 Developer Experience
- **Enhanced File Watching**: Better monitoring of multiple rules folders
- **Improved Error Handling**: Graceful handling of missing folders and files
- **Better Debugging**: Enhanced logging for rule loading and path resolution

## [0.0.5] - 2025-07-11

### Fixed
- **Rule Source Display**: Fixed issue where rules without description field couldn't display source information
  - Rules without `description` now show "No description provided" instead of being ignored
  - All rules now properly display their source file names regardless of description presence
  - Affects both old format (`specs`) and new format (`pattern`) PRH rules

### Enhanced
- **Better Rule Coverage**: Now all rules contribute to source tracking, not just those with descriptions
- **Consistent Source Display**: Improved consistency in rule source information display

### Technical Improvements
- Modified rule loading logic to include rules without description fields
- Added fallback description text for rules missing description

## [0.0.4] - 2025-07-11

### Fixed
- **Cross-platform Path Support**: Fixed custom rules folder path resolution on macOS and Linux
  - Added automatic tilde (`~`) expansion for Unix-like systems  
  - Implemented cross-platform path resolver for better compatibility
  - Enhanced path debugging information for troubleshooting

### Enhanced
- **Better Platform Compatibility**: Improved support for different operating systems
- **Path Resolution Logging**: Added detailed path resolution debugging

### Technical Improvements
- Added `os` module for proper home directory resolution
- Implemented `resolvePath()` function for cross-platform path handling
- Enhanced path validation and error reporting

## [0.0.3] - 2025-07-11

### Fixed
- **Critical Rule File Loading Fix**: Fixed ENOENT errors when rule files are renamed or deleted
  - Added real-time file validation before passing paths to textlint engine
  - Implemented smart fallback to default rules when custom rules are unavailable
  - Added unique temporary configuration file names to prevent caching issues
  - Enhanced file existence checking and error handling

### Enhanced
- **Improved Manual Check Command**: Now reloads rules automatically when executed
- **Enhanced Status Bar Toggle**: Refreshes rules when enabling auto-check
- **Better Debug Information**: Added comprehensive logging for rule file processing
- **Robust Error Handling**: Better handling of missing or invalid rule files

### Technical Improvements
- Real-time rule file validation in `lintDocument` function
- Dynamic rule path filtering to exclude non-existent files
- Automatic fallback mechanism to default rules
- Enhanced debugging output for troubleshooting

## [0.0.2] - 2025-07-11

### Fixed
- **Critical Dependency Fix**: Moved `textlint` and `textlint-rule-prh` from devDependencies to dependencies
  - This was causing the extension to fail when installed from marketplace
  - Users were getting "Cannot find module" errors
  - Extension now properly loads and functions when installed

### Technical Changes
- Corrected package.json dependency configuration for proper marketplace distribution

## [0.0.1] - 2025-07-11

### Added

- **Multi-format File Support**: Support for txt, md, html, tex, js, ts, vue, json files
- **Rule Source Tracking**: Display source file names for each proofreading suggestion
- **Multiple Rules Folders**: Support both default rules and custom user rules simultaneously
- **Flexible File Type Configuration**: Individual enable/disable settings for each file type
- **Auto Check Control**: Toggle automatic checking on save via settings
- **Status Bar Control**: High-priority status bar button for quick on/off toggle
- **Manual Check Command**: `Smart Proofreader: Check This File` for manual file checking
- **Clear Diagnostics Command**: `Smart Proofreader: Clear All Diagnostics` for clearing all results
- **Toggle Command**: `Smart Proofreader: Toggle Auto Check` for quick enable/disable
- **Smart State Management**: Prevent manual checking when extension is disabled
- **Real-time Configuration Monitoring**: Automatic rule reloading when rule files change
- **File Watcher System**: Monitor multiple rule folders for changes
- **Enhanced Diagnostic Display**:
  - Single rule: `original => suggestion [source] (description [source])`
  - Multiple rules: `original => suggestion1 [source1], suggestion2 [source2] (description1 [source1], description2 [source2])`
- **Default Rule Integration**: Always check default rules while supporting custom additions
- **International Support**: Full English interface for global users

### Features

- **Intelligent Text Proofreading**: Uses PRH (Proofreading Helper) rules for accurate text correction
- **Source-tracked Suggestions**: Know exactly which rule file provided each suggestion
- **Multi-mode Operation**: Choose between automatic checking or manual control
- **Visual Status Indicator**: Status bar button shows current state with clear ON/OFF display
- **Comprehensive File Support**: Support for 8 different file types commonly used in development
- **Rule Conflict Handling**: Properly handle and display conflicts when multiple rules match the same pattern
- **Workspace Integration**: Settings are workspace-specific for project-based configurations

### Technical Details

- Built with VS Code Extension API
- Uses textlint engine with PRH rule integration
- Dynamic configuration file generation for optimal performance
- Memory-efficient rule loading and caching
- Robust error handling and user feedback
- Clean resource management and proper cleanup

## Future Plans

- Implement rule priority system
- Add rule editing interface
- Support for custom rule templates
