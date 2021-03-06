import * as vscode from "vscode";
import Consts from "../../consts";
import TagItem from "../items/tag";
import Line from "./line";

/* DECORATION TYPES */
const SPECIAL_TAGS = Consts.tags.names.map((_name: any, index: string | number) =>
  vscode.window.createTextEditorDecorationType({
    backgroundColor: Consts.colors.tags.background[index],
    color: Consts.colors.tags.foreground[index],
    borderRadius: "2px",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    dark: {
      backgroundColor: Consts.colors.dark.tags.background[index],
      color: Consts.colors.dark.tags.foreground[index],
    },
    light: {
      backgroundColor: Consts.colors.light.tags.background[index],
      color: Consts.colors.light.tags.foreground[index],
    },
  })
);

const TAG = vscode.window.createTextEditorDecorationType({
  color: Consts.colors.tag,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  dark: {
    color: Consts.colors.dark.tag,
  },
  light: {
    color: Consts.colors.light.tag,
  },
});

/* TAG */
class Tag extends Line {
  types = [...SPECIAL_TAGS, TAG];

  getItemRanges(tag: TagItem): vscode.Range[] {
    //FIXME: We are purposely not supporting tags inside code blocks, it's an uncommon case, we'll just be wasting some performance
    // this.TYPES.map ( ( type, index ) => tag.match[index + 1] && this.getRangeDifference ( tag.text, tag.range, [Consts.regexes.formattedCode] ) );
    return this.types
      .map((_type, index) => tag.match && tag.match[index + 1] && tag.range)
      .filter((x): x is vscode.Range => x !== null);
  }
}

/* EXPORT */
export default Tag;
