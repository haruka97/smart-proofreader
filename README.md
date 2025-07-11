# Smart Proofreader

## 日本語

### 概要

Smart Proofreaderは、PRHルールを使用したインテリジェントなテキスト校正VSCode拡張機能です。複数のファイル形式に対応し、ルールの出典を明確に表示することで、効率的で透明性の高い文書校正を実現します。

### 特徴

- **📝 マルチファイル対応**: txt、md、html、tex、js、ts、vue、jsonファイルの校正
- **🎯 ルール出典表示**: 各校正提案の出典ファイル名を表示
- **🔧 柔軟な設定**: ファイルタイプごとの個別設定と保存時自動チェックの切り替え
- **📁 複数ルールフォルダ**: デフォルトルールとカスタムルールの同時使用
- **⚙️ 手動・自動モード**: 保存時自動チェックまたは手動チェックから選択可能
- **🧹 診断情報管理**: ワンクリックで全ての診断情報をクリア

### インストール

1. VSCodeのExtensions（拡張機能）タブを開く
2. "Smart Proofreader"を検索
3. インストールをクリック

### 使用方法

#### 基本操作

1. **手動チェック**: `Ctrl+Shift+P` → "Smart Proofreader: Check This File"
2. **診断クリア**: `Ctrl+Shift+P` → "Smart Proofreader: Clear All Diagnostics"

#### 設定

VSCodeの設定（`Ctrl+,`）で"Smart Proofreader"を検索：

- **ファイルタイプ設定**: チェックしたいファイル形式を選択
- **保存時自動チェック**: 有効/無効を切り替え
- **カスタムルールフォルダ**: 独自のPRHルールフォルダのパスを指定

#### 診断情報の表示形式

- **単一ルール**: `原文 => 修正案 [ソース] (説明 [ソース])`
- **複数ルール**: `原文 => 修正案1 [ソース1], 修正案2 [ソース2] (説明1 [ソース1], 説明2 [ソース2])`

### 対応ファイル形式

| ファイル形式 | 拡張子 | 設定名 |
|-------------|--------|--------|
| プレーンテキスト | .txt | plaintext |
| Markdown | .md, .markdown | markdown |
| HTML | .html, .htm | html |
| LaTeX | .tex | latex |
| JavaScript | .js, .jsx | javascript |
| TypeScript | .ts, .tsx | typescript |
| Vue | .vue | vue |
| JSON | .json | json |

### カスタムルール

デフォルトルールに加えて、独自のPRHルールフォルダを設定可能：

1. 設定で`smartProofreader.rulesFolder`にフォルダパスを指定
2. フォルダ内に`.yml`または`.yaml`ファイルを配置
3. PRH形式でルールを記述

### システム要件

- Visual Studio Code 1.101.0以上
- Node.js（textlintエンジン用）

---

## English

### Overview

Smart Proofreader is an intelligent text proofreading VS Code extension using PRH rules. It supports multiple file formats and provides transparent proofreading with clear rule source tracking.

### Features

- **📝 Multi-format Support**: Proofread txt, md, html, tex, js, ts, vue, json files
- **🎯 Rule Source Tracking**: Display source file names for each proofreading suggestion
- **🔧 Flexible Configuration**: Individual file type settings and toggleable auto-check on save
- **📁 Multiple Rule Folders**: Use default rules and custom rules simultaneously
- **⚙️ Manual/Auto Modes**: Choose between auto-check on save or manual checking
- **🧹 Diagnostic Management**: Clear all diagnostic information with one click

### Installation

1. Open VS Code Extensions tab
2. Search for "Smart Proofreader"
3. Click Install

### Usage

#### Basic Operations

1. **Manual Check**: `Ctrl+Shift+P` → "Smart Proofreader: Check This File"
2. **Clear Diagnostics**: `Ctrl+Shift+P` → "Smart Proofreader: Clear All Diagnostics"

#### Settings

Open VS Code settings (`Ctrl+,`) and search "Smart Proofreader":

- **File Type Settings**: Select which file formats to check
- **Check On Save**: Enable/disable automatic checking on save
- **Custom Rules Folder**: Specify path to your custom PRH rules folder

#### Diagnostic Display Format

- **Single Rule**: `original => suggestion [source] (description [source])`
- **Multiple Rules**: `original => suggestion1 [source1], suggestion2 [source2] (description1 [source1], description2 [source2])`

### Supported File Types

| File Type | Extensions | Setting Name |
|-----------|------------|--------------|
| Plain Text | .txt | plaintext |
| Markdown | .md, .markdown | markdown |
| HTML | .html, .htm | html |
| LaTeX | .tex | latex |
| JavaScript | .js, .jsx | javascript |
| TypeScript | .ts, .tsx | typescript |
| Vue | .vue | vue |
| JSON | .json | json |

### Custom Rules

Add custom PRH rules in addition to default rules:

1. Set `smartProofreader.rulesFolder` to your folder path in settings
2. Place `.yml` or `.yaml` files in the folder
3. Write rules in PRH format

### System Requirements

- Visual Studio Code 1.101.0 or higher
- Node.js (for textlint engine)

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
