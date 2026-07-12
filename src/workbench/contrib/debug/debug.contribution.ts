import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

export class DebugContribution implements IWorkbenchContribution {
  activate(store: DisposableStore): void {
    store.add(vscode.commands.registerCommand('mycode-ai.debugStart', () => this._start()));
    store.add(vscode.commands.registerCommand('mycode-ai.debugAnalyzeError', () => this._analyze()));
    store.add(vscode.commands.registerCommand('mycode-ai.debugAiAssist', () => this._assistant()));
  }

  private async _start() {
    const t = await vscode.window.showQuickPick(['node', 'python', 'chrome'], { placeHolder: 'Debug type' });
    if (!t) return;
    const names: Record<string, string> = { node: 'Launch Node.js', python: 'Python: Current File', chrome: 'Launch Chrome' };
    await vscode.debug.startDebugging(undefined, names[t]);
  }

  private async _analyze() {
    const apiKey = vscode.workspace.getConfiguration('mycode-ai').get<string>('apiKey', '');
    if (!apiKey) { vscode.window.showErrorMessage('API key not configured'); return; }
    const diags = vscode.languages.getDiagnostics();
    let text = ''; diags.forEach(items => items.forEach(d => { text += (d as { message: string }).message + '\n'; }));
    if (!text) { vscode.window.showInformationMessage('No errors'); return; }
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Analyzing...' }, async () => {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}, body:JSON.stringify({model:vscode.workspace.getConfiguration('mycode-ai').get('model','gpt-4o'),messages:[{role:'system',content:'Analyze errors and suggest fixes.'},{role:'user',content:text.substring(0,2000)}],temperature:0.5,max_tokens:1000}) });
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const doc = await vscode.workspace.openTextDocument({ content: data.choices?.[0]?.message?.content ?? '', language:'markdown' });
        await vscode.window.showTextDocument(doc);
      } catch (e) { vscode.window.showErrorMessage(String(e)); }
    });
  }

  private _assistant() {
    const p = vscode.window.createWebviewPanel('mycode-debug', 'AI Debug Assistant', vscode.ViewColumn.Beside, { enableScripts: true });
    p.webview.html = `<!DOCTYPE html><html><head><style>body{margin:0;padding:16px;font-family:-apple-system,sans-serif;background:#1e1e1e;color:#d4d4d4}button{display:block;width:100%;padding:10px;margin:6px 0;background:#007acc;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}</style></head><body><h2>AI Debug Assistant</h2><button onclick="vscode.postMessage({type:'analyze'})">Analyze Errors</button><p style="color:#9d9d9d;font-size:12px">Select a command to get AI-powered debugging help.</p><script>const vscode=acquireVsCodeApi()</script></body></html>`;
    p.webview.onDidReceiveMessage(async m => { if (m.type === 'analyze') await this._analyze(); });
  }
}
