import * as _ from "lodash";
import * as vscode from "vscode";
import {
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "vscode";
import Consts from "../../consts";
import Document from "./document";

/* CHANGES */

class Changes {
  static changes: TextDocumentContentChangeEvent[] = [];

  //   static onChanges({ document: vscode.TextDocument, contentChanges: TextDocumentContentChangeEvent[] }): void {
  static onChanges(event: TextDocumentChangeEvent): void {
    // if (document.languageId !== Consts.languageId) {
    //   return;
    // }

    if (!event.contentChanges.length) {
      return;
    } //URL: https://github.com/Microsoft/vscode/issues/50344

    Changes.changes.push(...event.contentChanges);
    Changes.decorate(event.document);
  }

  static decorate(document: vscode.TextDocument) {
    const areSingleLines = Changes.changes.every(
      ({ range }) => range.isSingleLine
    );

    if (areSingleLines) {
      const lineNrs = Changes.changes.map(({ range }) => range.start.line);
      Document.updateLines(document, lineNrs);
    } else {
      Document.update(document);
    }
    Changes.changes = [];
  }
}

/* EXPORT */
export default Changes;
