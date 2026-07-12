import * as vscode from 'vscode';
import { ChatViewProvider } from './chat/provider';
import { AgentViewProvider } from './agent/provider';
import { CompletionProvider } from './completion/provider';
import { ReviewCommands } from './review/commands';
import { DebugCommands } from './debug/commands';
import { GitViewProvider, GitCommands } from './git/provider';
import { LspCommands } from './lsp/commands';
import { TaskCommands } from './task/commands';
import { SearchCommands } from './search/commands';

let chatProvider: ChatViewProvider;
let agentProvider: AgentViewProvider;
let gitProvider: GitViewProvider;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const isEnabled = config.get<boolean>('enabled', true);
  vscode.commands.executeCommand('setContext', 'mycode-ai.enabled', isEnabled);

  // Chat
  chatProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.chatView', chatProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.openChat', () =>
    vscode.commands.executeCommand('mycode-ai.chatView.focus')));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.chatClear', () => chatProvider.clear()));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.generateCode', () => handleAICommand('generateCode')));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.explainCode', () => handleAICommand('explainCode')));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.reviewCode', () => handleAICommand('reviewCode')));

  // Agent
  agentProvider = new AgentViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.agentView', agentProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.openAgent', () =>
    vscode.commands.executeCommand('mycode-ai.agentView.focus')));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.agentStart', () => agentProvider.start()));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.agentStop', () => agentProvider.stop()));
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.agentRun', () => agentProvider.runTask()));

  // Completion
  new CompletionProvider().register(context);

  // Review
  new ReviewCommands().register(context);

  // Debug
  new DebugCommands().register(context);

  // Git
  gitProvider = new GitViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.gitView', gitProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );
  GitCommands.register(context);

  // LSP
  new LspCommands().register(context);

  // Tasks
  new TaskCommands().register(context);

  // Search
  new SearchCommands().register(context);

  // Toggle
  context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.toggle', async () => {
    const cfg = vscode.workspace.getConfiguration('mycode-ai');
    const cur = cfg.get<boolean>('enabled', true);
    await cfg.update('enabled', !cur, true);
    vscode.commands.executeCommand('setContext', 'mycode-ai.enabled', !cur);
    vscode.window.showInformationMessage(`MyCode AI ${!cur ? 'enabled' : 'disabled'}`);
  }));

  // Status bar
  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  sb.text = '$(hubot) MyCode AI';
  sb.tooltip = 'MyCode AI is active';
  sb.show();
  context.subscriptions.push(sb);

  console.log('MyCode AI extension activated');
}

async function handleAICommand(type: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { vscode.window.showWarningMessage('No active editor'); return; }
  const sel = editor.document.getText(editor.selection);
  if (!sel) { vscode.window.showWarningMessage('Please select some code first'); return; }
  chatProvider.handleCodeAction(type, sel, editor.document.languageId);
  await vscode.commands.executeCommand('mycode-ai.chatView.focus');
}

export function deactivate() {
  console.log('MyCode AI extension deactivated');
}
