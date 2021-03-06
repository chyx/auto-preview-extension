import * as _ from "lodash";
import stringMatches from "string-matches";
import * as vscode from "vscode";
import Consts from "../consts";
import Line from "./items/line";
import Todo from "./items/todo";
import Tag from "./items/tag";
import TodoBox from "./items/todo_box";
import TodoCancelled from "./items/todo_cancelled";
import TodoDone from "./items/todo_done";
import TodoFinished from "./items/todo_finished";

/* DOCUMENT */
class Document {
  textEditor?: vscode.TextEditor;
  textDocument: vscode.TextDocument;
  text?: string;

  constructor(res: vscode.TextDocument, text?: string) {
    this.textDocument = res;
    this.text = text;
    this.textEditor =
      vscode.window.visibleTextEditors.find((te) => te.document === res) ||
      vscode.window.activeTextEditor;
  }

  /* GET */
  getItems(
    item:
      | typeof Line
      | typeof TodoBox
      | typeof TodoFinished
      | typeof TodoDone
      | typeof TodoCancelled
      | typeof Todo,
    regex: RegExp
  ) {
    const matchText = _.isString(this.text)
        ? this.text
        : this.textDocument?.getText(),
      matches = stringMatches(matchText, regex);

    return matches.map((match) => {
      return new item(this.textDocument, undefined, match);
    });
  }

  getItemAt<
    T extends Line | TodoBox | TodoFinished | TodoDone | TodoCancelled | Todo
  >(
    item: { new (...args: any): T; is(line: string): boolean },
    lineNumber: number,
    checkValidity = true
  ): T | null {
    const line = this.textDocument.lineAt(lineNumber);

    if (checkValidity && !item.is(line.text)) {
      return null;
    }
    return new item(this.textDocument, line);
  }

  getLines() {
    return _.range(this.textDocument.lineCount).map((lineNr) =>
      this.getLineAt(lineNr)
    );
  }

  getLineAt(lineNr: number) {
    return this.getItemAt(Line, lineNr, false);
  }

  //   getArchive() {
  //     return this.getItems(Archive, Consts.regexes.archive)[0];
  //   }

  //   getComments() {
  //     return this.getItems(Comment, Consts.regexes.comment);
  //   }

  //   getCommentAt(lineNumber: number, checkValidity?) {
  //     return this.getItemAt(Comment, lineNumber, checkValidity);
  //   }

  //   getFormatted() {
  //     return this.getItems(Formatted, Consts.regexes.formatted);
  //   }

  //   getProjects() {
  //     return this.getItems(Project, Consts.regexes.project);
  //   }

  //   getProjectAt(lineNumber: number, checkValidity?) {
  //     return this.getItemAt(Project, lineNumber, checkValidity);
  //   }

  getTags() {
    return this.getItems(Tag, Consts.regexes.tagSpecialNormal);
  }

  getTodos() {
    return this.getItems(Todo, Consts.regexes.todo);
  }

  getTodoAt(lineNumber: number, checkValidity?: boolean): Todo | null {
    return this.getItemAt(Todo, lineNumber, checkValidity);
  }

  getTodosBox() {
    return this.getItems(TodoBox, Consts.regexes.todoBox);
  }

  getTodoBoxAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(TodoBox, lineNumber, checkValidity);
  }

  getTodosBoxStarted() {
    return this.getItems(TodoBox, Consts.regexes.todoBoxStarted);
  }

  getTodosDone() {
    return this.getItems(TodoDone, Consts.regexes.todoDone);
  }

  getTodoDoneAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(TodoDone, lineNumber, checkValidity);
  }

  getTodosCancelled() {
    return this.getItems(TodoCancelled, Consts.regexes.todoCancelled);
  }

  getTodoCancelledAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(TodoCancelled, lineNumber, checkValidity);
  }

  getTodosFinished() {
    return this.getItems(TodoFinished, Consts.regexes.todoFinished);
  }

  getTodoFinishedAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(TodoFinished, lineNumber, checkValidity);
  }

  /* IS */
  isSupported() {
    return true;
  }
}

/* EXPORT */

export default Document;
