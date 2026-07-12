import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  const disposables: vscode.Disposable[] = [];

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.openChat', () => {
      openChatView();
    })
  );

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.openAgent', () => {
      openAgentView();
    })
  );

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.codeComplete', () => {
      triggerCodeComplete();
    })
  );

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.codeReview', () => {
      triggerCodeReview();
    })
  );

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.semanticSearch', () => {
      triggerSemanticSearch();
    })
  );

  disposables.push(
    vscode.commands.registerCommand('mycode-ai.refactor', () => {
      triggerRefactor();
    })
  );

  const chatViewProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.chatView', chatViewProvider)
  );

  const aiStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  aiStatusBar.text = '$(bot) MyCode AI';
  aiStatusBar.tooltip = 'MyCode AI is active';
  aiStatusBar.show();
  disposables.push(aiStatusBar);

  context.subscriptions.push(...disposables);

  console.log('MyCode AI Main Extension activated');
}

export function deactivate() {}

class ChatViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getWebviewContent();

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'sendMessage':
          handleChatMessage(message.data);
          break;
        case 'requestConfig':
          webviewView.webview.postMessage({
            type: 'config',
            data: vscode.workspace.getConfiguration('mycode-ai')
          });
          break;
      }
    });
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode AI Chat</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .chat-header {
      padding: 12px 16px;
      background: #252526;
      border-bottom: 1px solid #3c3c3c;
      font-weight: 600;
      font-size: 14px;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .message {
      margin-bottom: 16px;
      max-width: 80%;
    }
    .message.user {
      margin-left: auto;
    }
    .message.bot {
      margin-right: auto;
    }
    .message-content {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
    }
    .message.user .message-content {
      background: #007acc;
      color: white;
    }
    .message.bot .message-content {
      background: #2d2d30;
      color: #d4d4d4;
    }
    .chat-input-area {
      padding: 12px 16px;
      background: #252526;
      border-top: 1px solid #3c3c3c;
      display: flex;
      gap: 12px;
    }
    .chat-input {
      flex: 1;
      padding: 10px 14px;
      background: #1e1e1e;
      border: 1px solid #3c3c3c;
      border-radius: 6px;
      color: #d4d4d4;
      font-size: 13px;
      outline: none;
    }
    .chat-input:focus {
      border-color: #007acc;
    }
    .send-btn {
      padding: 10px 20px;
      background: #007acc;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .send-btn:hover {
      background: #005a9e;
    }
  </style>
</head>
<body>
  <div class="chat-header">MyCode AI</div>
  <div class="chat-messages">
    <div class="message bot">
      <div class="message-content">Hello! I'm MyCode AI, your intelligent coding assistant. How can I help you today?</div>
    </div>
  </div>
  <div class="chat-input-area">
    <input type="text" class="chat-input" placeholder="Type a message..." id="chatInput">
    <button class="send-btn" id="sendBtn">Send</button>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.querySelector('.chat-messages');

    function addMessage(content, type) {
      const message = document.createElement('div');
      message.className = 'message ' + type;
      message.innerHTML = '<div class="message-content">' + content + '</div>';
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      
      addMessage(text, 'user');
      chatInput.value = '';
      
      vscode.postMessage({
        type: 'sendMessage',
        data: text
      });
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'response':
          addMessage(message.data, 'bot');
          break;
        case 'config':
          console.log('Config:', message.data);
          break;
      }
    });

    vscode.postMessage({ type: 'requestConfig' });
  </script>
</body>
</html>`;
  }
}

async function openChatView() {
  const chatView = vscode.extensions.getExtension('mycode-ai.mycode-ai-main');
  if (chatView) {
    await vscode.commands.executeCommand('workbench.action.openView', 'mycode-ai.chatView');
  }
}

async function openAgentView() {
  vscode.window.showInformationMessage('Agent Mode is under development');
}

async function triggerCodeComplete() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }
  await vscode.commands.executeCommand('editor.action.triggerSuggest');
}

async function triggerCodeReview() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }
  
  const document = editor.document;
  const fullText = document.getText();
  
  vscode.window.showInformationMessage('Starting AI Code Review...');
  
  const panel = vscode.window.createWebviewPanel(
    'mycode-ai.codeReview',
    'AI Code Review',
    vscode.ViewColumn.Two,
    { enableScripts: true }
  );
  
  panel.webview.html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI Code Review</title>
  <style>
    body { background: #1e1e1e; color: #d4d4d4; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .review-item { margin-bottom: 16px; padding: 12px; background: #2d2d30; border-radius: 8px; }
    .review-title { font-weight: 600; margin-bottom: 8px; }
    .review-severity { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px; }
    .severity-high { background: #f14c4c; color: white; }
    .severity-medium { background: #cca700; color: white; }
    .severity-low { background: #3794ff; color: white; }
    .review-description { font-size: 13px; color: #9d9d9d; }
  </style>
</head>
<body>
  <h2>AI Code Review Results</h2>
  <p>Analyzing ${document.fileName}...</p>
  <div id="reviewResults"></div>
</body>
</html>`;
}

async function triggerSemanticSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'Enter search query',
    placeHolder: 'Search codebase...'
  });
  
  if (query) {
    vscode.window.showInformationMessage(`Searching for: ${query}`);
  }
}

async function triggerRefactor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }
  
  vscode.window.showInformationMessage('AI Refactor is under development');
}

async function handleChatMessage(message: string) {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  console.log('Chat message:', message);
  console.log('Config:', config);
}
