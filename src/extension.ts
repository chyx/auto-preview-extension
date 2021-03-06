// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import {
  window,
  TextDocument,
  TextDocumentShowOptions,
} from "vscode";
import Init from "./utils/init";

enum Direction {
  left,
  right,
  up,
  down,
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "autopreview" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable2 = vscode.commands.registerCommand(
    "autopreview.openWikiLinkInNextTab",
    () => {
      openWikiLinkOnTheSpecifiedEditorColumn(Direction.right);
      // The code you place here will be executed every time your command is executed
    }
  );

  let disposable3 = vscode.commands.registerCommand(
    "autopreview.openWikiLinkInPreviousTab",
    () => {
      openWikiLinkOnTheSpecifiedEditorColumn(Direction.left);
    }
  );

  let disposableUpper = vscode.commands.registerCommand(
    "autopreview.openWikiLinkInUpperTab",
    () => openWikiLinkOnTheSpecifiedEditorColumn(Direction.up)
  );
  let disposableLower = vscode.commands.registerCommand(
    "autopreview.openWikiLinkInLowerTab",
    () => openWikiLinkOnTheSpecifiedEditorColumn(Direction.down)
  );

  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposableUpper);
  context.subscriptions.push(disposableLower);

  Init.commands(context);
  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeTextDocument ( ChangesDecorator.onChanges ),
  //   vscode.window.onDidChangeActiveTextEditor ( () => DocumentDecorator.update() )
  // );
  // DocumentDecorator.update ();

  let alreadyOpenedFirstMarkdown = false;
  let previousUri = "";

//   function openMarkdownPreviewSideBySide() {
//     commands.executeCommand(markdown_preview_command_id).then(
//       () => {},
//       (e) => console.error(e)
//     );
//   }

  // if (window.activeTextEditor) {
  // 	previewFirstMarkdown();
  // } else {
  // 	vscode.window.onDidChangeActiveTextEditor(() => {
  // 		previewFirstMarkdown();
  // 	});
  // }

  vscode.workspace.onWillSaveTextDocument((event) => {
    if (event && event.document && event.document.languageId === "markdown") {
      if (window.activeTextEditor?.viewColumn === 1) {
        showFirstWikiLink(window.activeTextEditor?.document, 2);
      }
      if (window.activeTextEditor?.viewColumn === 3) {
        showFirstWikiLink(window.activeTextEditor?.document, 4);
      }
      if (window.activeTextEditor?.viewColumn === 5) {
        showFirstWikiLink(window.activeTextEditor?.document, 6);
      }
    }
  });
}

async function showFirstWikiLink(_unusedDocument: TextDocument, viewColumn: number) {
  const editor = window.activeTextEditor;
  if (editor === undefined) {
    return;
  }
  // vscode.window.showInformationMessage('Doc opened: ' + editor.document.fileName);
  const fullText = await generateTocText(editor.document);
  const re = /\[\[[\w-]+\]\]/;
  const firstLink = fullText.match(re);
  if (firstLink) {
    const notes = await vscode.commands.executeCommand<Note[]>(
      "vscodeMarkdownNotes.notesForWikiLink",
      firstLink[0]
    );
    if (notes) {
      // vscode.window.showInformationMessage('First Link: ' + notes[0].fsPath);
      openInPreviewEditor(notes[0].fsPath, viewColumn, true);
    }
  }
}

async function openWikiLinkOnTheSpecifiedEditorColumn(direction: Direction) {
  const column = window.activeTextEditor?.viewColumn;
  if (!column) {
    window.showInformationMessage("Current editor not found.");
    return;
  }
  let nextColumn = column;
  switch (direction) {
    case Direction.left:
      if (column >= 3) {
        nextColumn = column - 2;
      }
      break;
    case Direction.right:
      if (column + 2 <= window.visibleTextEditors.length) {
        nextColumn = column + 2;
      }
      break;
    case Direction.up:
      if (column >= 2) {
        nextColumn = column - 1;
      }
      break;
    case Direction.down:
      if (column + 1 <= window.visibleTextEditors.length) {
        nextColumn = column + 1;
      }
      break;
  }
  const document = window.activeTextEditor?.document;
  const position = window.activeTextEditor?.selection.active;
  if (document && position) {
    const wikiLink = getCurrentWikiLink(document, position);
    if (wikiLink) {
      const notes = await vscode.commands.executeCommand<Note[]>(
        "vscodeMarkdownNotes.notesForWikiLink",
        wikiLink
      );
      if (notes) {
        await openInPreviewEditor(notes[0].fsPath, nextColumn, false);
        vscode.commands.executeCommand("workbench.action.closeOtherEditors");
      }
    } else {
      const editor = vscode.window.visibleTextEditors.find(
        (editor) => editor.viewColumn === nextColumn
      );
      if (editor !== undefined) {
        await openDocumentInEditor(editor.document, nextColumn, false);
      }
    }
  }
}

async function openDocumentInEditor(
  document: vscode.TextDocument,
  viewColumn: number,
  preserveFocus: boolean
) {
  const previousColumn = window.activeTextEditor?.viewColumn;
  const previousDocument = window.activeTextEditor?.document;
  const column: TextDocumentShowOptions = {
    viewColumn: viewColumn,
    preserveFocus: preserveFocus,
  };
  await window.showTextDocument(document, column);
}

async function openInPreviewEditor(
  uri: string,
  viewColumn: number,
  preserveFocus: boolean
) {
  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(uri)
  );
  await openDocumentInEditor(document, viewColumn, preserveFocus);
}

async function generateTocText(doc: TextDocument): Promise<string> {
  return doc.getText();
}

const RX_WIKI_LINK = "\\[\\[[^\\]]+\\]\\]"; // [[wiki-link-regex(|with potential pipe)?]] Note: "sep" will be replaced with pipedWikiLinksSeparator on compile
function getCurrentWikiLink(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const range = document.getWordRangeAtPosition(
    position,
    new RegExp(RX_WIKI_LINK, "gi")
  );
  if (range) {
    // Our rxWikiLink contains [[ and ]] chars
    // but the replacement words do NOT.
    // So, account for the (exactly) 2 [[  chars at beginning of the match
    // since our replacement words do not contain [[ chars
    let s = new vscode.Position(range.start.line, range.start.character + 2);
    // And, account for the (exactly) 2 ]]  chars at beginning of the match
    // since our replacement words do not contain ]] chars
    let e = new vscode.Position(range.end.line, range.end.character - 2);
    // keep the end
    let r = new vscode.Range(s, e);
    const ref = document.getText(r);
    return ref;
  } else {
    return null;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

interface Note {
  fsPath: string;
}

interface Editor {
  column: string;
  name: string;
}
