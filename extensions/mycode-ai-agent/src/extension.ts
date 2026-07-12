import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: Array<{ action: string; result: string; timestamp: number }>;
}

interface AgentTool {
  name: string;
  description: string;
  execute: (...args: unknown[]) => Promise<string>;
}

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  const agentProvider = new AgentViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.agent', agentProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.agent.start', () => {
      agentProvider.startAgent();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.agent.stop', () => {
      agentProvider.stopAgent();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.agent.runTask', () => {
      agentProvider.runTask();
    })
  );

  console.log('MyCode AI Agent extension activated');
}

export function deactivate() {}

class AgentViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _isRunning = false;
  private _currentTask: AgentTask | null = null;
  private _tasks: AgentTask[] = [];

  private _tools: AgentTool[] = [
    {
      name: 'readFile',
      description: 'Read the content of a file',
      execute: async (...args: unknown[]) => {
        const filePath = args[0] as string;
        try {
          const uri = vscode.Uri.file(filePath);
          const content = await vscode.workspace.fs.readFile(uri);
          return new TextDecoder('utf-8').decode(content);
        } catch (e) {
          return 'Error reading file: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      }
    },
    {
      name: 'writeFile',
      description: 'Write content to a file',
      execute: async (...args: unknown[]) => {
        const filePath = args[0] as string;
        const content = args[1] as string;
        try {
          const uri = vscode.Uri.file(filePath);
          await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
          return 'File written successfully: ' + filePath;
        } catch (e) {
          return 'Error writing file: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      }
    },
    {
      name: 'listFiles',
      description: 'List files in a directory',
      execute: async (...args: unknown[]) => {
        const dirPath = args[0] as string;
        try {
          const uri = vscode.Uri.file(dirPath);
          const entries = await vscode.workspace.fs.readDirectory(uri);
          return entries.map(([name, type]) => `${type === vscode.FileType.Directory ? '[DIR]' : '[FILE]'} ${name}`).join('\n');
        } catch (e) {
          return 'Error listing files: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      }
    },
    {
      name: 'executeCommand',
      description: 'Execute a terminal command',
      execute: async (...args: unknown[]) => {
        const command = args[0] as string;
        return new Promise((resolve) => {
          const terminal = vscode.window.createTerminal('Agent Terminal');
          terminal.sendText(command);
          terminal.show();
          setTimeout(() => {
            terminal.dispose();
            resolve('Command executed: ' + command);
          }, 2000);
        });
      }
    },
    {
      name: 'openFile',
      description: 'Open a file in the editor',
      execute: async (...args: unknown[]) => {
        const filePath = args[0] as string;
        try {
          const uri = vscode.Uri.file(filePath);
          await vscode.window.showTextDocument(uri);
          return 'File opened: ' + filePath;
        } catch (e) {
          return 'Error opening file: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      }
    }
  ];

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'startAgent':
          this.startAgent();
          break;
        case 'stopAgent':
          this.stopAgent();
          break;
        case 'runTask':
          await this.runTask(message.data);
          break;
        case 'getTasks':
          webviewView.webview.postMessage({ type: 'tasks', data: this._tasks });
          break;
      }
    });
  }

  public startAgent() {
    this._isRunning = true;
    this._notifyWebview({ type: 'status', data: 'running' });
    vscode.window.showInformationMessage('AI Agent started');
  }

  public stopAgent() {
    this._isRunning = false;
    if (this._currentTask) {
      this._currentTask.status = 'failed';
      this._currentTask.steps.push({ action: 'Agent stopped', result: 'Task interrupted', timestamp: Date.now() });
    }
    this._notifyWebview({ type: 'status', data: 'stopped' });
    vscode.window.showInformationMessage('AI Agent stopped');
  }

  public async runTask(taskDescription?: string) {
    if (!this._isRunning) {
      vscode.window.showWarningMessage('Please start the agent first');
      return;
    }

    const description = taskDescription || await vscode.window.showInputBox({
      prompt: 'Enter task description',
      placeHolder: 'e.g., Create a React component for a login form'
    });

    if (!description) return;

    const task: AgentTask = {
      id: Date.now().toString(),
      description,
      status: 'running',
      steps: []
    };

    this._currentTask = task;
    this._tasks.unshift(task);

    this._notifyWebview({ type: 'taskStarted', data: task });

    const maxIterations = vscode.workspace.getConfiguration('mycode-ai.agent').get('maxIterations', 50);

    try {
      for (let i = 0; i < maxIterations && this._isRunning; i++) {
        const stepResult = await this._executeTaskStep(task, i + 1);
        if (stepResult === 'completed') {
          task.status = 'completed';
          break;
        }
      }

      if (!this._isRunning) {
        task.status = 'failed';
      }
    } catch (error) {
      task.status = 'failed';
      task.steps.push({ action: 'Error', result: error instanceof Error ? error.message : 'Unknown error', timestamp: Date.now() });
    }

    this._currentTask = null;
    this._notifyWebview({ type: 'taskCompleted', data: task });
    this._notifyWebview({ type: 'tasks', data: this._tasks });

    if (task.status === 'completed') {
      vscode.window.showInformationMessage('Task completed successfully');
    } else {
      vscode.window.showErrorMessage('Task failed or was interrupted');
    }
  }

  private async _executeTaskStep(task: AgentTask, step: number): Promise<string> {
    const stepInfo = { action: 'Step ' + step + ': Analyzing task', result: 'Thinking about next action...', timestamp: Date.now() };
    task.steps.push(stepInfo);
    this._notifyWebview({ type: 'taskStep', data: { taskId: task.id, step: stepInfo } });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const availableTools = this._tools.map(t => t.name + ': ' + t.description).join('\n');
    const taskContext = 'Task: ' + task.description + '\n\nAvailable tools:\n' + availableTools + '\n\nCurrent steps:\n' + task.steps.map(s => '- ' + s.action + ': ' + s.result).join('\n');

    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get('apiKey', '');

    if (!apiKey) {
      return 'API key not configured';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: config.get('model', 'gpt-4o'),
          messages: [
            { role: 'system', content: 'You are an AI coding agent. Analyze the task and decide which tool to use next.' },
            { role: 'user', content: taskContext }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content || '';

      const thinkingStep = { action: 'Thinking', result: content.substring(0, 200) + (content.length > 200 ? '...' : ''), timestamp: Date.now() };
      task.steps.push(thinkingStep);
      this._notifyWebview({ type: 'taskStep', data: { taskId: task.id, step: thinkingStep } });
    } catch (error) {
      const errorStep = { action: 'API Error', result: error instanceof Error ? error.message : 'Unknown error', timestamp: Date.now() };
      task.steps.push(errorStep);
      this._notifyWebview({ type: 'taskStep', data: { taskId: task.id, step: errorStep } });
      return 'error';
    }

    return 'continue';
  }

  private _notifyWebview(message: { type: string; data: unknown }) {
    this._view?.webview.postMessage(message);
  }

  private _getHtmlForWebview(): string {
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>MyCode AI Agent</title><style>' +
      'body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}' +
      '.agent-header{padding:12px 16px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;justify-content:space-between;align-items:center}' +
      '.agent-header h2{margin:0;font-size:14px;font-weight:600}' +
      '.agent-status{padding:4px 12px;border-radius:12px;font-size:12px;font-weight:500}' +
      '.agent-status.running{background:#0e639c;color:white}' +
      '.agent-status.stopped{background:#3c3c3c;color:#9d9d9d}' +
      '.agent-controls{padding:12px 16px;background:#252526;border-bottom:1px solid #3c3c3c;display:flex;gap:8px}' +
      '.agent-controls button{padding:8px 16px;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer}' +
      '.btn-start{background:#007acc;color:white}' +
      '.btn-start:hover{background:#005a9e}' +
      '.btn-stop{background:#f14c4c;color:white}' +
      '.btn-stop:hover{background:#c53d3d}' +
      '.btn-run{background:#3794ff;color:white}' +
      '.btn-run:hover{background:#277bc4}' +
      '.agent-input{flex:1;padding:8px 12px;background:#1e1e1e;border:1px solid #3c3c3c;border-radius:6px;color:#d4d4d4;font-size:12px;outline:none}' +
      '.agent-input:focus{border-color:#007acc}' +
      '.agent-content{flex:1;overflow-y:auto;padding:16px}' +
      '.task-card{background:#2d2d30;border-radius:8px;padding:12px;margin-bottom:12px;border-left:3px solid #007acc}' +
      '.task-card.completed{border-left-color:#4ec9b0}' +
      '.task-card.failed{border-left-color:#f14c4c}' +
      '.task-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
      '.task-description{font-weight:600;font-size:13px}' +
      '.task-status{font-size:11px;padding:2px 8px;border-radius:10px}' +
      '.status-running{background:#0e639c;color:white}' +
      '.status-completed{background:#379467;color:white}' +
      '.status-failed{background:#9c2d2d;color:white}' +
      '.task-step{padding:4px 0;font-size:12px;color:#9d9d9d;border-bottom:1px solid #3c3c3c}' +
      '.task-step:last-child{border-bottom:none}' +
      '.step-action{color:#4ec9b0;font-weight:500}' +
      '.step-result{margin-left:8px}' +
      '.empty-state{text-align:center;color:#6e6e6e;padding:40px 20px}' +
      '.empty-state h3{margin:0 0 8px 0;font-weight:500}' +
      '.empty-state p{margin:0;font-size:13px}' +
      '</style></head><body>' +
      '<div class="agent-header"><h2>AI Agent</h2><span class="agent-status stopped" id="agentStatus">Stopped</span></div>' +
      '<div class="agent-controls">' +
      '<input type="text" class="agent-input" placeholder="Enter task description..." id="taskInput">' +
      '<button class="btn-run" id="runBtn">Run Task</button>' +
      '<button class="btn-start" id="startBtn">Start Agent</button>' +
      '<button class="btn-stop" id="stopBtn" disabled>Stop Agent</button>' +
      '</div>' +
      '<div class="agent-content" id="agentContent"><div class="empty-state"><h3>Welcome to AI Agent Mode</h3><p>Start the agent and enter a task</p></div></div>' +
      '<script>' +
      'const vscode=acquireVsCodeApi();' +
      'const agentStatus=document.getElementById("agentStatus");' +
      'const startBtn=document.getElementById("startBtn");' +
      'const stopBtn=document.getElementById("stopBtn");' +
      'const runBtn=document.getElementById("runBtn");' +
      'const taskInput=document.getElementById("taskInput");' +
      'const agentContent=document.getElementById("agentContent");' +
      'let isRunning=false;' +
      'function updateStatus(status){isRunning=status==="running";agentStatus.className="agent-status "+status;agentStatus.textContent=status.charAt(0).toUpperCase()+status.slice(1);startBtn.disabled=isRunning;stopBtn.disabled=!isRunning;runBtn.disabled=!isRunning;}' +
      'function addTask(task){const taskCard=document.createElement("div");taskCard.className="task-card "+task.status;taskCard.id="task-"+task.id;let stepsHtml="";task.steps.forEach(step=>{stepsHtml+="<div class=\\"task-step\\"><span class=\\"step-action\\">"+step.action+"</span><span class=\\"step-result\\">"+step.result+"</span></div>";});taskCard.innerHTML="<div class=\\"task-header\\"><span class=\\"task-description\\">"+task.description+"</span><span class=\\"task-status status-"+task.status+"\\">"+task.status+"</span></div>"+stepsHtml;agentContent.innerHTML="";agentContent.appendChild(taskCard);}' +
      'startBtn.addEventListener("click",()=>{vscode.postMessage({type:"startAgent"});});' +
      'stopBtn.addEventListener("click",()=>{vscode.postMessage({type:"stopAgent"});});' +
      'runBtn.addEventListener("click",()=>{const description=taskInput.value.trim();vscode.postMessage({type:"runTask",data:description});taskInput.value="";});' +
      'taskInput.addEventListener("keydown",(e)=>{if(e.key==="Enter"&&isRunning){e.preventDefault();runBtn.click();}});' +
      'window.addEventListener("message",(event)=>{const msg=event.data;if(msg.type==="status"){updateStatus(msg.data);}if(msg.type==="taskStarted"){addTask(msg.data);}if(msg.type==="taskStep"){const taskCard=document.getElementById("task-"+msg.data.taskId);if(taskCard){const stepDiv=document.createElement("div");stepDiv.className="task-step";stepDiv.innerHTML="<span class=\\"step-action\\">"+msg.data.step.action+"</span><span class=\\"step-result\\">"+msg.data.step.result+"</span>";taskCard.appendChild(stepDiv);}}if(msg.type==="taskCompleted"){const taskCard=document.getElementById("task-"+msg.data.id);if(taskCard){taskCard.className="task-card "+msg.data.status;const statusSpan=taskCard.querySelector(".task-status");if(statusSpan){statusSpan.className="task-status status-"+msg.data.status;statusSpan.textContent=msg.data.status;}}}});' +
      'vscode.postMessage({type:"getTasks"});' +
      '<\/script></body></html>';
  }
}
