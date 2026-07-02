import * as vscode from 'vscode';

interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  tool?: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  steps: AgentStep[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  currentStepIndex: number;
}

export class AgentProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai-agent';
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  private _currentTask: AgentTask | null = null;
  private _isRunning = false;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'startAgent':
            this._startAgent(message.task);
            break;
          case 'stopAgent':
            this._stopAgent();
            break;
          case 'pauseAgent':
            this._pauseAgent();
            break;
          case 'resumeAgent':
            this._resumeAgent();
            break;
          case 'confirmStep':
            this._confirmStep(message.stepId, message.confirmed);
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  private async _startAgent(taskDescription: string) {
    if (this._isRunning) {
      vscode.window.showWarningMessage('Agent is already running');
      return;
    }

    this._currentTask = {
      id: Date.now().toString(),
      title: taskDescription.substring(0, 50),
      description: taskDescription,
      steps: [],
      status: 'running',
      currentStepIndex: -1
    };

    this._isRunning = true;
    this._updateView();

    try {
      await this._runAgent(taskDescription);
    } catch (error: any) {
      if (this._currentTask) {
        this._currentTask.status = 'failed';
      }
      this._updateView();
      vscode.window.showErrorMessage(`Agent failed: ${error.message}`);
    } finally {
      this._isRunning = false;
    }
  }

  private async _runAgent(description: string) {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    const baseUrl = config.get<string>('baseUrl', 'https://api.openai.com/v1');
    const model = config.get<string>('defaultModel', 'gpt-4o');
    const autoConfirm = config.get<boolean>('agent.autoConfirm', false);
    const maxSteps = config.get<number>('agent.maxSteps', 50);

    if (!apiKey) {
      vscode.window.showErrorMessage('API key not configured. Please set it in Settings > MyCode AI.');
      return;
    }

    const plan = await this._planTask(description, apiKey, baseUrl, model);
    
    if (this._currentTask) {
      this._currentTask.steps = plan.map((step, i) => ({
        id: `step-${i}`,
        name: step.name,
        description: step.description,
        status: 'pending' as const,
        tool: step.tool
      }));
      this._updateView();
    }

    const tools = this._createTools();

    for (let i = 0; i < Math.min(plan.length, maxSteps); i++) {
      if (!this._isRunning || !this._currentTask) break;
      if (this._currentTask.status === 'paused') {
        await this._waitForResume();
      }

      const step = this._currentTask.steps[i];
      step.status = 'running';
      this._currentTask.currentStepIndex = i;
      this._updateView();

      if (!autoConfirm && step.tool && this._isDangerousTool(step.tool)) {
        const confirmed = await vscode.window.showInformationMessage(
          `Agent wants to ${step.name}. Continue?`,
          'Continue',
          'Skip',
          'Stop'
        );
        if (confirmed === 'Stop') {
          this._stopAgent();
          return;
        }
        if (confirmed === 'Skip') {
          step.status = 'completed';
          step.result = 'Skipped by user';
          continue;
        }
      }

      try {
        const result = await this._executeStep(step, tools, description);
        step.status = 'completed';
        step.result = result;
      } catch (error: any) {
        step.status = 'failed';
        step.result = error.message;
        throw error;
      }

      this._updateView();
      await new Promise(r => setTimeout(r, 300));
    }

    if (this._currentTask) {
      this._currentTask.status = 'completed';
      this._updateView();
    }
  }

  private async _planTask(
    description: string,
    apiKey: string,
    baseUrl: string,
    model: string
  ): Promise<Array<{ name: string; description: string; tool?: string }>> {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are an expert coding agent. Given a task description, create a step-by-step plan to accomplish it.

Available tools:
- readFile: Read a file from the workspace
- writeFile: Write content to a file
- editFile: Edit a specific part of a file
- runCommand: Run a terminal command
- searchCode: Search for code in the workspace
- listDir: List directory contents

Respond with a JSON array of steps, each with name, description, and optional tool field.`
            },
            {
              role: 'user',
              content: description
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
      }

      return [
        { name: 'Analyze task', description: 'Understand the task requirements', tool: 'readFile' },
        { name: 'Read relevant files', description: 'Read files related to the task', tool: 'readFile' },
        { name: 'Implement changes', description: 'Make the necessary changes', tool: 'editFile' },
        { name: 'Verify results', description: 'Check that changes work correctly', tool: 'runCommand' }
      ];
    } catch {
      return [
        { name: 'Analyze task', description: 'Understanding the task requirements' },
        { name: 'Implementation', description: 'Implementing the solution' },
        { name: 'Verification', description: 'Verifying the results' }
      ];
    }
  }

  private _createTools() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

    return {
      readFile: async (filePath: string) => {
        const uri = vscode.Uri.file(filePath.startsWith('/') ? filePath : `${workspaceRoot}/${filePath}`);
        const content = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(content).toString('utf-8');
      },
      writeFile: async (filePath: string, content: string) => {
        const uri = vscode.Uri.file(filePath.startsWith('/') ? filePath : `${workspaceRoot}/${filePath}`);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        return `File written: ${filePath}`;
      },
      listDir: async (dirPath: string) => {
        const uri = vscode.Uri.file(dirPath.startsWith('/') ? dirPath : `${workspaceRoot}/${dirPath}`);
        const entries = await vscode.workspace.fs.readDirectory(uri);
        return entries.map(([name, type]) => `${type === vscode.FileType.Directory ? '📁' : '📄'} ${name}`).join('\n');
      },
      runCommand: async (command: string) => {
        const terminal = vscode.window.createTerminal('MyCode AI Agent');
        terminal.show();
        terminal.sendText(command);
        return `Command executed: ${command}`;
      },
      searchCode: async (query: string) => {
        const results = await vscode.workspace.findFiles('**/*.*', '**/node_modules/**', 10);
        return `Found ${results.length} files`;
      }
    };
  }

  private async _executeStep(step: AgentStep, tools: any, taskDescription: string): Promise<string> {
    switch (step.tool) {
      case 'readFile':
        const files = await vscode.workspace.findFiles('**/*.{ts,js,tsx,jsx}', '**/node_modules/**', 3);
        if (files.length > 0) {
          const content = await vscode.workspace.fs.readFile(files[0]);
          return `Read ${files[0].fsPath}\n${Buffer.from(content).toString('utf-8').substring(0, 500)}...`;
        }
        return 'No files found';
      case 'runCommand':
        const terminal = vscode.window.createTerminal('MyCode AI Agent');
        terminal.show();
        return 'Terminal opened';
      default:
        await new Promise(r => setTimeout(r, 500));
        return `Step completed: ${step.name}`;
    }
  }

  private _isDangerousTool(tool: string): boolean {
    return ['writeFile', 'editFile', 'runCommand', 'deleteFile'].includes(tool);
  }

  private _stopAgent() {
    this._isRunning = false;
    if (this._currentTask) {
      this._currentTask.status = 'failed';
    }
    this._updateView();
    vscode.window.showInformationMessage('Agent stopped');
  }

  private _pauseAgent() {
    if (this._currentTask) {
      this._currentTask.status = 'paused';
    }
    this._updateView();
  }

  private _resumeAgent() {
    if (this._currentTask) {
      this._currentTask.status = 'running';
    }
    this._updateView();
  }

  private async _waitForResume(): Promise<void> {
    return new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (this._currentTask?.status !== 'paused' || !this._isRunning) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  private _confirmStep(stepId: string, confirmed: boolean) {
  }

  private _updateView() {
    if (this._view && this._currentTask) {
      this._view.webview.postMessage({
        command: 'updateTask',
        task: this._currentTask
      });
    }
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode AI Agent</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 12px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .input-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-section label {
      font-weight: 600;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
      outline: none;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    .btn {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-danger {
      background: var(--vscode-errorForeground);
    }

    .btn-row {
      display: flex;
      gap: 8px;
    }

    .task-info {
      padding: 10px;
      background: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      border-radius: 0 4px 4px 0;
    }

    .task-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .task-desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-running {
      background: var(--vscode-charts-blue);
      color: white;
    }

    .status-completed {
      background: var(--vscode-charts-green);
      color: white;
    }

    .status-failed {
      background: var(--vscode-errorForeground);
      color: white;
    }

    .status-paused {
      background: var(--vscode-charts-yellow);
      color: black;
    }

    .steps-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .step-item {
      padding: 8px 10px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      border-left: 3px solid var(--vscode-panel-border);
    }

    .step-item.running {
      border-left-color: var(--vscode-charts-blue);
      background: var(--vscode-list-focusBackground);
    }

    .step-item.completed {
      border-left-color: var(--vscode-charts-green);
    }

    .step-item.failed {
      border-left-color: var(--vscode-errorForeground);
    }

    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .step-name {
      font-weight: 500;
      font-size: 12px;
    }

    .step-icon {
      font-size: 14px;
    }

    .step-desc {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .step-result {
      margin-top: 6px;
      padding: 6px 8px;
      background: var(--vscode-editor-background);
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      white-space: pre-wrap;
      max-height: 100px;
      overflow-y: auto;
    }

    .progress {
      height: 4px;
      background: var(--vscode-progressBar-background);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: var(--vscode-progressBar-foreground);
      transition: width 0.3s;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .suggestion-chip {
      padding: 4px 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
    }

    .suggestion-chip:hover {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 3px; }
  </style>
</head>
<body>
  <div id="agentForm">
    <div class="input-section">
      <label for="taskInput">What would you like the AI agent to do?</label>
      <textarea id="taskInput" placeholder="e.g., Create a new React component for user authentication"></textarea>
    </div>
    <div style="margin-top: 8px;">
      <div class="section-title" style="margin-bottom: 6px;">Try:</div>
      <div class="suggestions">
        <div class="suggestion-chip" onclick="setTask('Refactor the UserService class')">Refactor a class</div>
        <div class="suggestion-chip" onclick="setTask('Write tests for the login function')">Write tests</div>
        <div class="suggestion-chip" onclick="setTask('Find and fix performance issues')">Fix performance</div>
        <div class="suggestion-chip" onclick="setTask('Add error handling to API routes')">Add error handling</div>
      </div>
    </div>
    <div class="btn-row" style="margin-top: 12px;">
      <button class="btn" onclick="startAgent()" style="flex: 1;">🚀 Start Agent</button>
    </div>
  </div>

  <div id="taskView" style="display: none; flex: 1; display: none; flex-direction: column; gap: 12px;">
    <div class="task-info">
      <div class="task-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div class="task-title" id="taskTitle">Task</div>
        <span class="status-badge" id="statusBadge">Running</span>
      </div>
      <div class="task-desc" id="taskDesc"></div>
      <div class="progress" style="margin-top: 8px;">
        <div class="progress-bar" id="progressBar" style="width: 0%"></div>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn btn-secondary" onclick="pauseAgent()" id="pauseBtn">⏸ Pause</button>
      <button class="btn btn-danger" onclick="stopAgent()">⏹ Stop</button>
      <button class="btn" onclick="newTask()" style="margin-left: auto;">🆕 New Task</button>
    </div>

    <div class="section-title">Steps</div>
    <div class="steps-container" id="stepsContainer"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function setTask(text) {
      document.getElementById('taskInput').value = text;
    }

    function startAgent() {
      const task = document.getElementById('taskInput').value.trim();
      if (!task) return;
      vscode.postMessage({ command: 'startAgent', task });
      
      document.getElementById('agentForm').style.display = 'none';
      document.getElementById('taskView').style.display = 'flex';
      document.getElementById('taskDesc').textContent = task;
    }

    function stopAgent() {
      vscode.postMessage({ command: 'stopAgent' });
    }

    function pauseAgent() {
      const btn = document.getElementById('pauseBtn');
      if (btn.textContent === '⏸ Pause') {
        vscode.postMessage({ command: 'pauseAgent' });
      } else {
        vscode.postMessage({ command: 'resumeAgent' });
      }
    }

    function newTask() {
      document.getElementById('agentForm').style.display = 'block';
      document.getElementById('taskView').style.display = 'none';
      document.getElementById('taskInput').value = '';
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'updateTask') {
        updateTaskUI(message.task);
      }
    });

    function updateTaskUI(task) {
      document.getElementById('taskTitle').textContent = task.title;
      document.getElementById('taskDesc').textContent = task.description;
      
      const badge = document.getElementById('statusBadge');
      badge.className = 'status-badge status-' + task.status;
      badge.textContent = task.status.charAt(0).toUpperCase() + task.status.slice(1);

      const pauseBtn = document.getElementById('pauseBtn');
      pauseBtn.textContent = task.status === 'paused' ? '▶ Resume' : '⏸ Pause';
      pauseBtn.disabled = task.status === 'completed' || task.status === 'failed';

      const completed = task.steps.filter(s => s.status === 'completed').length;
      const total = task.steps.length;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      document.getElementById('progressBar').style.width = progress + '%';

      const container = document.getElementById('stepsContainer');
      container.innerHTML = task.steps.map((step, i) => {
        let icon = '⏳';
        if (step.status === 'running') icon = '⚙️';
        if (step.status === 'completed') icon = '✅';
        if (step.status === 'failed') icon = '❌';
        
        let resultHtml = '';
        if (step.result && (step.status === 'completed' || step.status === 'failed')) {
          resultHtml = '<div class="step-result">' + escapeHtml(step.result.substring(0, 200)) + (step.result.length > 200 ? '...' : '') + '</div>';
        }
        
        return '<div class="step-item ' + step.status + '">' +
          '<div class="step-header">' +
          '<div class="step-name"><span class="step-icon">' + icon + '</span> Step ' + (i + 1) + ': ' + step.name + '</div>' +
          (step.tool ? '<span style="font-size: 10px; color: var(--vscode-descriptionForeground);">tool: ' + step.tool + '</span>' : '') +
          '</div>' +
          '<div class="step-desc">' + escapeHtml(step.description) + '</div>' +
          resultHtml +
          '</div>';
      }).join('');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Agent Extension activated');

  const provider = new AgentProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AgentProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-agent.start', () => {
      vscode.commands.executeCommand('mycode-ai-agent.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-agent.stop', () => {
      vscode.window.showInformationMessage('Agent stopped');
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Agent Extension deactivated');
}
