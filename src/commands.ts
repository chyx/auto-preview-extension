import * as _ from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import Document from "./todo/document";
import Todo from "./todo/items/todo";
import Editor from "./utils/editor";

/* CALL TODOS METHOD */
const callTodosMethodOptions = {
  checkValidity: false,
  filter: _.identity,
  method: undefined,
  args: [],
  errors: {
    invalid: "Only todos can perform this action",
    filtered: "This todo cannot perform this action",
  },
};

async function callTodosMethod(options?) {
  options = _.isString(options) ? { method: options } : options;
  options = _.merge({}, callTodosMethodOptions, options);

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
    ),
    todos = _.filter(
      lines.map((line) => doc.getTodoAt(line, options.checkValidity))
    );

  if (todos.length !== lines.length) {
    vscode.window.showErrorMessage(options.errors.invalid);
  }

  if (!todos.length) {
    return;
  }

  const todosFiltered = todos.filter(options.filter);

  if (todosFiltered.length !== todos.length) {
    vscode.window.showErrorMessage(options.errors.filtered);
  }

  if (!todosFiltered.length) {
    return;
  }

  todosFiltered.map((todo) => todo[options.method](...options.args));

  const edits = _.filter(
    _.flattenDeep(todosFiltered.map((todo: Todo) => todo["makeEdit"]()))
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
  return callTodosMethod("toggleBox");
}

function toggleDone() {
  return callTodosMethod("toggleDone");
}

function toggleCancelled() {
  return callTodosMethod("toggleCancelled");
}

function toggleStart() {
  return callTodosMethod({
    checkValidity: true,
    filter: (todo: Todo) => todo.isBox(),
    method: "toggleStart",
    errors: {
      invalid: "Only todos can be started",
      filtered: "Only not done/cancelled todos can be started",
    },
  });
}

/* EXPORT */
export {
  toggleBox as editorToggleBox,
  toggleDone as editorToggleDone,
  toggleCancelled as editorToggleCancelled,
  toggleStart as editorToggleStart,
};
