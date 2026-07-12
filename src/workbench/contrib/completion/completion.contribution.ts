import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

export class CompletionContribution implements IWorkbenchContribution {
  private _enabled = true;

  activate(store: DisposableStore): void {
    const cfg = vscode.workspace.getConfiguration('mycode-ai.completion');
    store.add(vscode.languages.registerCompletionItemProvider({ scheme: 'file' }, {
      provideCompletionItems: async (d, p, t) => {
        if (!this._enabled || t.isCancellationRequested) return [];
        const line = d.getText(new vscode.Range(p.line, 0, p.line, p.character));
        const m = line.match(/(\w+)$/); const prefix = m ? m[1] : '';
        if (prefix.length < cfg.get<number>('minPrefixLength', 2)) return [];
        const apiKey = vscode.workspace.getConfiguration('mycode-ai').get<string>('apiKey', '');
        if (!apiKey) return [];
        try {
          const before = d.getText(new vscode.Range(Math.max(0, p.line - 20), 0, p.line, p.character));
          const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}, body:JSON.stringify({model:vscode.workspace.getConfiguration('mycode-ai').get('model','gpt-4o'),messages:[{role:'system',content:'Complete code. Output ONLY completions, one per line. No explanations.'},{role:'user',content:`${before}█`}],temperature:0.3,max_tokens:100}) });
          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          const text = data.choices?.[0]?.message?.content ?? '';
          const max = cfg.get<number>('maxSuggestions', 5);
          return text.split('\n').filter(l => l.trim()).slice(0, max).map((l, i) => { const item = new vscode.CompletionItem(l.trim(), vscode.CompletionItemKind.Snippet); item.insertText = l.trim(); item.sortText = String.fromCharCode(65 + i); return item; });
        } catch { return []; }
      }
    }, '.', '(', ' ', ':'));
    store.add(vscode.commands.registerCommand('mycode-ai.completionToggle', () => { this._enabled = !this._enabled; vscode.window.showInformationMessage(`Completion ${this._enabled ? 'on' : 'off'}`); }));
  }
}
