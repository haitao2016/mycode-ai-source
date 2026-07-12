import * as vscode from 'vscode';

let aiDebugPanel: vscode.WebviewPanel | undefined;

export class DebugCommands {
  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.debugStart', () => this.startDebug()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.debugAnalyzeError', () => this.analyzeError()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.debugAiAssist', () => this.openAiDebugAssistant()));
    context.subscriptions.push(vscode.debug.onDidStartDebugSession(() => console.log('Debug session started')));
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(() => console.log('Debug session terminated')));
  }

  private async startDebug() {
    const config = vscode.workspace.getConfiguration('mycode-ai.debug');
    if (!config.get('enabled', true)) { vscode.window.showErrorMessage('Debugging disabled'); return; }
    const type = await vscode.window.showQuickPick(['node', 'python', 'chrome'], { placeHolder: 'Select debug type' });
    if (!type) return;
    const names: Record<string, string> = { node: 'Launch Node.js', python: 'Python: Current File', chrome: 'Launch Chrome' };
    await vscode.debug.startDebugging(undefined, names[type]);
    if (config.get('autoAnalyzeErrors', false)) setTimeout(() => this.analyzeError(), 1000);
  }

  private async analyzeError() {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) { vscode.window.showErrorMessage('API key not configured'); return; }
    const diagnostics = vscode.languages.getDiagnostics();
    let errorText = '';
    diagnostics.forEach((items) => {
      if (Array.isArray(items)) items.forEach(d => {
        if (typeof d === 'object' && d && 'message' in d) errorText += (d as { message: string }).message + '\n';
      });
    });
    if (!errorText) { vscode.window.showInformationMessage('No errors found'); return; }
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Analyzing errors...' }, async () => {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: config.get('model', 'gpt-4o'), messages: [{ role: 'system', content: 'Analyze errors and provide fixes.' }, { role: 'user', content: errorText.substring(0, 2000) }], temperature: 0.5, max_tokens: 1000 }),
        });
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const doc = await vscode.workspace.openTextDocument({ content: data.choices?.[0]?.message?.content ?? '', language: 'markdown' });
        await vscode.window.showTextDocument(doc);
      } catch (e) { vscode.window.showErrorMessage('Failed: ' + String(e)); }
    });
  }

  private openAiDebugAssistant() {
    if (aiDebugPanel) { aiDebugPanel.reveal(); return; }
    aiDebugPanel = vscode.window.createWebviewPanel('mycode-ai.debug', 'AI Debug Assistant', vscode.ViewColumn.Beside, { enableScripts: true });
    aiDebugPanel.webview.html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:16px;font-family:-apple-system,sans-serif;background:#1e1e1e;color:#d4d4d4}
h2{color:#4ec9b0;font-size:14px}
button{display:block;width:100%;padding:10px;margin:6px 0;background:#007acc;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}
button:hover{background:#005a9e}
.card{background:#2d2d30;padding:12px;border-radius:8px;margin-bottom:12px}
.card p{font-size:12px;color:#9d9d9d;margin:4px 0}
</style></head><body>
<h2>AI Debug Assistant</h2>
<div class="card"><h3>Quick Actions</h3><button onclick="vscode.postMessage({type:'analyze'})">Analyze Errors</button><button onclick="vscode.postMessage({type:'evaluate'})">Evaluate Expression</button><button onclick="vscode.postMessage({type:'watch'})">Watch Variable</button></div>
<div class="card"><h3>Features</h3><p>Error analysis & fixing suggestions</p><p>Expression evaluation</p><p>Variable watching</p><p>Breakpoint management</p></div>
<script>const vscode=acquireVsCodeApi();</script></body></html>`;
    aiDebugPanel.onDidDispose(() => { aiDebugPanel = undefined; });
    aiDebugPanel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'analyze') await this.analyzeError();
    });
  }
}
