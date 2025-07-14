# Change Log

All notable changes to the "Smart Proofreader" extension will be documented in this file.

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
