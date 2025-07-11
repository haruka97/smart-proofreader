# Change Log

All notable changes to the "Smart Proofreader" extension will be documented in this file.

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
