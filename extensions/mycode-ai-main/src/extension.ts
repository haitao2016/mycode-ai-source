import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Main Extension activated');

  registerCommands(context);
  applyDefaultSettings();
  setupStatusBarItem(context);
  showWelcomeOnFirstStart(context);
}

function registerCommands(context: vscode.ExtensionContext) {
  const commands = [
    vscode.commands.registerCommand('mycode-ai.openChat', () => {
      vscode.commands.executeCommand('mycode-ai-chat.focus');
    }),
    vscode.commands.registerCommand('mycode-ai.openAgent', () => {
      vscode.commands.executeCommand('mycode-ai-agent.focus');
    }),
    vscode.commands.registerCommand('mycode-ai.codeReview', () => {
      vscode.commands.executeCommand('mycode-ai-review.reviewFile');
    }),
    vscode.commands.registerCommand('mycode-ai.semanticSearch', () => {
      vscode.commands.executeCommand('mycode-ai-search.search');
    }),
    vscode.commands.registerCommand('mycode-ai.refactor', () => {
      vscode.commands.executeCommand('editor.action.codeAction', {
        kind: 'refactor'
      });
    }),
    vscode.commands.registerCommand('mycode-ai.debug.analyzeError', () => {
      vscode.commands.executeCommand('mycode-ai-debug.analyzeError');
    }),
    vscode.commands.registerCommand('mycode-ai.showWelcome', () => {
      showWelcomePage(context);
    }),
    vscode.commands.registerCommand('mycode-ai.toggleTheme', () => {
      toggleTheme();
    })
  ];

  context.subscriptions.push(...commands);
}

function applyDefaultSettings() {
  const config = vscode.workspace.getConfiguration();
  const mycodeConfig = vscode.workspace.getConfiguration('mycode-ai');
  
  if (mycodeConfig.get('theme') === 'dark') {
    config.update(
      'workbench.colorTheme',
      'MyCode AI Dark',
      vscode.ConfigurationTarget.Global
    );
  } else if (mycodeConfig.get('theme') === 'light') {
    config.update(
      'workbench.colorTheme',
      'MyCode AI Light',
      vscode.ConfigurationTarget.Global
    );
  }
}

function setupStatusBarItem(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(sparkle) AI';
  statusBarItem.tooltip = 'MyCode AI - Click to open chat';
  statusBarItem.command = 'mycode-ai.openChat';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);
}

function showWelcomeOnFirstStart(context: vscode.ExtensionContext) {
  const hasShownWelcome = context.globalState.get<boolean>(
    'mycode-ai.hasShownWelcome',
    false
  );

  if (!hasShownWelcome) {
    showWelcomePage(context);
    context.globalState.update('mycode-ai.hasShownWelcome', true);
  }
}

function showWelcomePage(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'mycode-ai-welcome',
    'Welcome to MyCode AI',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  panel.webview.html = getWelcomePageHtml(panel.webview, context);
}

function getWelcomePageHtml(
  webview: vscode.Webview,
  context: vscode.ExtensionContext
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MyCode AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 18px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 40px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .card {
      padding: 16px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .card:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .card h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .card p {
      margin: 0;
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
    }
    .icon {
      font-size: 24px;
    }
  </style>
</head>
<body>
  <h1>Welcome to MyCode AI</h1>
  <p class="subtitle">Your AI-powered code editor</p>

  <div class="section">
    <h2>🚀 Get Started</h2>
    <div class="grid">
      <div class="card" onclick="vscode.postMessage({command: 'openFolder'})">
        <h3>Open Folder</h3>
        <p>Open a project folder to start coding</p>
      </div>
      <div class="card" onclick="vscode.postMessage({command: 'openChat'})">
        <h3>Start Chatting</h3>
        <p>Chat with AI about your code</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>✨ Features</h2>
    <div class="grid">
      <div class="card">
        <h3>AI Chat</h3>
        <p>Ask questions, get explanations, generate code</p>
      </div>
      <div class="card">
        <h3>Agent Mode</h3>
        <p>Let AI handle complex tasks automatically</p>
      </div>
      <div class="card">
        <h3>Code Completion</h3>
        <p>Intelligent code suggestions as you type</p>
      </div>
      <div class="card">
        <h3>Code Review</h3>
        <p>AI-powered code analysis and suggestions</p>
      </div>
      <div class="card">
        <h3>Semantic Search</h3>
        <p>Find code by meaning, not just keywords</p>
      </div>
      <div class="card">
        <h3>Refactor Assistant</h3>
        <p>Intelligent code refactoring suggestions</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>⌨️ Shortcuts</h2>
    <div class="grid">
      <div class="card">
        <h3>Open Chat</h3>
        <p>Ctrl+Shift+I (Cmd+Shift+I on Mac)</p>
      </div>
      <div class="card">
        <h3>Agent Mode</h3>
        <p>Ctrl+Shift+U (Cmd+Shift+U on Mac)</p>
      </div>
      <div class="card">
        <h3>Semantic Search</h3>
        <p>Ctrl+Shift+; (Cmd+Shift+; on Mac)</p>
      </div>
      <div class="card">
        <h3>Command Palette</h3>
        <p>Ctrl+Shift+P (Cmd+Shift+P on Mac)</p>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'openFolder') {
        vscode.postMessage({ command: 'openFolder' });
      } else if (message.command === 'openChat') {
        vscode.postMessage({ command: 'openChat' });
      }
    });
  </script>
</body>
</html>`;
}

function toggleTheme() {
  const config = vscode.workspace.getConfiguration();
  const currentTheme = config.get<string>('workbench.colorTheme');
  
  const newTheme = currentTheme === 'MyCode AI Dark' 
    ? 'MyCode AI Light' 
    : 'MyCode AI Dark';

  config.update(
    'workbench.colorTheme',
    newTheme,
    vscode.ConfigurationTarget.Global
  );

  vscode.window.showInformationMessage(`Theme switched to ${newTheme}`);
}

export function deactivate() {
  console.log('MyCode AI Main Extension deactivated');
}
