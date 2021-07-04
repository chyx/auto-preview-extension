import * as _ from "lodash";
import * as vscode from "vscode";
import {Regex, MatchRange} from "../../utils/regex";

/* ITEM */

class Item {
  /* PROPERTIES */
  textEditor: vscode.TextEditor;
  textDocument: vscode.TextDocument;
  match?: RegExpMatchArray;
  _line?: vscode.TextLine | null;
  _pos: vscode.Position | undefined;
  _matchRange: MatchRange | null | undefined;
  _range: vscode.Range | null | undefined;
  _text: string;

  /* GETTERS */ // For performance reasons, trying to lazily evaluate as much as possible
  get line(): vscode.TextLine | null {
    if (!_.isUndefined(this._line)) {
      return this._line;
    }
    if (this.textDocument && this.matchRange) {
        return this._line = this.textDocument.lineAt(this.lineNumber);
    } else {
        return null;
    }
  }

  get lineNumber(): number {
    // For performance reasons, sometimes we just don't need the entire line
    if (!_.isUndefined(this._pos)) {
      return this._pos.line;
    }
    if (this.matchRange) {
        this._pos = this.textDocument.positionAt(this.matchRange.start);
    }
    return this._pos?.line || 0;
  }

  get matchRange() {
    if (!_.isUndefined(this._matchRange)) {
      return this._matchRange;
    }
    return (this._matchRange = this.match
      ? Regex.match2range(this.match)
      : null);
  }

  get range(): vscode.Range | null {
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

  get text(): string {
    if (!_.isUndefined(this._text)) {
      return this._text;
    }
    return (this._text === this.match ? _.findLast(this.match, _.isString) as string
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
    return Regex.test(regex, str);
  }
}

/* EXPORT */

export default Item;
