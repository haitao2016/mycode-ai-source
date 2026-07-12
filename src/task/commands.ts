import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

export class TaskCommands {
  public register(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('MyCode AI Tasks');
    context.subscriptions.push(outputChannel);
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.tasksBuild', () => this.build()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.tasksTest', () => this.test()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.tasksClean', () => this.clean()));
  }

  private async build() {
    const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
    if (config.get('autoOpenOutput', true)) outputChannel.show();
    outputChannel.appendLine('=== Building project ===\n');
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Building...' }, async (p) => {
      p.report({ increment: 0 });
      const t = vscode.window.createTerminal('Build');
      t.sendText('npm run build');
      t.show();
      p.report({ increment: 100 });
    });
    if (config.get('showNotifications', true)) vscode.window.showInformationMessage('Build started');
  }

  private async test() {
    const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
    if (config.get('autoOpenOutput', true)) outputChannel.show();
    outputChannel.appendLine('=== Running tests ===\n');
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Testing...' }, async () => {
      const t = vscode.window.createTerminal('Test');
      t.sendText('npm run test');
      t.show();
    });
    if (config.get('showNotifications', true)) vscode.window.showInformationMessage('Tests started');
  }

  private async clean() {
    const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
    if (config.get('autoOpenOutput', true)) outputChannel.show();
    outputChannel.appendLine('=== Cleaning build ===\n');
    const t = vscode.window.createTerminal('Clean');
    t.sendText('rm -rf dist release node_modules/.cache');
    t.show();
    if (config.get('showNotifications', true)) vscode.window.showInformationMessage('Clean started');
  }
}
