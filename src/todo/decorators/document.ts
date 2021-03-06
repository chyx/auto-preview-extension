import * as _ from "lodash";
import * as vscode from "vscode";
import Config from "../../config";
// import Utils from '../../utils';
import Item from "../items/item";
import DocumentModule from "../document";
// import Comment from "./comment";
// import Formatted from "./formatted";
// import Project from "./project";
// import Tag from "./tag";
import TodoDone from "./todo_done";
import TodoCancelled from "./todo_cancelled";
import { TextEditorDecorationType } from "vscode";
import Tag from "./tag";

/* DOCUMENTS LINES CACHE */

class DocumentsLinesCache {
  static lines: { [name: string]: string[] } = {};

  static get(textEditor: vscode.TextDocument, lineNr?: number): string[] {
    const id = textEditor.uri.path;
    const lines = DocumentsLinesCache.lines[id];

    return lines && _.isNumber(lineNr) ? [lines[lineNr]] : lines;
  }

  static update(textEditor: vscode.TextDocument): void {
    const id = textEditor.uri.path;
    DocumentsLinesCache.lines[id] = textEditor.getText().split("\n");
  }

  static didChange(doc: DocumentModule) {
    // Check if the document actually changed

    const prevLines = DocumentsLinesCache.get(doc.textDocument);

    if (prevLines) {
      const prevText = prevLines.join("\n"),
        currText = doc.textDocument.getText();

      if (prevText === currText) {
        return false;
      }
    }

    return true;
  }
}

/* DOCUMENT */
class Document {
  /* UPDATE */
  static update(
    res: vscode.TextDocument | undefined = undefined,
    force: boolean = false
  ) {
    if (res === null) {
      res = vscode.window.activeTextEditor?.document;
    }
    if (res === null) {
      return;
    }
    // const statisticsStatusbar =
    //     Config.getKey("statistics.statusbar.enabled") !== false,
    //   statisticsProjects =
    //     Config.getKey("statistics.project.enabled") !== false;

    if (res) {
      const doc = new DocumentModule(res);

      if (doc.isSupported()) {
        // if ( !force && !DocumentsLinesCache.didChange ( doc ) ) return; //FIXME: Decorations might get trashed, so we can't skip this work //URL: https://github.com/Microsoft/vscode/issues/50415

        DocumentsLinesCache.update(doc.textDocument);

        const items = Document.getItems(doc);

        // if (statisticsStatusbar || statisticsProjects) {
        //   Utils.statistics.tokens.updateGlobal(items);
        // }
        // if (statisticsProjects) {
        //   Utils.statistics.tokens.updateProjects(doc.textDocument, items);
        // }

        const decorations = Document.getItemsDecorations(items);

        decorations.forEach(({ type, ranges }) => {
          doc.textEditor?.setDecorations(type, ranges);
        });

        // const StatusbarTimer = require("../../statusbars/timer").default; // Avoiding a cyclic dependency
        // StatusbarTimer.update(doc);
      }
    }

    // if (statisticsStatusbar) {
    //   const statusbarStatistics =
    //     require("../../statusbars/statistics").default; // Avoiding a cyclic dependency

    //   statusbarStatistics.update();
    // }
  }

  static updateLines(res: vscode.TextDocument, lineNrs: number[]) {
    //URL: https://github.com/Microsoft/vscode/issues/50346

    // This should optimize these scenarios:
    // 1. No items at all
    // 2. Same items but with same ranges
    // 3. Same items but both ranging through the entire line
    // 4. Same items but both ranging through the entire line, with some other items before the end

    const doc = new DocumentModule(res);

    if (!doc.isSupported()) {
      return;
    }

    const prevLines = DocumentsLinesCache.get(doc.textDocument);

    if (prevLines && prevLines.length === doc.textDocument.lineCount) {
      lineNrs = _.uniq(lineNrs); // Multiple cursors on the same line

      const isUnchanged = lineNrs.every((lineNr) => {
        const prevLine = prevLines[lineNr];
        const prevDoc = new DocumentModule(res, prevLine);
        const prevItems = Document.getItems(prevDoc) as any; //TSC
        const currLine = doc.textDocument.lineAt(lineNr).text;
        const currDoc = new DocumentModule(res, currLine);
        const currItems = Document.getItems(currDoc) as any; //TSC

        return _.isEqualWith(prevItems, currItems, (prevItem, currItem) => {
          if (prevItem instanceof Item && currItem instanceof Item) {
            return (
              prevItem.matchRange?.start === currItem.matchRange?.start &&
              (prevItem.matchRange?.end === currItem.matchRange?.end ||
                (_.trim(prevItem.match?.input) === _.trim(prevItem.text) &&
                  _.trim(currItem.match?.input) === _.trim(currItem.text) &&
                  !_.find(
                    currItems,
                    (items) =>
                      _.isArray(items) &&
                      items.find(
                        (item) =>
                          item !== currItem &&
                          _.trim(currItem.text).endsWith(item.text)
                      )
                  )))
            ); //TODO: Write it better
          }
        });
      });

      if (isUnchanged) {
        return;
      }
    }

    Document.update(res, true);
  }

  /* ITEMS */
  static getItems(doc: DocumentModule) {
    return {
      //   archive: doc.getArchive(),
      //   comments: doc.getComments(),
      //   formatted: Config.getKey("formatting.enabled") ? doc.getFormatted() : [],
      //   projects: doc.getProjects(),
      tags: doc.getTags(),
      todosBox: doc.getTodosBox(),
      todosDone: doc.getTodosDone(),
      todosCancelled: doc.getTodosCancelled(),
    };
  }

  static getItemsDecorations(
    items: any
  ): { type: TextEditorDecorationType; ranges: vscode.Range[] }[] {
    return _.concat(
      //   new Comment().getDecorations(items.comments),
      //   new Formatted().getDecorations(items.formatted),
      new Tag().getDecorations(items.tags),
      //   new Project().getDecorations(items.projects),
      new TodoDone().getDecorations(items.todosDone),
      new TodoCancelled().getDecorations(items.todosCancelled)
    );
  }
}

/* EXPORT */
export default Document;
