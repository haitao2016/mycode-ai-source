import * as vscode from 'vscode';
import { AgentTask } from '../types';

export class AgentViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _running = false;
  private _tasks: AgentTask[] = [];
  private _currentTask: AgentTask | null = null;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView, _ctx: vscode.WebviewViewResolveContext, _t: vscode.CancellationToken) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtml();
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'start': this.start(); break;
        case 'stop': this.stop(); break;
        case 'runTask': await this.runTask(msg.data); break;
        case 'getTasks': this._notify({ type: 'tasks', data: this._tasks }); break;
      }
    });
  }

  public start() { this._running = true; this._notify({ type: 'status', data: 'running' }); vscode.window.showInformationMessage('Agent started'); }
  public stop() {
    this._running = false;
    if (this._currentTask) { this._currentTask.status = 'failed'; this._currentTask.steps.push({ action: 'Stopped', result: 'Interrupted', timestamp: Date.now() }); }
    this._notify({ type: 'status', data: 'stopped' });
  }

  public async runTask(desc?: string) {
    if (!this._running) { vscode.window.showWarningMessage('Start the agent first'); return; }
    const description = desc || await vscode.window.showInputBox({ prompt: 'Task description', placeHolder: 'e.g., Create a React login component' });
    if (!description) return;
    const task: AgentTask = { id: String(Date.now()), description, status: 'running', steps: [] };
    this._currentTask = task; this._tasks.unshift(task);
    this._notify({ type: 'taskStarted', data: task });
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) { task.status = 'failed'; task.steps.push({ action: 'Error', result: 'API key not configured', timestamp: Date.now() }); this._done(task); return; }
    try {
      const maxIter = config.get('mycode-ai.agent.maxIterations', 50);
      for (let i = 0; i < maxIter && this._running; i++) {
        const step = { action: `Step ${i + 1}`, result: 'Analyzing...', timestamp: Date.now() };
        task.steps.push(step); this._notify({ type: 'step', data: { taskId: task.id, step } });
        await new Promise(r => setTimeout(r, 800));
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: config.get('model', 'gpt-4o'), messages: [{ role: 'system', content: 'You are an AI coding agent. Suggest next action.' }, { role: 'user', content: `Task: ${description}\nProgress: ${task.steps.map(s => `- ${s.action}: ${s.result}`).join('\n')}` }], temperature: 0.7, max_tokens: 400 }),
          });
          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          const content = data.choices?.[0]?.message?.content ?? 'No response';
          task.steps.push({ action: 'AI reasoning', result: content.substring(0, 200), timestamp: Date.now() });
          this._notify({ type: 'step', data: { taskId: task.id, step: task.steps[task.steps.length - 1] } });
        } catch { /* continue */ }
      }
      if (this._running) task.status = 'completed';
    } catch (e) { task.status = 'failed'; task.steps.push({ action: 'Error', result: String(e), timestamp: Date.now() }); }
    this._done(task);
  }

  private _done(task: AgentTask) {
    this._currentTask = null;
    this._notify({ type: 'taskCompleted', data: task });
    this._notify({ type: 'tasks', data: this._tasks });
    vscode.window.showInformationMessage(`Task ${task.status === 'completed' ? 'completed' : 'failed'}`);
  }

  private _notify(msg: { type: string; data: unknown }) { this._view?.webview.postMessage(msg); }

  private _getHtml(): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AI Agent</title><style>
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}
.header{padding:8px 12px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600}
.status{padding:2px 10px;border-radius:10px;font-size:11px}.running{background:#0e639c;color:#fff}.stopped{background:#3c3c3c;color:#9d9d9d}
.controls{padding:8px 12px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;gap:6px}
.controls input{flex:1;padding:6px 10px;background:#1e1e1e;border:1px solid #3c3c3c;border-radius:5px;color:#d4d4d4;font-size:12px;outline:0}
.controls input:focus{border-color:#007acc}
.controls button{padding:6px 12px;border:0;border-radius:5px;font-size:11px;font-weight:500;cursor:pointer}
.btn-run{background:#3794ff;color:#fff}.btn-start{background:#007acc;color:#fff}.btn-stop{background:#f14c4c;color:#fff}
.content{flex:1;overflow-y:auto;padding:10px}
.task{border-radius:6px;padding:10px;margin-bottom:10px;border-left:3px solid #007acc;background:#2d2d30}
.task.running{border-color:#0e639c}.task.completed{border-color:#4ec9b0}.task.failed{border-color:#f14c4c}
.task-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.task-desc{font-weight:600;font-size:12.5px}
.task-status{font-size:10px;padding:1px 6px;border-radius:8px}.s-running{background:#0e639c;color:#fff}.s-completed{background:#379467;color:#fff}.s-failed{background:#9c2d2d;color:#fff}
.step{padding:3px 0;font-size:11px;color:#9d9d9d;border-bottom:1px solid #2d2d30}.step:last-child{border:0}
.step-action{color:#4ec9b0;font-weight:500}
.empty{text-align:center;color:#6e6e6e;padding:30px 16px;font-size:12px}
</style></head><body>
<div class="header"><span>AI Agent</span><span class="status stopped" id="status">Stopped</span></div>
<div class="controls">
<input type="text" id="taskInput" placeholder="Describe your task...">
<button class="btn-run" id="runBtn" disabled>Run</button>
<button class="btn-start" id="startBtn">Start</button>
<button class="btn-stop" id="stopBtn" disabled>Stop</button>
</div>
<div class="content" id="content"><div class="empty">Start the agent and enter a task</div></div>
<script>
const v=acquireVsCodeApi();let running=false;
function setStatus(s){running=s==='running';document.getElementById('status').className='status '+s;document.getElementById('status').textContent=s.charAt(0).toUpperCase()+s.slice(1);document.getElementById('startBtn').disabled=running;document.getElementById('stopBtn').disabled=!running;document.getElementById('runBtn').disabled=!running}
function renderTask(t){let steps='';t.steps.forEach(s=>{steps+='<div class="step"><span class="step-action">'+s.action+':</span> '+s.result+'</div>'});const el=document.getElementById('task-'+t.id);if(el){el.className='task '+t.status;el.innerHTML='<div class="task-header"><span class="task-desc">'+t.description+'</span><span class="task-status s-'+t.status+'">'+t.status+'</span></div>'+steps}else{document.getElementById('content').innerHTML='<div class="task '+t.status+'" id="task-'+t.id+'"><div class="task-header"><span class="task-desc">'+t.description+'</span><span class="task-status s-'+t.status+'">'+t.status+'</span></div>'+steps+'</div>'}}
document.getElementById('startBtn').onclick=()=>v.postMessage({type:'start'});document.getElementById('stopBtn').onclick=()=>v.postMessage({type:'stop'});document.getElementById('runBtn').onclick=()=>{v.postMessage({type:'runTask',data:document.getElementById('taskInput').value.trim()});document.getElementById('taskInput').value=''};document.getElementById('taskInput').onkeydown=e=>{if(e.key==='Enter'&&running){e.preventDefault();document.getElementById('runBtn').click()}};
window.addEventListener('message',e=>{const m=e.data;if(m.type==='status')setStatus(m.data);if(m.type==='taskStarted')renderTask(m.data);if(m.type==='step'){const el=document.getElementById('task-'+m.data.taskId);if(el){const d=document.createElement('div');d.className='step';d.innerHTML='<span class="step-action">'+m.data.step.action+':</span> '+m.data.step.result;el.appendChild(d)}}if(m.type==='taskCompleted')renderTask(m.data)});
v.postMessage({type:'getTasks'});
</script></body></html>`;
  }
}
