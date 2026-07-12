import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

let oc: vscode.OutputChannel;

export class TaskContribution implements IWorkbenchContribution {
  activate(store: DisposableStore): void {
    oc = vscode.window.createOutputChannel('MyCode Tasks');
    store.add(oc);
    store.add(vscode.commands.registerCommand('mycode-ai.tasksBuild', () => this._run('Build', 'npm run build')));
    store.add(vscode.commands.registerCommand('mycode-ai.tasksTest', () => this._run('Test', 'npm run test')));
    store.add(vscode.commands.registerCommand('mycode-ai.tasksClean', () => this._run('Clean', 'rm -rf dist release node_modules/.cache')));
  }

  private async _run(label: string, cmd: string) {
    const c = vscode.workspace.getConfiguration('mycode-ai.tasks');
    if (c.get('autoOpenOutput', true)) oc.show();
    oc.appendLine(`=== ${label} ===\n`);
    const t = vscode.window.createTerminal(label);
    t.sendText(cmd); t.show();
    if (c.get('showNotifications', true)) vscode.window.showInformationMessage(`${label} started`);
  }
}
