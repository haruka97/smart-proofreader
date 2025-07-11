# Smart Proofreader

## 日本語

### 概要

Smart Proofreaderは、[PRH (Proofreading Helper)](https://github.com/prh/prh) ルールを使用したインテリジェントなテキスト校正VSCode拡張機能です。[textlint](https://textlint.github.io/) エンジンをベースに、複数のファイル形式に対応し、ルールの出典を明確に表示することで、効率的で透明性の高い文書校正を実現します。

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

### ルール管理システム

Smart Proofreaderは3層のルールシステムを採用：

#### 1. **内蔵ルール** (常に有効)
- 拡張機能に組み込まれたデフォルトPRHルール
- アップデート時に自動更新

#### 2. **ユーザーデフォルトルール** (自動検出)
- **場所**: `~/smart-proofreader/rules/` (Mac/Linux) / `C:\Users\[ユーザー名]\smart-proofreader\rules\` (Windows)
- **初期化**: 設定ページの"Init Rules Folder"ボタンで作成
- **自動生成**: `rule1.yml`, `rule2.yml`, `rule3.yml`のサンプルファイル
- 設定不要で自動的に読み込まれます

#### 3. **カスタムルール** (任意設定)
- `smartProofreader.rulesFolder`で指定するカスタムパス
- 複数プロジェクト間での共有ルール用

#### ルール初期化手順

1. **初回インストール**: "今すぐ設定"を選択して設定画面へ
2. **設定画面**: Rules Folderの下にある"Init Rules Folder"ボタンをクリック
3. **自動作成**: サンプルルールファイルが自動生成されます
4. **編集開始**: 生成されたファイルを自由に編集

#### サンプルルール形式
```yaml
# prh ルール例、自由に編集可能
rules:
  - expected: GitHub
    pattern: /Github/
    description: GitHubの正しい表記
```

### システム要件

- Visual Studio Code 1.101.0以上
- Node.js（textlintエンジン用）

---

## English

### Overview

Smart Proofreader is an intelligent text proofreading VS Code extension using [PRH (Proofreading Helper)](https://github.com/prh/prh) rules. Based on the [textlint](https://textlint.github.io/) engine, it supports multiple file formats and provides transparent proofreading with clear rule source tracking.

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

### Rule Management System

Smart Proofreader uses a three-tier rule system:

#### 1. **Built-in Rules** (Always Active)
- Default PRH rules embedded in the extension
- Automatically updated with extension updates

#### 2. **User Default Rules** (Auto-detected)
- **Location**: `~/smart-proofreader/rules/` (Mac/Linux) / `C:\Users\[username]\smart-proofreader\rules\` (Windows)
- **Initialization**: Click "Init Rules Folder" button in settings page
- **Auto-generated**: Sample files `rule1.yml`, `rule2.yml`, `rule3.yml`
- Automatically loaded without configuration

#### 3. **Custom Rules** (Optional Setting)
- Custom path specified via `smartProofreader.rulesFolder`
- For shared rules across multiple projects

#### Rule Initialization Steps

1. **First Install**: Choose "Set up now" to go to settings page
2. **Settings Page**: Click "Init Rules Folder" button under Rules Folder
3. **Auto-creation**: Sample rule files are automatically generated
4. **Start Editing**: Freely edit the generated files

#### Sample Rule Format
```yaml
# prh ルール例、自由に編集可能
rules:
  - expected: GitHub
    pattern: /Github/
    description: GitHubの正しい表記
```

### System Requirements

- Visual Studio Code 1.101.0 or higher
- Node.js (for textlint engine)

---

## 相关资源 / Related Resources

### 🔧 **コアツール / Core Tools**
- **[PRH (Proofreading Helper)](https://github.com/prh/prh)** - 校正ルールエンジン / Proofreading rule engine
- **[textlint](https://textlint.github.io/)** - テキスト校正フレームワーク / Text linting framework
- **[textlint-rule-prh](https://github.com/textlint-rule/textlint-rule-prh)** - PRH用textlintルール / textlint rule for PRH

### 📚 **ドキュメント / Documentation**
- **[PRH ルール記法](https://github.com/prh/prh#rule-syntax)** - PRHルールの書き方 / How to write PRH rules
- **[textlint 使用方法](https://textlint.github.io/docs/getting-started.html)** - textlintの基本的な使い方 / Basic textlint usage
- **[VSCode拡張開発](https://code.visualstudio.com/api)** - VS Code Extension API

### 🎯 **PRHルール例 / PRH Rule Examples**
- **[技術文書用ルール](https://github.com/prh/rules)** - 一般的な技術文書校正ルール / General technical writing rules
- **[日本語表記ルール](https://github.com/textlint-ja)** - 日本語文書用ルール集 / Japanese writing rules collection

---

## 中文说明

### 概述

Smart Proofreader 是一个基于 [PRH (Proofreading Helper)](https://github.com/prh/prh) 规则的智能文本校对 VS Code 扩展。它基于 [textlint](https://textlint.github.io/) 引擎，支持多种文件格式，并提供清晰的规则来源追踪，实现高效透明的文档校对。

### 功能特点

- **📝 多格式支持**: 校对 txt、md、html、tex、js、ts、vue、json 文件
- **🎯 规则来源追踪**: 显示每个校对建议的来源文件名
- **🔧 灵活配置**: 独立的文件类型设置和可切换的保存时自动检查
- **📁 多规则文件夹**: 同时使用默认规则和自定义规则
- **⚙️ 手动/自动模式**: 在保存时自动检查或手动检查之间选择
- **🧹 诊断管理**: 一键清除所有诊断信息

### 安装方法

1. 打开 VS Code 扩展标签页
2. 搜索 "Smart Proofreader"
3. 点击安装

### 使用方法

#### 基本操作

1. **手动检查**: `Ctrl+Shift+P` → "Smart Proofreader: Check This File"
2. **清除诊断**: `Ctrl+Shift+P` → "Smart Proofreader: Clear All Diagnostics"

#### 设置配置

打开 VS Code 设置（`Ctrl+,`）并搜索 "Smart Proofreader"：

- **文件类型设置**: 选择要检查的文件格式
- **保存时检查**: 启用/禁用保存时自动检查
- **自定义规则文件夹**: 指定自定义 PRH 规则文件夹的路径

### 规则管理系统

Smart Proofreader 使用三层规则系统：

#### 1. **内置规则**（始终激活）
- 扩展中嵌入的默认 PRH 规则
- 随扩展更新自动更新

#### 2. **用户默认规则**（自动检测）
- **位置**: `~/smart-proofreader/rules/` (Mac/Linux) / `C:\Users\[用户名]\smart-proofreader\rules\` (Windows)
- **初始化**: 在设置页面点击 "Init Rules Folder" 按钮
- **自动生成**: 示例文件 `rule1.yml`、`rule2.yml`、`rule3.yml`
- 无需配置即可自动加载

#### 3. **自定义规则**（可选设置）
- 通过 `smartProofreader.rulesFolder` 指定的自定义路径
- 用于多项目间的共享规则

#### 规则初始化步骤

1. **首次安装**: 选择"现在设置"进入设置页面
2. **设置页面**: 点击 Rules Folder 下方的 "Init Rules Folder" 按钮
3. **自动创建**: 自动生成示例规则文件
4. **开始编辑**: 自由编辑生成的文件

#### 示例规则格式
```yaml
# prh 规则示例，可自由编辑
rules:
  - expected: GitHub
    pattern: /Github/
    description: GitHub的正确表记
```

### 支持的文件类型

| 文件类型 | 扩展名 | 设置名称 |
|---------|--------|----------|
| 纯文本 | .txt | plaintext |
| Markdown | .md, .markdown | markdown |
| HTML | .html, .htm | html |
| LaTeX | .tex | latex |
| JavaScript | .js, .jsx | javascript |
| TypeScript | .ts, .tsx | typescript |
| Vue | .vue | vue |
| JSON | .json | json |

### 系统要求

- Visual Studio Code 1.101.0 或更高版本
- Node.js（用于 textlint 引擎）

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
