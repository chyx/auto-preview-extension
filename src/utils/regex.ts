import * as _ from "lodash";
import { EndOfLine } from "vscode";

/* REGEX */

class Regex {
  static test(re: RegExp, str: string) {
    // It works even if the `g` flag is set
    re.lastIndex = 0; // Ensuring it works also for regexes with the `g` flag
    return re.test(str);
  }

  /* MATCHES */
  static matches2ranges(matches: RegExpMatchArray[]) {
    return matches.map(Regex.match2range);
  }

  static match2range(match: RegExpMatchArray) {
    const first = match[0],
      last = _.findLast(match, (txt) => txt && txt.length) as string, //TSC
      start = (match.index as number) + first.indexOf(last),
      end = start + last.length;

    return { start, end };
  }
}

class Range {
  start: start;
  end: end;
}

/* EXPORT */
export default Regex;
