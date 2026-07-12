import * as vscode from 'vscode';
import { planService, Plan, Milestone, Task } from '../services/planService';

export class PlanPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai.plan';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'createPlan':
          this._handleCreatePlan(message.goal, message.description);
          break;
        case 'getPlans':
          this._sendPlans();
          break;
        case 'updateMilestoneStatus':
          this._handleUpdateMilestone(message.planId, message.milestoneId, message.status);
          break;
        case 'updateTaskStatus':
          this._handleUpdateTask(message.planId, message.milestoneId, message.taskId, message.status);
          break;
        case 'deletePlan':
          this._handleDeletePlan(message.planId);
          break;
      }
    });

    // Send initial plans
    this._sendPlans();
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private _handleCreatePlan(goal: string, description: string) {
    const plan = planService.createPlan(goal, description);
    this._sendPlans();
    this.postMessage({ type: 'planCreated', plan });
  }

  private _handleUpdateMilestone(planId: string, milestoneId: string, status: Milestone['status']) {
    planService.updateMilestoneStatus(planId, milestoneId, status);
    this._sendPlans();
  }

  private _handleUpdateTask(planId: string, milestoneId: string, taskId: string, status: Task['status']) {
    planService.updateTaskStatus(planId, milestoneId, taskId, status);
    this._sendPlans();
  }

  private _handleDeletePlan(planId: string) {
    planService.deletePlan(planId);
    this._sendPlans();
  }

  private _sendPlans() {
    const plans = planService.getAllPlans();
    this.postMessage({ type: 'plans', plans });
  }

  private _getHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --surface: var(--vscode-panel-background);
      --border: var(--vscode-panel-border);
      --text: var(--vscode-foreground);
      --text-secondary: var(--vscode-descriptionForeground);
      --accent: var(--vscode-focusBorder);
      --success: var(--vscode-testing-iconPassed);
      --warning: var(--vscode-editorWarning-foreground);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--text);
      background: var(--bg);
      padding: 12px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .header h1 { font-size: 13px; font-weight: 600; }
    .btn {
      padding: 4px 10px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover { opacity: 0.9; }
    .input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 6px 8px;
      color: var(--text);
      font-family: inherit;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .input:focus { outline: none; border-color: var(--accent); }
    .plan-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
      background: var(--surface);
    }
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .plan-title { font-size: 12px; font-weight: 600; }
    .plan-desc { font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; }
    .milestone {
      border-left: 2px solid var(--border);
      padding-left: 8px;
      margin: 6px 0;
    }
    .milestone-title {
      font-size: 11px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-pending { background: var(--text-secondary); }
    .status-in_progress { background: var(--warning); }
    .status-completed { background: var(--success); }
    .task {
      font-size: 11px;
      color: var(--text-secondary);
      padding: 2px 0 2px 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .empty {
      text-align: center;
      color: var(--text-secondary);
      font-size: 12px;
      padding: 20px;
    }
    .create-form {
      margin-bottom: 12px;
      display: none;
    }
    .create-form.active { display: block; }
    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .delete-btn {
      background: transparent;
      color: var(--vscode-errorForeground);
      border: none;
      cursor: pointer;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 开发计划</h1>
    <button class="btn" id="toggleForm">新建计划</button>
  </div>
  <div class="create-form" id="createForm">
    <input class="input" id="goalInput" placeholder="输入项目目标..." />
    <input class="input" id="descInput" placeholder="描述（可选）..." />
    <div class="form-actions">
      <button class="btn" id="cancelBtn">取消</button>
      <button class="btn" id="createBtn">创建</button>
    </div>
  </div>
  <div id="plans"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const toggleForm = document.getElementById('toggleForm');
    const createForm = document.getElementById('createForm');
    const goalInput = document.getElementById('goalInput');
    const descInput = document.getElementById('descInput');
    const createBtn = document.getElementById('createBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const plansContainer = document.getElementById('plans');

    toggleForm.addEventListener('click', () => {
      createForm.classList.toggle('active');
      if (createForm.classList.contains('active')) {
        goalInput.focus();
      }
    });

    cancelBtn.addEventListener('click', () => {
      createForm.classList.remove('active');
      goalInput.value = '';
      descInput.value = '';
    });

    createBtn.addEventListener('click', () => {
      const goal = goalInput.value.trim();
      if (!goal) return;
      vscode.postMessage({
        type: 'createPlan',
        goal,
        description: descInput.value.trim()
      });
      goalInput.value = '';
      descInput.value = '';
      createForm.classList.remove('active');
    });

    function renderPlans(plans) {
      if (!plans || plans.length === 0) {
        plansContainer.innerHTML = '<div class="empty">暂无计划，点击"新建计划"开始</div>';
        return;
      }
      plansContainer.innerHTML = plans.map(plan => \`
        <div class="plan-card">
          <div class="plan-header">
            <span class="plan-title">\${plan.name}</span>
            <button class="delete-btn" data-plan="\${plan.id}">删除</button>
          </div>
          <div class="plan-desc">\${plan.description || plan.goal}</div>
          \${plan.milestones.map(m => \`
            <div class="milestone">
              <div class="milestone-title">
                <span class="status-dot status-\${m.status}"></span>
                \${m.name}
              </div>
              \${m.tasks.map(t => \`
                <div class="task">
                  <span class="status-dot status-\${t.status}"></span>
                  \${t.name}
                </div>
              \`).join('')}
            </div>
          \`).join('')}
        </div>
      \`).join('');

      plansContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          vscode.postMessage({ type: 'deletePlan', planId: btn.dataset.plan });
        });
      });
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'plans') {
        renderPlans(message.plans);
      }
    });

    vscode.postMessage({ type: 'getPlans' });
  </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
