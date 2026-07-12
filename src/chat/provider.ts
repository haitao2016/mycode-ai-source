import * as vscode from 'vscode';
import { sendMessage, generateCode, explainCode, reviewCode } from '../aiService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _messages: Array<{ type: 'user' | 'bot'; content: string }> = [];

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._messages.push({ type: 'bot', content: "Hello! I'm MyCode AI, your intelligent coding assistant.\n\nAsk me anything about your code, or select code and use: Generate / Explain / Review." });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtml();
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'sendMessage') await this._handleMessage(msg.data);
      else if (msg.type === 'clear') this.clear();
    });
  }

  public clear() {
    this._messages = [{ type: 'bot', content: 'Chat cleared. How can I help?' }];
    this._update();
  }

  public async handleCodeAction(type: string, code: string, language: string) {
    const labels: Record<string, string> = { generateCode: 'Generate code from:', explainCode: 'Explain this code:', reviewCode: 'Review this code:' };
    this._messages.push({ type: 'user', content: `${labels[type]}\n
\`\`\`${language}
${code}
\`\`\`` });
    this._update();
    this._view?.webview.postMessage({ type: 'typing', data: true });
    let res;
    if (type === 'generateCode') res = await generateCode(code, language);
    else if (type === 'explainCode') res = await explainCode(code, language);
    else res = await reviewCode(code, language);
    this._view?.webview.postMessage({ type: 'typing', data: false });
    this._messages.push({ type: 'bot', content: res.success ? (res.message ?? 'No response') : `Error: ${res.error}` });
    this._update();
  }

  private async _handleMessage(text: string) {
    this._messages.push({ type: 'user', content: text });
    this._update();
    this._view?.webview.postMessage({ type: 'typing', data: true });
    const res = await sendMessage([
      { role: 'system', content: 'You are MyCode AI, an intelligent coding assistant. Be helpful, accurate, and concise.' },
      { role: 'user', content: text }
    ]);
    this._view?.webview.postMessage({ type: 'typing', data: false });
    this._messages.push({ type: 'bot', content: res.success ? (res.message ?? 'No response') : `Error: ${res.error}` });
    this._update();
  }

  private _update() {
    if (!this._view) return;
    this._view.webview.html = this._getHtml();
    this._messages.forEach(m => this._view?.webview.postMessage({ type: 'addMessage', data: m }));
  }

  private _getHtml(): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>MyCode AI Chat</title><style>
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}
.header{padding:10px 14px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600}
.header button{background:0;border:none;color:#9d9d9d;cursor:pointer;font-size:14px;padding:2px 6px}.header button:hover{color:#d4d4d4}
.messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column}
.msg{margin-bottom:12px;max-width:90%;animation:fadeIn .3s}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.msg.user{margin-left:auto}.msg.bot{margin-right:auto}
.msg-content{padding:8px 12px;border-radius:8px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.msg.user .msg-content{background:#007acc;color:#fff;border-bottom-right-radius:2px}
.msg.bot .msg-content{background:#2d2d30;color:#d4d4d4;border-bottom-left-radius:2px}
.msg.bot .msg-content code{background:#1e1e1e;padding:1px 4px;border-radius:3px;font-family:'Fira Code',monospace;font-size:11px}
.msg.bot .msg-content pre{background:#1e1e1e;padding:8px;border-radius:4px;overflow-x:auto;margin:6px 0}
.input-area{padding:10px 14px;background:#252526;border-top:1px solid #3c3c3c;display:flex;gap:8px}
.input-area input{flex:1;padding:8px 12px;background:#1e1e1e;border:1px solid #3c3c3c;border-radius:6px;color:#d4d4d4;font-size:12px;outline:0;font-family:inherit}
.input-area input:focus{border-color:#007acc}
.input-area button{padding:8px 16px;background:#007acc;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500}
.input-area button:hover{background:#005a9e}
.typing{display:none;align-items:center;gap:4px;padding:8px 12px;margin-bottom:8px}
.typing.active{display:flex}
.typing span{width:5px;height:5px;background:#9d9d9d;border-radius:50%;animation:typing 1.4s infinite}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
@keyframes typing{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
</style></head><body>
<div class="header"><span>AI Chat</span><button id="clearBtn" title="Clear chat">Clear</button></div>
<div class="messages" id="messages"><div class="typing" id="typing"><span></span><span></span><span></span></div></div>
<div class="input-area"><input type="text" id="input" placeholder="Ask anything..." autofocus><button id="sendBtn">Send</button></div>
<script>
const v=acquireVsCodeApi();
const msgs=document.getElementById('messages');
const input=document.getElementById('input');
const typing=document.getElementById('typing');
function addMsg(content,type){
  const d=document.createElement('div');d.className='msg '+type;
  d.innerHTML='<div class="msg-content">'+content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>';
  msgs.insertBefore(d,typing);msgs.scrollTop=msgs.scrollHeight;
}
function send(){const t=input.value.trim();if(!t)return;addMsg(t,'user');input.value='';v.postMessage({type:'sendMessage',data:t})}
document.getElementById('sendBtn').onclick=send;
input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
document.getElementById('clearBtn').onclick=()=>{while(msgs.firstChild!==typing)msgs.removeChild(msgs.firstChild);v.postMessage({type:'clear'})};
window.addEventListener('message',e=>{
  if(e.data.type==='addMessage')addMsg(e.data.data.content,e.data.data.type);
  if(e.data.type==='typing')typing.className='typing'+(e.data.data?' active':'');
});
</script></body></html>`;
  }
}
