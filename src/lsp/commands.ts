import * as vscode from 'vscode';

export class LspCommands {
  private _enabled = true;

  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.lspRestart', () => this.restart()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.lspStatus', () => this.showStatus()));
    const config = vscode.workspace.getConfiguration('mycode-ai.lsp');
    if (config.get('enabled', true)) this.start();
    vscode.workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('mycode-ai.lsp')) this.restart(); });
    this._registerProviders(context);
  }

  private async start() {
    const config = vscode.workspace.getConfiguration('mycode-ai.lsp');
    if (config.get('typescript.enabled', true)) {
      try { const ts = vscode.extensions.getExtension('vscode.typescript-language-features'); if (ts && !ts.isActive) await ts.activate(); } catch {}
    }
    if (config.get('python.enabled', true)) {
      try { const py = vscode.extensions.getExtension('ms-python.python'); if (py && !py.isActive) await py.activate(); } catch {}
    }
  }

  private async restart() { if (this._enabled) await this.start(); }

  private showStatus() {
    const ts = vscode.extensions.getExtension('vscode.typescript-language-features');
    const py = vscode.extensions.getExtension('ms-python.python');
    vscode.window.showInformationMessage(`LSP: TypeScript=${ts?.isActive ? 'Running' : 'Stopped'}, Python=${py?.isActive ? 'Running' : 'Stopped'}`);
  }

  private _registerProviders(context: vscode.ExtensionContext) {
    const langs = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'];
    context.subscriptions.push(vscode.languages.registerHoverProvider(langs, { provideHover: async () => new vscode.Hover('AI-powered hover') }));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(langs, { provideDefinition: async () => [] }));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(langs, { provideReferences: async () => [] }));
    context.subscriptions.push(vscode.languages.registerRenameProvider(langs, { provideRenameEdits: async () => null }));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(langs, { provideDocumentFormattingEdits: async () => [] }));
  }
}
