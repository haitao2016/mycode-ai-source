import * as vscode from 'vscode';

export class SearchCommands {
  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.searchGlobal', () => this.globalSearch()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.searchSymbol', () => this.symbolSearch()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.searchFile', () => this.fileSearch()));
  }

  private async globalSearch() {
    const query = await vscode.window.showInputBox({ prompt: 'Search query', placeHolder: 'Search workspace...' });
    if (!query) return;
    try {
      const files = await vscode.workspace.findFiles('**/*', '{node_modules,.git,dist}/**');
      const results: Array<{ uri: vscode.Uri; line: number; text: string }> = [];
      for (const uri of files) {
        try {
          const content = (await vscode.workspace.fs.readFile(uri)).toString();
          content.split('\n').forEach((line, i) => { if (line.includes(query)) results.push({ uri, line: i + 1, text: line.trim() }); });
        } catch { continue; }
      }
      if (results.length === 0) { vscode.window.showInformationMessage('No results'); return; }
      const items = results.map(r => ({ label: `${r.uri.fsPath}:${r.line}`, description: r.text.substring(0, 100) }));
      const selected = await vscode.window.showQuickPick(items, { placeHolder: `${results.length} results`, matchOnDescription: true });
      if (selected) {
        const [path, lineStr] = selected.label.split(':');
        await vscode.window.showTextDocument(vscode.Uri.file(path), { selection: new vscode.Selection(parseInt(lineStr) - 1, 0, parseInt(lineStr) - 1, 0) });
      }
    } catch (e) { vscode.window.showErrorMessage('Search failed: ' + String(e)); }
  }

  private async symbolSearch() {
    const query = await vscode.window.showInputBox({ prompt: 'Symbol name', placeHolder: 'Function, class, variable...' });
    if (!query) return;
    try {
      const symbols = await vscode.commands.executeCommand<Array<{ name: string; kind: string; location: { uri: vscode.Uri; range: vscode.Range } }>>('workbench.action.findSymbol', query);
      if (symbols && symbols.length > 0) {
        const items = symbols.map(s => ({ label: s.name, description: `${s.kind} - ${s.location.uri.fsPath}:${s.location.range.start.line + 1}` }));
        const selected = await vscode.window.showQuickPick(items, { placeHolder: `${symbols.length} symbols`, matchOnDescription: true });
        if (selected) {
          const sym = symbols.find(s => s.name === selected.label);
          if (sym) await vscode.window.showTextDocument(sym.location.uri, { selection: sym.location.range });
        }
      } else vscode.window.showInformationMessage('No symbols found');
    } catch {}
  }

  private async fileSearch() {
    const query = await vscode.window.showInputBox({ prompt: 'File name', placeHolder: 'Search files...' });
    if (!query) return;
    const files = await vscode.workspace.findFiles(`**/*${query}*`);
    if (files.length === 0) { vscode.window.showInformationMessage('No files found'); return; }
    const items = files.map(f => ({ label: f.fsPath.split('/').pop() ?? '', description: f.fsPath }));
    const selected = await vscode.window.showQuickPick(items, { placeHolder: `${files.length} files`, matchOnDescription: true });
    if (selected) {
      const file = files.find(f => f.fsPath === selected.description);
      if (file) await vscode.window.showTextDocument(file);
    }
  }
}
