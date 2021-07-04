import * as vscode from "vscode";
import * as _ from "lodash";
import MAP from "../commands";

/* INIT */
class Init {
  static commands(context: vscode.ExtensionContext) {
    const { commands } = vscode.extensions.getExtension("chyx111.autopreview")
      ?.packageJSON.contributes;
    commands.forEach(({ command, title }) => {
      const commandName = _.last(command.split(".")) as string;
      const handler = MAP.get(commandName);
      const disposable = vscode.commands.registerCommand(command, handler);

      context.subscriptions.push(disposable);
    });
    return Commands;
  }
};

/* EXPORT */
export default Init;
