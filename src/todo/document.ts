import * as _ from "lodash";
import stringMatches from "string-matches";
import * as vscode from "vscode";
import Consts from "../consts";
import Utils from "../utils";
import Line from "./items/line";
import Todo from "./items/todo";
import TodoBox from "./items/todo_box";
// import {
//   Line,
//   Archive,
//   Comment,
//   Formatted,
//   Project,
//   Tag,
//   Todo,
//   TodoBox,
//   TodoFinished,
//   TodoDone,
//   TodoCancelled,
// } from "./items";

/* DOCUMENT */

class Document {
  textEditor: vscode.TextEditor;
  textDocument: vscode.TextDocument;
  text?: string;

  constructor(res: vscode.TextEditor) {
    this.textEditor = res as vscode.TextEditor; //TSC
    this.textDocument = this.textEditor.document;
  }

  /* GET */

  getItems(
    item:
      | typeof Line
      //   | typeof TodoBox
      //   | typeof TodoFinished
      //   | typeof TodoDone
      //   | typeof TodoCancelled
      | typeof Todo,
    regex: RegExp
  ) {
    const matchText = _.isString(this.text)
        ? this.text
        : this.textDocument?.getText(),
      matches = stringMatches(matchText, regex);

    return matches.map((match) => {
      return new item(this.textEditor, undefined, match);
    });
  }

  getItemAt(
    item:
      | typeof Line
      //   | typeof Archive
      //   | typeof Comment
      //   | typeof Formatted
      //   | typeof Project
      //   | typeof Tag
      //   | typeof TodoBox
      //   | typeof TodoFinished
      //   | typeof TodoDone
      //   | typeof TodoCancelled
      | typeof Todo,
    lineNumber: number,
    checkValidity = true
  ) {
    const line = this.textDocument.lineAt(lineNumber);

    if (checkValidity && !item.is(line.text)) {
      return;
    }
    return new item(this.textEditor, line);
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

  //   getTags() {
  //     return this.getItems(Tag, Consts.regexes.tagSpecialNormal);
  //   }

  getTodos() {
    return this.getItems(Todo, Consts.regexes.todo);
  }

  getTodoAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(Todo, lineNumber, checkValidity);
  }

  getTodosBox() {
    return this.getItems(TodoBox, Consts.regexes.todoBox);
  }

  getTodoBoxAt(lineNumber: number, checkValidity?: boolean) {
    return this.getItemAt(TodoBox, lineNumber, checkValidity);
  }

  //   getTodosBoxStarted() {
  //     return this.getItems(TodoBox, Consts.regexes.todoBoxStarted);
  //   }

  //   getTodosDone() {
  //     return this.getItems(TodoDone, Consts.regexes.todoDone);
  //   }

  //   getTodoDoneAt(lineNumber: number, checkValidity?) {
  //     return this.getItemAt(TodoDone, lineNumber, checkValidity);
  //   }

  //   getTodosCancelled() {
  //     return this.getItems(TodoCancelled, Consts.regexes.todoCancelled);
  //   }

  //   getTodoCancelledAt(lineNumber: number, checkValidity?) {
  //     return this.getItemAt(TodoCancelled, lineNumber, checkValidity);
  //   }

  //   getTodosFinished() {
  //     return this.getItems(TodoFinished, Consts.regexes.todoFinished);
  //   }

  //   getTodoFinishedAt(lineNumber: number, checkValidity?) {
  //     return this.getItemAt(TodoFinished, lineNumber, checkValidity);
  //   }

  /* IS */
  isSupported() {
    return true;
  }
}

/* EXPORT */

export default Document;
