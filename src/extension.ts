// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { workspace, window, commands, ExtensionContext, TextDocument, TextDocumentShowOptions } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "autopreview" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('autopreview.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
	});

	let disposable2 = vscode.commands.registerCommand('autopreview.debug', () => {
		// The code you place here will be executed every time your command is executed
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);

	let alreadyOpenedFirstMarkdown = false;
	let previousUri = '';

	function openMarkdownPreviewSideBySide() {
		commands.executeCommand(markdown_preview_command_id)
			.then(() => { }, (e) => console.error(e));
	}

	// if (window.activeTextEditor) {
	// 	previewFirstMarkdown();
	// } else {
	// 	vscode.window.onDidChangeActiveTextEditor(() => {
	// 		previewFirstMarkdown();
	// 	});
	// }

	// vscode.window.onDidChangeTextEditorSelection(event => {
	vscode.workspace.onWillSaveTextDocument((event) => {
		if (event && event.document && event.document.languageId === "markdown") {
			if (window.activeTextEditor?.viewColumn === 1) {
				showFirstWikiLink(window.activeTextEditor?.document, 2);
			}
			if (window.activeTextEditor?.viewColumn === 2) {
				showFirstWikiLink(window.activeTextEditor?.document, 3);
			}
		}
	});
}

async function showFirstWikiLink(document: TextDocument, viewColumn: number) {
    const editor = window.activeTextEditor;
	if (editor === undefined) {
		return;
	}
	// vscode.window.showInformationMessage('Doc opened: ' + editor.document.fileName);
    const fullText = await generateTocText(editor.document);
	const re = /\[\[[\w-]+\]\]/;
	const firstLink = fullText.match(re);
	if (firstLink) {
		const notes = await vscode.commands.executeCommand<Note[]>('vscodeMarkdownNotes.notesForWikiLink', firstLink[0]);
		if (notes) {
			// vscode.window.showInformationMessage('First Link: ' + notes[0].fsPath);
			openInPreviewEditor(notes[0].fsPath, viewColumn);
		}
	}
}

async function openInPreviewEditor(uri: string, viewColumn: number) {
	const previousColumn = window.activeTextEditor?.viewColumn;
	const previousDocument = window.activeTextEditor?.document;
	const column: TextDocumentShowOptions = {
		viewColumn: viewColumn,
		preserveFocus: true
	};
	const document = await vscode.workspace.openTextDocument(vscode.Uri.file(uri));
	await window.showTextDocument(document, column);
	if (previousDocument) {
		window.showTextDocument(previousDocument, previousColumn);
	}
}

async function generateTocText(doc: TextDocument): Promise<string> {
	return doc.getText();
}

const RxWikiLink = '\\[\\[[^sep\\]]+(sep[^sep\\]]+)?\\]\\]'; // [[wiki-link-regex(|with potential pipe)?]] Note: "sep" will be replaced with pipedWikiLinksSeparator on compile
export function showCurrentWikiLink(document: vscode.TextDocument, position: vscode.Position): Ref {
	const range = document.getWordRangeAtPosition(position, new RegExp(RxWikiLink, 'gi'));
}


const close_other_editor_command_id = "workbench.action.closeEditorsInOtherGroups";
const markdown_preview_command_id = "markdown.showPreviewToSide";

// this method is called when your extension is deactivated
export function deactivate() { }

interface Note {
	fsPath: string;
}

interface Editor {
	column: string;
	name: string;
}