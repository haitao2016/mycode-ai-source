import * as vscode from 'vscode';
import { AIPanelProvider } from './panels/AIPanelProvider';
import { PlanPanelProvider } from './panels/PlanPanelProvider';
import { SkillsPanelProvider } from './panels/SkillsPanelProvider';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode-AI extension is now active');

  const config = vscode.workspace.getConfiguration('mycode-ai');
  const isEnabled = config.get<boolean>('enabled', true);

  vscode.commands.executeCommand(
    'setContext',
    'mycode-ai.enabled',
    isEnabled
  );

  const aiPanelProvider = new AIPanelProvider(context.extensionUri);
  const planPanelProvider = new PlanPanelProvider(context.extensionUri);
  const skillsPanelProvider = new SkillsPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AIPanelProvider.viewType,
      aiPanelProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PlanPanelProvider.viewType,
      planPanelProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SkillsPanelProvider.viewType,
      skillsPanelProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  registerCommands(context, {
    aiPanel: aiPanelProvider,
    planPanel: planPanelProvider,
    skillsPanel: skillsPanelProvider,
  });
}

export function deactivate() {
  console.log('MyCode-AI extension is now deactivated');
}
