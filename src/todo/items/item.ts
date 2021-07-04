import * as _ from "lodash";
import * as vscode from "vscode";
import Regex from "../../utils/regex";

/* ITEM */

class Item {
  /* PROPERTIES */
  textEditor: vscode.TextEditor;
  textDocument: vscode.TextDocument;
  match?: RegExpMatchArray;
  _line;
  _pos: vscode.Position | undefined;
  _matchRange: MatchRange;
  _range: vscode.Range | undefined;
  _text: string | undefined;

  /* GETTERS */ // For performance reasons, trying to lazily evaluate as much as possible
  get line(): vscode.TextLine {
    if (!_.isUndefined(this._line)) {
      return this._line;
    }
    return (this._line =
      this.textDocument && this.matchRange
        ? this.textDocument.lineAt(this.lineNumber)
        : null);
  }

  get lineNumber(): number {
    // For performance reasons, sometimes we just don't need the entire line
    if (!_.isUndefined(this._pos)) {
      return this._pos.line;
    }
    this._pos = this.textDocument.positionAt(this.matchRange.start);
    return this._pos.line;
  }

  get matchRange() {
    if (!_.isUndefined(this._matchRange)) {
      return this._matchRange;
    }
    return (this._matchRange = this.match
      ? Regex.match2range(this.match)
      : null);
  }

  get range(): vscode.Range {
    if (!_.isUndefined(this._range)) {
      return this._range;
    }
    if (this.matchRange && this.lineNumber >= 0 && this._pos) {
      return (this._range = new vscode.Range(
        this._pos,
        new vscode.Position(
          this._pos.line,
          this._pos.character + (this.matchRange.end - this.matchRange.start)
        )
      ));
    } else if (this.line) {
      return (this._range = this.line.range);
    } else {
      return (this._range = null);
    }
  }

  get text() {
    if (!_.isUndefined(this._text)) {
      return this._text;
    }
    return (this._text = this.match ? _.findLast(this.match, _.isString)
      : this.line
      ? this.line.text
      : "");
  }

  /* CONSTRUCTOR */

  constructor(
    textEditor: vscode.TextEditor,
    line?: vscode.TextLine,
    match?: RegExpMatchArray
  ) {
    this.textEditor = textEditor || null;
    this.textDocument = textEditor.document;
    this._line = line;
    this.match = match;
  }

  /* IS */

  static is(str: string, regex: RegExp) {
    return Utils.regex.test(regex, str);
  }
}

/* EXPORT */

export default Item;