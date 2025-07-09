// 'vscode' モジュールは VS Code 拡張 API を含みます
// モジュールをインポートし、以下で vscode エイリアスとして参照します
const vscode = require('vscode');
const { TextLintEngine } = require('textlint');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
let prhDescMap;

function loadPrhDescriptionMap() {
	const prhPath = path.resolve(__dirname, './prh-rules/prh.yml');
	try {
		const doc = yaml.load(fs.readFileSync(prhPath, 'utf8'));
		const map = {};
		const rules = doc && typeof doc === 'object' && 'rules' in doc ? doc.rules : undefined;
		if (Array.isArray(rules)) {
			rules.forEach(rule => {
				if (rule.specs) {
					rule.specs.forEach(spec => {
						if (spec.from && spec.description) {
							map[spec.from] = spec.description;
						}
					});
				}
			});
		}
		return map;
	} catch (e) {
		console.error('prh.yml の解析に失敗しました', e);
		return {};
	}
}
prhDescMap = loadPrhDescriptionMap();

fs.watch(path.resolve(__dirname, './prh-rules/prh.yml'), () => {
	prhDescMap = loadPrhDescriptionMap();
});

// このメソッドは拡張機能がアクティブ化された時に呼び出されます
// コマンドが初めて実行された時にアクティブ化されます

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// デバッグ情報やエラーを出力します
	// この行は拡張機能がアクティブ化された時に一度だけ実行されます
	console.log('おめでとうございます、拡張機能「test」が有効になりました！');

	// コマンドは package.json で定義されています
	// ここで registerCommand でコマンドの実装を提供します
	// commandId は package.json の command フィールドと一致する必要があります
	const disposable = vscode.commands.registerCommand('test.helloWorld', function () {
		// コマンドが実行されるたびにこのコードが実行されます

		// ユーザーにメッセージボックスを表示
		vscode.window.showInformationMessage('test からこんにちは！');
	});

	// 新しいコマンド：現在のTXTファイルをチェック
	const textlintDisposable = vscode.commands.registerCommand('test.textlintCheckTxt', async function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor || !editor.document || editor.document.languageId !== 'plaintext' || !editor.document.fileName.endsWith('.txt')) {
			vscode.window.showWarningMessage('.txt テキストファイルを開いてからこのコマンドを実行してください。');
			return;
		}
		const filePath = editor.document.fileName;
		const engine = new TextLintEngine({
			configFile: path.resolve(__dirname, 'textlint.config.js'),
		});
		const results = await engine.executeOnFiles([filePath]);
		if (results && results[0] && results[0].messages.length > 0) {
			const msg = results[0].messages.map(m => `${m.line}:${m.column} ${m.message}`).join('\n');
			vscode.window.showWarningMessage('textlint で問題が見つかりました:\n' + msg);
		} else {
			vscode.window.showInformationMessage('textlint チェック合格、問題は見つかりませんでした。');
		}
	});
	context.subscriptions.push(disposable, textlintDisposable);

	// Diagnostics コレクション
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('textlint');
	context.subscriptions.push(diagnosticCollection);

	async function lintTxtDocument(document) {
		if (document.languageId !== 'plaintext' || !document.fileName.endsWith('.txt')) return;
		const { TextLintEngine } = require('textlint');
		const path = require('path');
		const engine = new TextLintEngine({
			configFile: path.resolve(__dirname, 'textlint.config.js'),
		});
		const results = await engine.executeOnFiles([document.fileName]);
		const diagnostics = [];
		if (results && results[0] && results[0].messages.length > 0) {
			for (const msg of results[0].messages) {
				let diagMsg = msg.message;
				// prh description を補足
				const match = /^(.*?) =>/.exec(msg.message);
				if (match && prhDescMap[match[1]]) {
					diagMsg += `（${prhDescMap[match[1]]}）`;
				}
				diagnostics.push(new vscode.Diagnostic(
					new vscode.Range(
						new vscode.Position(msg.line - 1, msg.column - 1),
						new vscode.Position(msg.line - 1, msg.column - 1 + (msg.range && msg.range[1] ? msg.range[1] - msg.range[0] : 1))
					),
					diagMsg,
					vscode.DiagnosticSeverity.Information
				));
			}
		}
		diagnosticCollection.set(document.uri, diagnostics);
	}

	// 保存時に自動チェック
	const saveDisposable = vscode.workspace.onDidSaveTextDocument(lintTxtDocument);
	context.subscriptions.push(saveDisposable);

	// ファイルを開いた時にもチェック
	const openDisposable = vscode.workspace.onDidOpenTextDocument(lintTxtDocument);
	context.subscriptions.push(openDisposable);

	// txt ファイルに切り替えた時もチェック
	if (vscode.window.activeTextEditor) {
		lintTxtDocument(vscode.window.activeTextEditor.document);
	}
}

// このメソッドは拡張機能が非アクティブ化された時に呼び出されます
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
