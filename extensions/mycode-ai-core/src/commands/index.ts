import * as vscode from 'vscode';
import { AIPanelProvider } from '../panels/AIPanelProvider';
import { PlanPanelProvider } from '../panels/PlanPanelProvider';
import { SkillsPanelProvider } from '../panels/SkillsPanelProvider';

interface PanelRefs {
  aiPanel: AIPanelProvider;
  planPanel: PlanPanelProvider;
  skillsPanel: SkillsPanelProvider;
}

export function registerCommands(context: vscode.ExtensionContext, panels: PanelRefs) {
  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.openChat', () => {
      vscode.commands.executeCommand('mycode-ai.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.openPlan', () => {
      vscode.commands.executeCommand('mycode-ai.plan.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.openSkills', () => {
      vscode.commands.executeCommand('mycode-ai.skills.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.generateCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage('Please select some code first');
        return;
      }
      panels.aiPanel.postMessage({
        type: 'generateCode',
        code: selection,
        language: editor.document.languageId,
      });
      vscode.commands.executeCommand('mycode-ai.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage('Please select some code first');
        return;
      }
      panels.aiPanel.postMessage({
        type: 'explainCode',
        code: selection,
        language: editor.document.languageId,
      });
      vscode.commands.executeCommand('mycode-ai.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.reviewCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage('Please select some code first');
        return;
      }
      panels.aiPanel.postMessage({
        type: 'reviewCode',
        code: selection,
        language: editor.document.languageId,
      });
      vscode.commands.executeCommand('mycode-ai.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.toggle', async () => {
      const config = vscode.workspace.getConfiguration('mycode-ai');
      const current = config.get<boolean>('enabled', true);
      await config.update('enabled', !current, true);
      vscode.commands.executeCommand('setContext', 'mycode-ai.enabled', !current);
      vscode.window.showInformationMessage(
        `MyCode-AI ${!current ? 'enabled' : 'disabled'}`
      );
    })
  );
}
