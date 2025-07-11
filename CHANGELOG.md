# Change Log

All notable changes to the "Smart Proofreader" extension will be documented in this file.

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
