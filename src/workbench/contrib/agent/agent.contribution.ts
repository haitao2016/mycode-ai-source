import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';
import { AIService } from '../../../platform/ai/aiService';

interface AgentTask { id: string; description: string; status: string; steps: Array<{action:string;result:string;time:number}> }

export class AgentContribution implements IWorkbenchContribution {
  private _ai = new AIService();
  private _view?: vscode.WebviewView;
  private _running = false;
  private _tasks: AgentTask[] = [];

  activate(store: DisposableStore): void {
    store.add(vscode.window.registerWebviewViewProvider('mycode-ai.agentView', {
      resolveWebviewView: (v, _c, _t) => { this._view = v; v.webview.options = { enableScripts: true }; v.webview.html = this._html(); v.webview.onDidReceiveMessage(m => this._onMsg(m)); },
      get webviewView() { return undefined as unknown as vscode.WebviewView; }
    } as vscode.WebviewViewProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    store.add(vscode.commands.registerCommand('mycode-ai.agentStart', () => { this._running = true; this._notify({ type: 'status', data: 'running' }); vscode.window.showInformationMessage('Agent started'); }));
    store.add(vscode.commands.registerCommand('mycode-ai.agentStop', () => { this._running = false; this._notify({ type: 'status', data: 'stopped' }); vscode.window.showInformationMessage('Agent stopped'); }));
    store.add(vscode.commands.registerCommand('mycode-ai.agentRun', () => this._runTask()));
    store.add(vscode.commands.registerCommand('mycode-ai.openAgent', () => vscode.commands.executeCommand('mycode-ai.agentView.focus')));
  }

  private async _onMsg(msg: { type: string; data: unknown }) {
    if (msg.type === 'start') { this._running = true; this._notify({ type: 'status', data: 'running' }); }
    if (msg.type === 'stop') { this._running = false; this._notify({ type: 'status', data: 'stopped' }); }
    if (msg.type === 'runTask') await this._runTask(msg.data as string);
  }

  private async _runTask(desc?: string) {
    if (!this._running) { vscode.window.showWarningMessage('Start agent first'); return; }
    const d = desc || await vscode.window.showInputBox({ prompt: 'Task', placeHolder: 'e.g. Create a React login component' });
    if (!d) return;
    const t: AgentTask = { id: String(Date.now()), description: d, status: 'running', steps: [] };
    this._tasks.unshift(t); this._notify({ type: 'taskStarted', data: t });
    const cfg = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = cfg.get<string>('apiKey', '');
    if (!apiKey) { t.status = 'failed'; t.steps.push({ action: 'Error', result: 'API key missing', time: Date.now() }); this._done(t); return; }
    try {
      for (let i = 0; i < cfg.get('mycode-ai.agent.maxIterations', 50) && this._running; i++) {
        const s = { action: `Step ${i+1}`, result: 'Analyzing...', time: Date.now() }; t.steps.push(s); this._notify({ type: 'step', data: { taskId: t.id, step: s } });
        await new Promise(r => setTimeout(r, 800));
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}, body:JSON.stringify({model:cfg.get('model','gpt-4o'),messages:[{role:'system',content:'You are an AI coding agent.'},{role:'user',content:`Task: ${d}`}],temperature:0.7,max_tokens:400}) });
          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          const c = data.choices?.[0]?.message?.content ?? 'No response';
          t.steps.push({ action: 'AI reasoning', result: c.substring(0, 200), time: Date.now() });
          this._notify({ type: 'step', data: { taskId: t.id, step: t.steps[t.steps.length-1] } });
        } catch {}
      }
      if (this._running) t.status = 'completed';
    } catch (e) { t.status = 'failed'; t.steps.push({ action:'Error', result:String(e), time:Date.now() }); }
    this._done(t);
  }

  private _done(t: AgentTask) { this._notify({ type:'taskCompleted', data:t }); this._notify({ type:'tasks', data:this._tasks }); vscode.window.showInformationMessage(`Task ${t.status}`); }
  private _notify(msg: { type:string; data:unknown }) { this._view?.webview.postMessage(msg); }

  private _html() { return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}
.header{padding:8px 12px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600}
.status{padding:2px 10px;border-radius:10px;font-size:11px}.running{background:#0e639c;color:#fff}.stopped{background:#3c3c3c;color:#9d9d9d}
.controls{padding:8px 12px;display:flex;gap:6px;background:#252526;border-bottom:1px solid #3c3c3c}
.controls input{flex:1;padding:6px 10px;background:#1e1e1e;border:1px solid #3c3c3c;border-radius:5px;color:#d4d4d4;font-size:12px;outline:0}
.controls input:focus{border-color:#007acc}
.controls button{padding:6px 12px;border:0;border-radius:5px;font-size:11px;font-weight:500;cursor:pointer}
.btn-run{background:#3794ff;color:#fff}.btn-start{background:#007acc;color:#fff}.btn-stop{background:#f14c4c;color:#fff}
.content{flex:1;overflow-y:auto;padding:10px}
.task{border-radius:6px;padding:10px;margin-bottom:10px;border-left:3px solid #007acc;background:#2d2d30}.task.running{border-color:#0e639c}.task.completed{border-color:#4ec9b0}.task.failed{border-color:#f14c4c}
.task-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.task-desc{font-weight:600;font-size:12.5px}
.task-status{font-size:10px;padding:1px 6px;border-radius:8px}.s-running{background:#0e639c;color:#fff}.s-completed{background:#379467;color:#fff}.s-failed{background:#9c2d2d;color:#fff}
.step{padding:3px 0;font-size:11px;color:#9d9d9d;border-bottom:1px solid #2d2d30}.step:last-child{border:0}
.step-action{color:#4ec9b0;font-weight:500}
.empty{text-align:center;color:#6e6e6e;padding:30px 16px;font-size:12px}
</style></head><body>
<div class="header"><span>AI Agent</span><span class="status stopped" id="st">Stopped</span></div>
<div class="controls"><input id="inp" placeholder="Describe your task..."><button class="btn-run" id="run" disabled>Run</button><button class="btn-start" id="start">Start</button><button class="btn-stop" id="stop" disabled>Stop</button></div>
<div class="content" id="cnt"><div class="empty">Start the agent and enter a task</div></div>
<script>const v=acquireVsCodeApi();let rn=false;
function ss(s){rn=s==='running';document.getElementById('st').className='status '+s;document.getElementById('st').textContent=s.charAt(0).toUpperCase()+s.slice(1);document.getElementById('start').disabled=rn;document.getElementById('stop').disabled=!rn;document.getElementById('run').disabled=!rn}
function rt(t){let st='';t.steps.forEach(s=>{st+='<div class="step"><span class="step-action">'+s.action+':</span> '+s.result+'</div>'});const el=document.getElementById('t-'+t.id);if(el){el.className='task '+t.status;el.innerHTML='<div class="task-header"><span class="task-desc">'+t.description+'</span><span class="task-status s-'+t.status+'">'+t.status+'</span></div>'+st}else{document.getElementById('cnt').innerHTML='<div class="task '+t.status+'" id="t-'+t.id+'"><div class="task-header"><span class="task-desc">'+t.description+'</span><span class="task-status s-'+t.status+'">'+t.status+'</span></div>'+st+'</div>'}}
document.getElementById('start').onclick=()=>v.postMessage({type:'start'});document.getElementById('stop').onclick=()=>v.postMessage({type:'stop'});document.getElementById('run').onclick=()=>{v.postMessage({type:'runTask',data:document.getElementById('inp').value.trim()});document.getElementById('inp').value=''};document.getElementById('inp').onkeydown=e=>{if(e.key==='Enter'&&rn){e.preventDefault();document.getElementById('run').click()}};
window.addEventListener('message',e=>{const m=e.data;if(m.type==='status')ss(m.data);if(m.type==='taskStarted')rt(m.data);if(m.type==='step'){const el=document.getElementById('t-'+m.data.taskId);if(el){const d=document.createElement('div');d.className='step';d.innerHTML='<span class="step-action">'+m.data.step.action+':</span> '+m.data.step.result;el.appendChild(d)}}if(m.type==='taskCompleted')rt(m.data)});
</script></body></html>`; }
}
