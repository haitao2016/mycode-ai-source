import * as vscode from 'vscode';
import { AIService } from '../services/aiService';

export class AIPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai.chat';

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

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'sendMessage':
          await this._handleSendMessage(message.text);
          break;
        case 'getActiveEditorContent':
          this._sendActiveEditorContent();
          break;
        case 'insertCode':
          await this._insertCode(message.code);
          break;
      }
    });
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private async _handleSendMessage(text: string) {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const provider = config.get<string>('provider', 'openai');
    const apiKey = config.get<string>('apiKey', '');
    const model = config.get<string>('model', 'gpt-4');

    if (!apiKey) {
      this.postMessage({
        type: 'error',
        message: 'Please configure your API key in settings (mycode-ai.apiKey)',
      });
      return;
    }

    try {
      const response = await this._callAI(text, provider, apiKey, model);
      this.postMessage({
        type: 'response',
        text: response,
      });
    } catch (error) {
      this.postMessage({
        type: 'error',
        message: String(error),
      });
    }
  }

  private async _callAI(
    text: string,
    provider: string,
    apiKey: string,
    model: string
  ): Promise<string> {
    const aiService = new AIService({ provider, apiKey, model });
    const response = await aiService.sendMessage([
      { role: 'user', content: text },
    ]);
    return response.success ? response.message || '' : `Error: ${response.error}`;
  }

  private _sendActiveEditorContent() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const text = document.getText(selection);
      const fullText = document.getText();

      this.postMessage({
        type: 'activeEditorContent',
        selectedText: text,
        fullText: fullText,
        language: document.languageId,
        fileName: document.fileName,
      });
    }
  }

  private async _insertCode(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, code);
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode-AI Chat</title>
  <style>
    :root {
      --bg-primary: var(--vscode-editor-background);
      --bg-surface: var(--vscode-panel-background);
      --border: var(--vscode-panel-border);
      --text: var(--vscode-foreground);
      --text-secondary: var(--vscode-descriptionForeground);
      --accent: var(--vscode-focusBorder);
      --success: var(--vscode-testing-iconPassed);
      --error: var(--vscode-testing-iconFailed);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--text);
      background: var(--bg-primary);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header h1 { font-size: 13px; font-weight: 600; }
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      padding: 8px 12px;
      border-radius: 6px;
      max-width: 90%;
      word-break: break-word;
      font-size: 13px;
      line-height: 1.5;
    }
    .message.user {
      align-self: flex-end;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .message.ai {
      align-self: flex-start;
      background: var(--bg-surface);
      border: 1px solid var(--border);
    }
    .input-area {
      padding: 8px 12px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 8px;
    }
    .input-area textarea {
      flex: 1;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 6px 8px;
      color: var(--text);
      font-family: inherit;
      font-size: 13px;
      resize: none;
      min-height: 32px;
      max-height: 120px;
    }
    .input-area textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .input-area button {
      padding: 6px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .input-area button:hover {
      opacity: 0.9;
    }
    .status {
      padding: 4px 12px;
      font-size: 11px;
      color: var(--text-secondary);
      border-top: 1px solid var(--border);
    }
    .code-block {
      background: var(--vscode-textCodeBlock-background);
      border-radius: 4px;
      padding: 8px;
      margin: 4px 0;
      font-family: var(--vscode-editor-font-family);
      font-size: 12px;
      overflow-x: auto;
    }
    .code-block pre { margin: 0; }
  </style>
</head>
<body>
  <div class="header">
    <span>🤖</span>
    <h1>MyCode-AI</h1>
  </div>
  <div class="chat-container" id="chat"></div>
  <div class="input-area">
    <textarea id="input" rows="1" placeholder="输入消息..."></textarea>
    <button id="send">发送</button>
  </div>
  <div class="status" id="status">就绪</div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    const status = document.getElementById('status');

    function addMessage(text, sender) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';
      status.textContent = '正在思考...';
      vscode.postMessage({ type: 'sendMessage', text });
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'response':
          addMessage(message.text, 'ai');
          status.textContent = '就绪';
          break;
        case 'error':
          addMessage('Error: ' + message.message, 'ai');
          status.textContent = '错误';
          break;
      }
    });
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
