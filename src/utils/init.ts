import * as vscode from "vscode";
import * as _ from "lodash";
import { MAP } from "../commands";

/* INIT */
class Init {
  static commands(context: vscode.ExtensionContext) {
    const { commands } = vscode.extensions.getExtension("chyx111.autopreview")
      ?.packageJSON.contributes ;
    if (commands) {
      commands.forEach(({ command, title }) => {
        const _ = title;
        const commandName = _.last(command.split(".")) as string;
        const handler = MAP.get(commandName);
        if (handler !== undefined) {
          const disposable = vscode.commands.registerCommand(command, handler);
          context.subscriptions.push(disposable);
        }
      });
    }
    return Commands;
  }
}

interface Command {
  command: string;
  title: string;
}

/* EXPORT */
export default Init;
