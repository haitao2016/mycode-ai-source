import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

export class LspContribution implements IWorkbenchContribution {
  activate(store: DisposableStore): void {
    store.add(vscode.commands.registerCommand('mycode-ai.lspRestart', () => this._restart()));
    store.add(vscode.commands.registerCommand('mycode-ai.lspStatus', () => this._status()));
    this._restart();
  }

  private async _restart() {
    const c = vscode.workspace.getConfiguration('mycode-ai.lsp');
    if (c.get('typescript.enabled', true)) { try { const ts = vscode.extensions.getExtension('vscode.typescript-language-features'); if (ts && !ts.isActive) await ts.activate(); } catch {} }
    if (c.get('python.enabled', true)) { try { const py = vscode.extensions.getExtension('ms-python.python'); if (py && !py.isActive) await py.activate(); } catch {} }
  }

  private _status() {
    const ts = vscode.extensions.getExtension('vscode.typescript-language-features');
    const py = vscode.extensions.getExtension('ms-python.python');
    vscode.window.showInformationMessage(`LSP: TS=${ts?.isActive ? 'Running' : 'Stopped'}, Python=${py?.isActive ? 'Running' : 'Stopped'}`);
  }
}
