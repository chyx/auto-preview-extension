import * as _ from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import { TextEdit } from "vscode";
import Document from "./todo/document";
import Todo from "./todo/items/todo";
import TodoBox from "./todo/items/todo_box";
import Editor from "./utils/editor";

/* CALL TODOS METHOD */
interface CallTodosMethodOptions {
  checkValidity: boolean;
  filter: (arg: any) => boolean;
  method: (...args: any) => any;
  args: [];
  errors: {
    invalid: "Only todos can perform this action";
    filtered: "This todo cannot perform this action";
  };
}

const DEFAULT: CallTodosMethodOptions = {
  checkValidity: false,
  filter: (x: any) => true,
  method: () => true,
  args: [],
  errors: {
    invalid: "Only todos can perform this action",
    filtered: "This todo cannot perform this action",
  },
};

async function callTodosMethod(methodName: (...args: any) => any) {
  const options: CallTodosMethodOptions = {
    ...DEFAULT,
    ...{
      method: methodName,
    },
  };

  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    return;
  }
  const doc = new Document(textEditor);

  const lines = _.uniq(
    _.flatten(
      textEditor?.selections.map((selection) =>
        _.range(selection.start.line, selection.end.line + 1)
      )
    )
  );
  const todos = lines
    .map((line) => doc.getTodoAt(line, options.checkValidity))
    .filter((x): x is Todo => x !== null);

  if (todos.length !== lines.length) {
    vscode.window.showErrorMessage(options.errors.invalid);
  }

  if (!todos.length) {
    return;
  }

  const todosFiltered: Todo[] = todos.filter(options.filter);

  if (todosFiltered.length !== todos.length) {
    vscode.window.showErrorMessage(options.errors.filtered);
  }

  if (!todosFiltered.length) {
    return;
  }

  todosFiltered.map((todo) => options.method.call(todo, ...options.args));

  const edits: TextEdit[] = _.filter(
    _.flattenDeep(todosFiltered.map((todo: Todo) => todo.makeEdit()))
  );

  if (!edits.length) {
    return;
  }

  // const selectionsTagIndexes = textEditor?.selections.map((selection) => {
  //   const line = textEditor?.document.lineAt(selection.start.line);
  //   return line.text.indexOf(Consts.symbols.tag);
  // });

  await Editor.edits.apply(textEditor, edits);

  // textEditor.selections = textEditor.selections.map((selection, index) => {
  //   // Putting the cursors before first new tag
  //   if (selectionsTagIndexes[index] >= 0) {
  //     return selection;
  //   }
  //   const line = textEditor.document.lineAt(selection.start.line);
  //   if (selection.start.character !== line.text.length) {
  //     return selection;
  //   }
  //   const tagIndex = line.text.indexOf(Consts.symbols.tag);
  //   if (tagIndex < 0) {
  //     return selection;
  //   }
  //   const position = new vscode.Position(selection.start.line, tagIndex);
  //   return new vscode.Selection(position, position);
  // });
}

function toggleBox() {
  return callTodosMethod(TodoBox.prototype.toggleBox);
}

function toggleDone() {
  return callTodosMethod(TodoBox.prototype.toggleDone);
}

function toggleCancelled() {
  return callTodosMethod(TodoBox.prototype.toggleCancelled);
}

// function toggleStart() {
//   return callTodosMethod({
//     checkValidity: true,
//     filter: (todo: Todo) => todo.isBox(),
//     method: "toggleStart",
//     errors: {
//       invalid: "Only todos can be started",
//       filtered: "Only not done/cancelled todos can be started",
//     },
//   });
// }

/* EXPORT */
export const MAP = 
  {
    toggleBox as editorToggleBox,
  toggleDone as editorToggleDone,
  toggleCancelled as editorToggleCancelled,
  };