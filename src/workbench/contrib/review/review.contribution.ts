import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';
import { AIService } from '../../../platform/ai/aiService';

export class ReviewContribution implements IWorkbenchContribution {
  private _ai = new AIService();

  activate(store: DisposableStore): void {
    store.add(vscode.commands.registerCommand('mycode-ai.reviewFile', () => this._review()));
    store.add(vscode.commands.registerCommand('mycode-ai.reviewWorkspace', () => this._review()));
    store.add(vscode.commands.registerCommand('mycode-ai.generateDoc', () => this._doc()));
    store.add(vscode.commands.registerCommand('mycode-ai.refactor', () => this._refactor()));
  }

  private async _review() {
    const e = vscode.window.activeTextEditor; if (!e) return;
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Reviewing...' }, async () => {
      try {
        const r = await this._ai.reviewCode(e.document.getText(), e.document.languageId);
        const coll = vscode.languages.createDiagnosticCollection('mycode-ai-review');
        const diags = r.split('\n').filter(l => l.trim()).map((l, i) => new vscode.Diagnostic(new vscode.Range(i, 0, i, 100), l.trim(), vscode.DiagnosticSeverity.Information));
        coll.set(e.document.uri, diags);
        vscode.window.showInformationMessage(`Review: ${diags.length} issues`);
      } catch (err) { vscode.window.showErrorMessage(String(err)); }
    });
  }

  private async _doc() {
    const e = vscode.window.activeTextEditor; if (!e) return;
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Generating docs...' }, async () => {
      try {
        const r = await this._ai.chat([{ role: 'system', content: 'Generate comprehensive documentation.' }, { role: 'user', content: e.document.getText().substring(0, 5000) }]);
        const uri = vscode.Uri.file(e.document.fileName + '.md');
        await vscode.workspace.fs.writeFile(uri, Buffer.from(r));
        await vscode.window.showTextDocument(uri);
      } catch (err) { vscode.window.showErrorMessage(String(err)); }
    });
  }

  private async _refactor() {
    const e = vscode.window.activeTextEditor; if (!e) return;
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Refactoring...' }, async () => {
      try {
        const r = await this._ai.refactorCode(e.document.getText(), e.document.languageId);
        const doc = await vscode.workspace.openTextDocument({ content: r, language: e.document.languageId });
        await vscode.window.showTextDocument(doc);
      } catch (err) { vscode.window.showErrorMessage(String(err)); }
    });
  }
}
