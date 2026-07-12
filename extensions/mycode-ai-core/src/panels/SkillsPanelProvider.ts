import * as vscode from 'vscode';
import { skillService, Skill, ClawHubSkill } from '../services/skillService';

export class SkillsPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai.skills';
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
        case 'getSkills':
          this._sendSkills();
          break;
        case 'toggleSkill':
          this._handleToggleSkill(message.skillId);
          break;
        case 'installSkill':
          this._handleInstallSkill(message.skill);
          break;
        case 'uninstallSkill':
          this._handleUninstallSkill(message.skillId);
          break;
        case 'searchClawHub':
          this._handleSearchClawHub(message.query);
          break;
      }
    });

    this._sendSkills();
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private _handleToggleSkill(skillId: string) {
    skillService.toggleSkill(skillId);
    this._sendSkills();
  }

  private _handleInstallSkill(skill: ClawHubSkill) {
    skillService.installSkill(skill);
    this._sendSkills();
  }

  private _handleUninstallSkill(skillId: string) {
    skillService.uninstallSkill(skillId);
    this._sendSkills();
  }

  private _handleSearchClawHub(query: string) {
    const results = skillService.searchClawHub(query);
    this.postMessage({ type: 'clawHubResults', results });
  }

  private _sendSkills() {
    const skills = skillService.getAllSkills();
    const clawHubSkills = skillService.getAllClawHubSkills();
    const quickStartGuides = skillService.getQuickStartGuides();
    this.postMessage({ type: 'skills', skills, clawHubSkills, quickStartGuides });
  }

  private _getHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skills</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --surface: var(--vscode-panel-background);
      --border: var(--vscode-panel-border);
      --text: var(--vscode-foreground);
      --text-secondary: var(--vscode-descriptionForeground);
      --accent: var(--vscode-focusBorder);
      --success: var(--vscode-testing-iconPassed);
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
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 4px;
    }
    .tab {
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    .tab.active {
      background: var(--surface);
      color: var(--text);
      font-weight: 500;
    }
    .tab:hover { color: var(--text); }
    .panel { display: none; }
    .panel.active { display: block; }
    .skill-item {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
      background: var(--surface);
    }
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .skill-name { font-size: 12px; font-weight: 600; }
    .skill-desc { font-size: 11px; color: var(--text-secondary); margin-bottom: 6px; }
    .skill-meta {
      font-size: 10px;
      color: var(--text-secondary);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tag {
      background: var(--bg);
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 10px;
    }
    .toggle-btn {
      padding: 2px 8px;
      font-size: 11px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .toggle-btn.enabled {
      background: var(--success);
      color: white;
    }
    .toggle-btn.disabled {
      background: var(--border);
      color: var(--text-secondary);
    }
    .install-btn {
      padding: 2px 8px;
      font-size: 11px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .search-input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 6px 8px;
      color: var(--text);
      font-family: inherit;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .empty {
      text-align: center;
      color: var(--text-secondary);
      font-size: 12px;
      padding: 20px;
    }
    .rating { color: var(--warning); }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ 技能管理</h1>
  </div>
  <div class="tabs">
    <div class="tab active" data-panel="installed">已安装</div>
    <div class="tab" data-panel="clawhub">ClawHub</div>
    <div class="tab" data-panel="quickstart">入门</div>
  </div>
  <div class="panel active" id="installedPanel">
    <div id="installedList"></div>
  </div>
  <div class="panel" id="clawhubPanel">
    <input class="search-input" id="searchInput" placeholder="搜索技能..." />
    <div id="clawHubList"></div>
  </div>
  <div class="panel" id="quickstartPanel">
    <div id="quickStartList"></div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    const installedList = document.getElementById('installedList');
    const clawHubList = document.getElementById('clawHubList');
    const quickStartList = document.getElementById('quickStartList');
    const searchInput = document.getElementById('searchInput');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.panel + 'Panel').classList.add('active');
      });
    });

    searchInput.addEventListener('input', (e) => {
      vscode.postMessage({ type: 'searchClawHub', query: e.target.value });
    });

    function renderInstalled(skills) {
      if (!skills || skills.length === 0) {
        installedList.innerHTML = '<div class="empty">暂无已安装技能</div>';
        return;
      }
      installedList.innerHTML = skills.map(skill => \`
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">\${skill.name}</span>
            <button class="toggle-btn \${skill.enabled ? 'enabled' : 'disabled'}"
              data-id="\${skill.id}">
              \${skill.enabled ? '已启用' : '已禁用'}
            </button>
          </div>
          <div class="skill-desc">\${skill.description}</div>
          <div class="skill-meta">
            <span class="tag">\${skill.type}</span>
            <span class="tag">v\${skill.version}</span>
            <span class="tag">\${skill.author || 'Unknown'}</span>
            \${skill.categories?.map(c => \`<span class="tag">\${c}</span>\`).join('') || ''}
          </div>
        </div>
      \`).join('');

      installedList.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          vscode.postMessage({ type: 'toggleSkill', skillId: btn.dataset.id });
        });
      });
    }

    function renderClawHub(skills) {
      if (!skills || skills.length === 0) {
        clawHubList.innerHTML = '<div class="empty">暂无结果</div>';
        return;
      }
      clawHubList.innerHTML = skills.map(skill => \`
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">\${skill.name}</span>
            <button class="install-btn" data-id="\${skill.id}">安装</button>
          </div>
          <div class="skill-desc">\${skill.description}</div>
          <div class="skill-meta">
            <span class="rating">★ \${skill.rating}</span>
            <span>\${skill.downloadCount.toLocaleString()} 下载</span>
            <span class="tag">\${skill.author}</span>
            \${skill.categories?.map(c => \`<span class="tag">\${c}</span>\`).join('') || ''}
          </div>
        </div>
      \`).join('');

      clawHubList.querySelectorAll('.install-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const skill = skills.find(s => s.id === btn.dataset.id);
          if (skill) vscode.postMessage({ type: 'installSkill', skill });
        });
      });
    }

    function renderQuickStart(guides) {
      if (!guides || guides.length === 0) {
        quickStartList.innerHTML = '<div class="empty">暂无入门指南</div>';
        return;
      }
      quickStartList.innerHTML = guides.map(guide => \`
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">\${guide.name}</span>
          </div>
          <div class="skill-desc">\${guide.description}</div>
          <div class="skill-meta">
            <span class="tag">\${guide.categories?.[0] || '指南'}</span>
          </div>
        </div>
      \`).join('');
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'skills') {
        renderInstalled(message.skills);
        renderClawHub(message.clawHubSkills);
        renderQuickStart(message.quickStartGuides);
      }
      if (message.type === 'clawHubResults') {
        renderClawHub(message.results);
      }
    });

    vscode.postMessage({ type: 'getSkills' });
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
