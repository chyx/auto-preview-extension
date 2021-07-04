import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as Commands from '../commands';

/* INIT */
const Init = {

  commands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ('chyx111.autopreview')?.packageJSON.contributes;
    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
        handler = Commands.get(commandName),
        disposable = vscode.commands.registerCommand ( command, handler );

      context.subscriptions.push ( disposable );

    });
    return Commands;
  },

};


/* EXPORT */
export default Init;
