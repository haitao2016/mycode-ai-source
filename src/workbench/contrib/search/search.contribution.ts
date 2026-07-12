import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

export class SearchContribution implements IWorkbenchContribution {
  activate(store: DisposableStore): void {
    store.add(vscode.commands.registerCommand('mycode-ai.searchGlobal', () => this._search('global')));
    store.add(vscode.commands.registerCommand('mycode-ai.searchSymbol', () => this._search('symbol')));
    store.add(vscode.commands.registerCommand('mycode-ai.searchFile', () => this._search('file')));
  }

  private async _search(type: string) {
    const q = await vscode.window.showInputBox({ prompt: type === 'file' ? 'File name' : type === 'symbol' ? 'Symbol' : 'Search text', placeHolder: 'Search...' });
    if (!q) return;
    if (type === 'symbol') {
      try {
        const syms = await vscode.commands.executeCommand<Array<{ name: string; kind: string; location: { uri: vscode.Uri; range: vscode.Range } }>>('workbench.action.findSymbol', q);
        if (syms && syms.length > 0) {
          const items = syms.map(s => ({ label: s.name, description: `${s.kind} - ${s.location.uri.fsPath}:${s.location.range.start.line + 1}` }));
          const picked = await vscode.window.showQuickPick(items, { placeHolder: `${syms.length} symbols`, matchOnDescription: true });
          if (picked) { const sym = syms.find(s => s.name === picked.label); if (sym) await vscode.window.showTextDocument(sym.location.uri, { selection: sym.location.range }); }
        } else vscode.window.showInformationMessage('No symbols');
      } catch {}
      return;
    }
    if (type === 'file') {
      const files = await vscode.workspace.findFiles(`**/*${q}*`);
      if (files.length === 0) { vscode.window.showInformationMessage('No files'); return; }
      const items = files.map(f => ({ label: f.fsPath.split('/').pop() ?? '', description: f.fsPath }));
      const picked = await vscode.window.showQuickPick(items, { placeHolder: `${files.length} files`, matchOnDescription: true });
      if (picked) { const f = files.find(x => x.fsPath === picked.description); if (f) await vscode.window.showTextDocument(f); }
      return;
    }
    const files = await vscode.workspace.findFiles('**/*', '{node_modules,.git,dist}/**');
    const results: Array<{ uri: vscode.Uri; line: number; text: string }> = [];
    for (const uri of files) {
      try {
        const content = (await vscode.workspace.fs.readFile(uri)).toString();
        content.split('\n').forEach((line, i) => { if (line.includes(q)) results.push({ uri, line: i + 1, text: line.trim() }); });
      } catch { continue; }
    }
    if (results.length === 0) { vscode.window.showInformationMessage('No results'); return; }
    const items = results.map(r => ({ label: `${r.uri.fsPath}:${r.line}`, description: r.text.substring(0, 100) }));
    const picked = await vscode.window.showQuickPick(items, { placeHolder: `${results.length} results`, matchOnDescription: true });
    if (picked) {
      const [path, lineStr] = picked.label.split(':');
      await vscode.window.showTextDocument(vscode.Uri.file(path), { selection: new vscode.Selection(parseInt(lineStr) - 1, 0, parseInt(lineStr) - 1, 0) });
    }
  }
}
