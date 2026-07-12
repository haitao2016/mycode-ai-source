import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

export class GitContribution implements IWorkbenchContribution {
  activate(store: DisposableStore): void {
    store.add(vscode.window.registerWebviewViewProvider('mycode-ai.gitView', {
      resolveWebviewView: (v) => { v.webview.options = { enableScripts: true }; v.webview.html = this._html(); v.webview.onDidReceiveMessage(m => this._onMsg(m)); },
      get webviewView() { return undefined as unknown as vscode.WebviewView; }
    } as vscode.WebviewViewProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    store.add(vscode.commands.registerCommand('mycode-ai.gitStatus', () => GitContribution._status()));
    store.add(vscode.commands.registerCommand('mycode-ai.gitCommit', () => GitContribution._commit()));
    store.add(vscode.commands.registerCommand('mycode-ai.gitPush', () => GitContribution._push()));
    store.add(vscode.commands.registerCommand('mycode-ai.gitPull', () => GitContribution._pull()));
  }

  private async _onMsg(msg: { type: string }) {
    if (msg.type === 'status') await GitContribution._status();
    if (msg.type === 'commit') await GitContribution._commit();
    if (msg.type === 'push') await GitContribution._push();
    if (msg.type === 'pull') await GitContribution._pull();
  }

  static async _status() {
    try {
      const git = vscode.extensions.getExtension('vscode.git');
      if (git && !git.isActive) await git.activate();
      const api = git?.exports.getAPI(1);
      if (api?.repositories.length > 0) {
        const r = api.repositories[0]; const b = r.state.HEAD?.name ?? 'detached';
        vscode.window.showInformationMessage(`Git: ${b} | Staged: ${r.state.indexChanges.length}, Changes: ${r.state.workingTreeChanges.length}`);
      } else vscode.window.showInformationMessage('No Git repository');
    } catch (e) { vscode.window.showErrorMessage(String(e)); }
  }

  static async _commit() {
    const msg = await vscode.window.showInputBox({ prompt: 'Commit message', placeHolder: 'Enter commit message' });
    if (!msg) return;
    try {
      const git = vscode.extensions.getExtension('vscode.git'); if (git && !git.isActive) await git.activate();
      const api = git?.exports.getAPI(1); if (api?.repositories.length > 0) { await api.repositories[0].commit(msg); vscode.window.showInformationMessage('Committed'); }
    } catch (e) { vscode.window.showErrorMessage(String(e)); }
  }

  static async _push() { try { const git = vscode.extensions.getExtension('vscode.git'); if (git && !git.isActive) await git.activate(); await git?.exports.getAPI(1).repositories[0].push(); vscode.window.showInformationMessage('Pushed'); } catch (e) { vscode.window.showErrorMessage(String(e)); } }
  static async _pull() { try { const git = vscode.extensions.getExtension('vscode.git'); if (git && !git.isActive) await git.activate(); await git?.exports.getAPI(1).repositories[0].pull(); vscode.window.showInformationMessage('Pulled'); } catch (e) { vscode.window.showErrorMessage(String(e)); } }

  private _html() { return `<!DOCTYPE html><html><head><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}.header{padding:8px 12px;background:#252526;border-bottom:1px solid #3c3c3c;font-size:13px;font-weight:600}.controls{display:flex;flex-wrap:wrap;gap:6px;padding:10px}.controls button{flex:1;min-width:70px;padding:8px;border:0;border-radius:5px;background:#007acc;color:#fff;font-size:12px;cursor:pointer}.controls button:hover{background:#005a9e}.content{padding:12px;font-size:12px;color:#9d9d9d}</style></head><body><div class="header">Git Control</div><div class="controls"><button onclick="s('status')">Status</button><button onclick="s('commit')">Commit</button><button onclick="s('push')">Push</button><button onclick="s('pull')">Pull</button></div><div class="content"><p>Use the buttons above to manage your Git repository</p></div><script>const v=acquireVsCodeApi();function s(t){v.postMessage({type:t})}</script></body></html>`; }
}
