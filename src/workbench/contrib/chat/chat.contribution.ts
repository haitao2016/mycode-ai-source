import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';
import { AIService } from '../../../platform/ai/aiService';

export class ChatContribution implements IWorkbenchContribution {
  private _ai = new AIService();
  private _view?: vscode.WebviewView;
  private _messages: Array<{ type: 'user' | 'bot'; content: string }> = [];

  activate(store: DisposableStore): void {
    this._messages = [{ type: 'bot', content: 'Hello! Ask me anything about your code.' }];
    store.add(vscode.window.registerWebviewViewProvider('mycode-ai.chatView', {
      resolveWebviewView: (v, _ctx, _t) => { this._view = v; v.webview.options = { enableScripts: true }; v.webview.html = this._html(); v.webview.onDidReceiveMessage(m => this._onMsg(m)); },
      get webviewView() { return undefined as unknown as vscode.WebviewView; }
    } as vscode.WebviewViewProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    store.add(vscode.commands.registerCommand('mycode-ai.openChat', () => vscode.commands.executeCommand('mycode-ai.chatView.focus')));
    store.add(vscode.commands.registerCommand('mycode-ai.chatClear', () => { this._messages = [{ type: 'bot', content: 'Chat cleared.' }]; this._update(); }));
    store.add(vscode.commands.registerCommand('mycode-ai.generateCode', () => this._codeAction('generateCode')));
    store.add(vscode.commands.registerCommand('mycode-ai.explainCode', () => this._codeAction('explainCode')));
    store.add(vscode.commands.registerCommand('mycode-ai.reviewCode', () => this._codeAction('reviewCode')));
  }

  private async _onMsg(msg: { type: string; data: unknown }) {
    if (msg.type === 'sendMessage') { const t = msg.data as string; this._messages.push({ type: 'user', content: t }); this._update(); this._view?.webview.postMessage({ type: 'typing', data: true }); try { const r = await this._ai.chat([{ role: 'system', content: 'You are MyCode AI. Be helpful.' }, { role: 'user', content: t }]); this._messages.push({ type: 'bot', content: r }); } catch (e) { this._messages.push({ type: 'bot', content: `Error: ${e}` }); } this._view?.webview.postMessage({ type: 'typing', data: false }); this._update(); }
    if (msg.type === 'clear') { this._messages = [{ type: 'bot', content: 'Cleared.' }]; this._update(); }
  }

  private async _codeAction(type: string) {
    const e = vscode.window.activeTextEditor; if (!e) return;
    const code = e.document.getText(e.selection); if (!code) { vscode.window.showWarningMessage('Select code first'); return; }
    const lang = e.document.languageId; const labels: Record<string, string> = { generateCode: 'Generate code', explainCode: 'Explain code', reviewCode: 'Review code' };
    this._messages.push({ type: 'user', content: `${labels[type]}:\n\`\`\`${lang}\n${code}\n\`\`\`` }); this._update();
    this._view?.webview.postMessage({ type: 'typing', data: true });
    let r: string; try {
      if (type === 'generateCode') r = await this._ai.generateCode(code, lang);
      else if (type === 'explainCode') r = await this._ai.explainCode(code, lang);
      else r = await this._ai.reviewCode(code, lang);
    } catch (e) { r = `Error: ${e}`; }
    this._view?.webview.postMessage({ type: 'typing', data: false });
    this._messages.push({ type: 'bot', content: r }); this._update();
    await vscode.commands.executeCommand('mycode-ai.chatView.focus');
  }

  private _update() { if (!this._view) return; this._view.webview.html = this._html(); this._messages.forEach(m => this._view?.webview.postMessage({ type: 'addMessage', data: m })); }

  private _html() { return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}
.header{padding:10px 14px;background:#252526;border-bottom:1px solid #3c3c3c;font-size:13px;font-weight:600;display:flex;justify-content:space-between}
.header button{background:0;border:none;color:#9d9d9d;cursor:pointer}.header button:hover{color:#d4d4d4}
.messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column}
.msg{margin-bottom:12px;max-width:90%;animation:fadeIn .3s}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.msg.user{margin-left:auto}.msg.bot{margin-right:auto}
.msg-content{padding:8px 12px;border-radius:8px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.msg.user .msg-content{background:#007acc;color:#fff}.msg.bot .msg-content{background:#2d2d30;color:#d4d4d4}
.input-area{padding:10px 14px;background:#252526;border-top:1px solid #3c3c3c;display:flex;gap:8px}
.input-area input{flex:1;padding:8px 12px;background:#1e1e1e;border:1px solid #3c3c3c;border-radius:6px;color:#d4d4d4;font-size:12px;outline:0}
.input-area input:focus{border-color:#007acc}
.input-area button{padding:8px 16px;background:#007acc;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500}
.typing{display:none;align-items:center;gap:4px;padding:8px}.typing.active{display:flex}
.typing span{width:5px;height:5px;background:#9d9d9d;border-radius:50%;animation:typing 1.4s infinite}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}@keyframes typing{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
</style></head><body>
<div class="header"><span>AI Chat</span><button id="clr">Clear</button></div>
<div class="messages" id="msgs"><div class="typing" id="typ"><span></span><span></span><span></span></div></div>
<div class="input-area"><input id="inp" placeholder="Ask anything..." autofocus><button id="snd">Send</button></div>
<script>const v=acquireVsCodeApi();const ms=document.getElementById('msgs'),inp=document.getElementById('inp'),typ=document.getElementById('typ');
function add(msg,ty){const d=document.createElement('div');d.className='msg '+ty;d.innerHTML='<div class="msg-content">'+msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>';ms.insertBefore(d,typ);ms.scrollTop=ms.scrollHeight}
function send(){const t=inp.value.trim();if(!t)return;add(t,'user');inp.value='';v.postMessage({type:'sendMessage',data:t})}
document.getElementById('snd').onclick=send;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send()}};
document.getElementById('clr').onclick=()=>{while(ms.firstChild!==typ)ms.removeChild(ms.firstChild);v.postMessage({type:'clear'})};
window.addEventListener('message',e=>{if(e.data.type==='addMessage')add(e.data.data.content,e.data.data.type);if(e.data.type==='typing')typ.className='typing'+(e.data.data?' active':'')});
</script></body></html>`; }
}
