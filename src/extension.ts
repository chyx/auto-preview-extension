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
		// showFirstWikiLink();
	});

	let disposable2 = vscode.commands.registerCommand('autopreview.debug', () => {
		// The code you place here will be executed every time your command is executed
		// openInPreviewEditor();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);

	let alreadyOpenedFirstMarkdown = false;
	let previousUri = '';

	function previewFirstMarkdown() {
		if (alreadyOpenedFirstMarkdown) {
			return;
		}
		// vscode.window.showInformationMessage('Tried to preview!');
		let editor = window.activeTextEditor;
		if (editor) {
			let doc = editor.document;
			if (doc && doc.languageId === "markdown") {
				openMarkdownPreviewSideBySide();
				alreadyOpenedFirstMarkdown = true;
			}
		}
	}
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

	vscode.window.onDidChangeTextEditorSelection(event => {
		if (event && event.textEditor.document && event.textEditor.document.languageId === "markdown") {
			if (event.textEditor.viewColumn === 1) {
				const currentUri = event.textEditor.document.uri.path;
				if (currentUri === previousUri) {
					return;
				}
				previousUri = currentUri;
				// openMarkdownPreviewSideBySide();
				showFirstWikiLink(event.textEditor.document);
			}
		}
	});

	vscode.workspace.onDidOpenTextDocument((doc) => {
		if (doc && doc.languageId === "markdown") {
			// openMarkdownPreviewSideBySide();
			showFirstWikiLink(doc);
		}
	});
}

async function showFirstWikiLink(document: TextDocument) {
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
			openInPreviewEditor(notes[0].fsPath);
		}
	}
}

async function openInPreviewEditor(uri: string) {
	const previsouColumn = window.activeTextEditor?.viewColumn;
	const previousDocument = window.activeTextEditor?.document;
	const column: TextDocumentShowOptions = {
		viewColumn: 2
	};
	const document = await vscode.workspace.openTextDocument(vscode.Uri.file(uri));
	await window.showTextDocument(document, column);
	if (previousDocument) {
		window.showTextDocument(previousDocument, previsouColumn);
	}
}

async function generateTocText(doc: TextDocument): Promise<string> {
	return doc.getText();
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