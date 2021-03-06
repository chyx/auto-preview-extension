import * as vscode from "vscode";
import { TextEditorDecorationType } from "vscode";
import Consts from "../../consts";
import TodoDoneItem from "../items/todo_done";
import Line from "./line";

/* DECORATION TYPES */
const TODO_DONE = vscode.window.createTextEditorDecorationType({
  color: Consts.colors.done,
  // backgroundColor: Consts.colors.done,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  dark: {
    color: Consts.colors.dark.done,
  },
  light: {
    color: Consts.colors.light.done,
  },
});

/* TODO DONE */
class TodoDone extends Line {
  types = [TODO_DONE];

  getItemRanges(
    todoDone: TodoDoneItem,
    negRange?: vscode.Range | vscode.Range[]
  ): vscode.Range[] {
    return todoDone.range === null
      ? []
      : this.getRangeDifference(
          todoDone.text,
          todoDone.range,
          negRange || [Consts.regexes.tag, Consts.regexes.formattedCode]
        );
  }
}

/* EXPORT */
export default TodoDone;
