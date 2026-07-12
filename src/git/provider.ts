import * as vscode from 'vscode';

export class GitViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView, _ctx: vscode.WebviewViewResolveContext, _t: vscode.CancellationToken) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtml();
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'refresh') await GitCommands.showStatus();
      else if (msg.type === 'commit') await GitCommands.commit();
      else if (msg.type === 'push') await GitCommands.push();
      else if (msg.type === 'pull') await GitCommands.pull();
    });
  }

  private _getHtml(): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Git Control</title><style>
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}
.header{padding:8px 12px;background:#252526;border-bottom:1px solid #3c3c3c;font-size:13px;font-weight:600}
.controls{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px}
.controls button{flex:1;min-width:70px;padding:8px;border:0;border-radius:5px;background:#007acc;color:#fff;font-size:12px;font-weight:500;cursor:pointer}
.controls button:hover{background:#005a9e}
.content{padding:12px;flex:1;overflow-y:auto}
.info{background:#2d2d30;border-radius:6px;padding:10px;font-size:12px;color:#9d9d9d}
.info p{margin:4px 0}
</style></head><body>
<div class="header">Git Control</div>
<div class="controls">
<button onclick="send('refresh')">Refresh</button>
<button onclick="send('commit')">Commit</button>
<button onclick="send('push')">Push</button>
<button onclick="send('pull')">Pull</button>
</div>
<div class="content"><div class="info"><p>Use the buttons above to manage your Git repository</p></div></div>
<script>const v=acquireVsCodeApi();function send(t){v.postMessage({type:t})}</script></body></html>`;
  }
}

export class GitCommands {
  static register(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.gitStatus', () => GitCommands.showStatus()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.gitCommit', () => GitCommands.commit()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.gitPush', () => GitCommands.push()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.gitPull', () => GitCommands.pull()));
    GitCommands._setupStatusBar(context);
  }

  static async showStatus() {
    const git = vscode.extensions.getExtension('vscode.git');
    if (!git) { vscode.window.showErrorMessage('Git extension not found'); return; }
    if (!git.isActive) await git.activate();
    try {
      const api = git.exports.getAPI(1);
      const repos = api.repositories;
      if (repos.length === 0) { vscode.window.showInformationMessage('No Git repository'); return; }
      const r = repos[0];
      const branch = r.state.HEAD?.name ?? 'detached';
      const changes = r.state.workingTreeChanges.length;
      const staged = r.state.indexChanges.length;
      vscode.window.showInformationMessage(`Git: ${branch} | Staged: ${staged}, Changes: ${changes}`);
    } catch (e) { vscode.window.showErrorMessage('Failed: ' + String(e)); }
  }

  static async commit() {
    const msg = await vscode.window.showInputBox({ prompt: 'Commit message', placeHolder: 'Enter commit message' });
    if (!msg) return;
    const git = vscode.extensions.getExtension('vscode.git');
    if (!git) { vscode.window.showErrorMessage('Git extension not found'); return; }
    if (!git.isActive) await git.activate();
    try {
      const api = git.exports.getAPI(1);
      if (api.repositories.length === 0) { vscode.window.showErrorMessage('No Git repository'); return; }
      await api.repositories[0].commit(msg);
      vscode.window.showInformationMessage('Commit successful');
    } catch (e) { vscode.window.showErrorMessage('Commit failed: ' + String(e)); }
  }

  static async push() {
    const git = vscode.extensions.getExtension('vscode.git');
    if (!git) { vscode.window.showErrorMessage('Git extension not found'); return; }
    if (!git.isActive) await git.activate();
    try {
      const api = git.exports.getAPI(1);
      if (api.repositories.length === 0) { vscode.window.showErrorMessage('No Git repository'); return; }
      await api.repositories[0].push();
      vscode.window.showInformationMessage('Push successful');
    } catch (e) { vscode.window.showErrorMessage('Push failed: ' + String(e)); }
  }

  static async pull() {
    const git = vscode.extensions.getExtension('vscode.git');
    if (!git) { vscode.window.showErrorMessage('Git extension not found'); return; }
    if (!git.isActive) await git.activate();
    try {
      const api = git.exports.getAPI(1);
      if (api.repositories.length === 0) { vscode.window.showErrorMessage('No Git repository'); return; }
      await api.repositories[0].pull();
      vscode.window.showInformationMessage('Pull successful');
    } catch (e) { vscode.window.showErrorMessage('Pull failed: ' + String(e)); }
  }

  private static _setupStatusBar(context: vscode.ExtensionContext) {
    const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    async function update() {
      try {
        const git = vscode.extensions.getExtension('vscode.git');
        if (git?.isActive) {
          const api = git.exports.getAPI(1);
          if (api.repositories.length > 0) {
            const r = api.repositories[0];
            const branch = r.state.HEAD?.name ?? 'detached';
            const changes = r.state.workingTreeChanges.length;
            const staged = r.state.indexChanges.length;
            let text = `$(git-branch) ${branch}`;
            if (changes > 0) text += ` ~${changes}`;
            if (staged > 0) text += ` +${staged}`;
            sb.text = text; sb.show(); return;
          }
        }
        sb.hide();
      } catch { sb.hide(); }
    }
    update();
    context.subscriptions.push(sb);
  }
}
