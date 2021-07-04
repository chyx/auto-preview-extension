import * as _ from "lodash";
import stringMatches from "string-matches";
import * as vscode from "vscode";
import { TextEditorDecorationType } from "vscode";
import { MatchRange, Regex } from "../../utils/regex";
import LineItem from "../items/line";

/* LINE */

class Line {
  types: TextEditorDecorationType[] = [];

  /* RANGE */
  parseRanges(
    text: string,
    rangesRaw: vscode.Range | RegExp | vscode.Range[] | RegExp[]
  ): MatchRange[] {
    let negRanges = _.flatten(_.castArray(rangesRaw as any)); //TSC

    return _.flatten(
        negRanges.map((neg) => {
          if (!neg) {
            return;
          }

          if (neg instanceof vscode.Range) {
            return {
              start: neg.start.character,
              startLine: neg.start.line,
              end: neg.end.character,
              endLine: neg.end.line,
            };
          } else if (neg instanceof RegExp) {
            const matches = stringMatches(text, neg),
              ranges = Regex.matches2ranges(matches);

            return ranges;
          }
        })
      ).filter((x): x is MatchRange => x !== null);
  }

  getRangeDifference(
    text: string,
    posRange: vscode.Range,
    negRangesRaw: vscode.Range | RegExp | vscode.Range[] | RegExp[] = []
  ): vscode.Range[] {
    const posOffset = posRange.start.character;

    /* NEGATIVE RANGES */
    const negRanges = this.parseRanges(text, negRangesRaw)
      .filter((range) => range && range.start < range.end)
      .filter((x): x is MatchRange => x !== null);
    //  && (!range["line"] || range["line"] === posRange.start.line)
    // ); //TSC

    /* DIFFERENCE */
    if (!negRanges.length) {
      return [posRange];
    }

    // Algorithm:
    // 1. All cells start unfilled
    // 2. Filling all the positive cells
    // 3. Unfilling all the negative cells
    // 4. Transforming consecutive positive cells to ranges

    const cells = Array(posOffset + text.length); // 1.

    _.fill(cells, true, posRange.start.character, posRange.end.character); // 2.

    negRanges.forEach(({ start, end }) =>
      _.fill(cells, false, posOffset + start, posOffset + end)
    ); // 3.

    const ranges: vscode.Range[] = [];

    let start = null,
      end = null;

    for (let i = 0, l = cells.length; i < l; i++) {
      // 4.

      const cell = cells[i];

      if (start === null) {
        if (cell) {
          start = i;
        }
      } else {
        if (!cell) {
          end = i;
        }
      }

      if (start !== null && (end !== null || i === l - 1)) {
        //FIXME: What if there's only 1 character?
        end = end !== null ? end : l;
        ranges.push(
          new vscode.Range(posRange.start.line, start, posRange.start.line, end)
        );
        start = null;
        end = null;
      }
    }

    return ranges;
  }

  /* ITEMS */
  getItemRanges(
    item: LineItem,
    negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[]
  ): vscode.Range[] {
    return _.isEmpty(negRanges)
      ? (item.range === null ? [] : [item.range])
      : item.range === null
      ? []
      : this.getRangeDifference(item.text, item.range, negRanges);
  }

  getItemsRanges(
    items: LineItem[],
    negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[]
  ): vscode.Range[][] {
    const ranges = items.map((item) => this.getItemRanges(item, negRanges));
      const zipped = _.zip(...(ranges));
      const compact = zipped.map(_.compact);
      const concat = compact.map((r) => _.concat([], ...r));

    return concat;
  }

  getDecorations(
    items: LineItem[],
    negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[]
  ): vscode.Range[] {type: TextEditorDecorationType, ranges: []} {
    let ranges = this.getItemsRanges(items, negRanges);

    return this.types.map((type, index) => ({
      type,
      ranges: ranges[index] || [],
    }));
  }
}

/* EXPORT */
export default Line;
