import * as vscode from 'vscode';
import * as path from 'path';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  const chatProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.chat', chatProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.chat.focus', () => {
      vscode.commands.executeCommand('workbench.action.openView', 'mycode-ai.chat');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.chat.clear', () => {
      chatProvider.clearChat();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.chat.askSelection', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && !editor.selection.isEmpty) {
        const selectedText = editor.document.getText(editor.selection);
        chatProvider.askAboutSelection(selectedText);
      } else {
        vscode.window.showWarningMessage('Please select some code first');
      }
    })
  );

  console.log('MyCode AI Chat extension activated');
}

export function deactivate() {}

class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _messages: Array<{ type: 'user' | 'bot'; content: string }> = [
    { type: 'bot', content: 'Hello! I\'m MyCode AI, your intelligent coding assistant.' }
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
        case 'sendMessage':
          await this._handleUserMessage(message.data);
          break;
        case 'clear':
          this._messages = [{ type: 'bot', content: 'Hello! I\'m MyCode AI, your intelligent coding assistant.' }];
          this._updateWebview();
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

  public clearChat() {
    this._messages = [{ type: 'bot', content: 'Hello! I\'m MyCode AI, your intelligent coding assistant.' }];
    this._updateWebview();
  }

  public askAboutSelection(text: string) {
    const question = `Can you explain this code?\n\n${text}`;
    this._messages.push({ type: 'user', content: question });
    this._updateWebview();
    this._handleUserMessage(question);
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode AI Chat</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background: #1e1e1e; color: #d4d4d4; height: 100vh; display: flex; flex-direction: column; }
    .chat-header { padding: 12px 16px; background: #252526; border-bottom: 1px solid #3c3c3c; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
    .chat-header button { background: transparent; border: none; color: #9d9d9d; cursor: pointer; font-size: 16px; padding: 4px 8px; }
    .chat-header button:hover { color: #d4d4d4; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }
    .message { margin-bottom: 16px; max-width: 90%; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .message.user { margin-left: auto; }
    .message.bot { margin-right: auto; }
    .message-content { padding: 10px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
    .message.user .message-content { background: #007acc; color: white; border-bottom-right-radius: 2px; }
    .message.bot .message-content { background: #2d2d30; color: #d4d4d4; border-bottom-left-radius: 2px; }
    .message.bot .message-content code { background: #1e1e1e; padding: 2px 4px; border-radius: 4px; font-family: 'Fira Code', 'Monaco', monospace; font-size: 12px; }
    .message.bot .message-content pre { background: #1e1e1e; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
    .chat-input-area { padding: 12px 16px; background: #252526; border-top: 1px solid #3c3c3c; display: flex; gap: 12px; }
    .chat-input { flex: 1; padding: 10px 14px; background: #1e1e1e; border: 1px solid #3c3c3c; border-radius: 6px; color: #d4d4d4; font-size: 13px; outline: none; font-family: inherit; }
    .chat-input:focus { border-color: #007acc; }
    .send-btn { padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .send-btn:hover { background: #005a9e; }
    .typing-indicator { display: flex; gap: 4px; padding: 10px 14px; }
    .typing-dot { width: 6px; height: 6px; background: #9d9d9d; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  </style>
</head>
<body>
  <div class="chat-header">
    <span>MyCode AI</span>
    <button id="clearBtn" title="Clear chat">🗑️</button>
  </div>
  <div class="chat-messages" id="chatMessages"></div>
  <div class="chat-input-area">
    <input type="text" class="chat-input" placeholder="Ask me anything..." id="chatInput">
    <button class="send-btn" id="sendBtn">Send</button>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const clearBtn = document.getElementById('clearBtn');
    let isTyping = false;

    function addMessage(content, type) {
      const message = document.createElement('div');
      message.className = 'message ' + type;
      const sanitized = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      message.innerHTML = '<div class="message-content">' + sanitized + '</div>';
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
      if (isTyping) return;
      isTyping = true;
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message bot';
      typingDiv.id = 'typingIndicator';
      typingDiv.innerHTML = '<div class="message-content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTyping() {
      isTyping = false;
      const typingDiv = document.getElementById('typingIndicator');
      if (typingDiv) typingDiv.remove();
    }

    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text || isTyping) return;
      addMessage(text, 'user');
      chatInput.value = '';
      showTyping();
      vscode.postMessage({ type: 'sendMessage', data: text });
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    clearBtn.addEventListener('click', () => { vscode.postMessage({ type: 'clear' }); });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'response') { hideTyping(); addMessage(msg.data, 'bot'); }
      if (msg.type === 'messageAdded') { addMessage(msg.data.content, msg.data.type); }
    });

    vscode.postMessage({ type: 'requestConfig' });
  <\/script>
</body>
</html>`;
  }

  private _updateWebview() {
    if (!this._view) return;
    this._view.webview.html = this._getHtmlForWebview();
    this._messages.forEach(msg => {
      this._view?.webview.postMessage({ type: 'messageAdded', data: msg });
    });
  }

  private async _handleUserMessage(message: string) {
    this._messages.push({ type: 'user', content: message });

    const config = vscode.workspace.getConfiguration('mycode-ai');
    const provider = config.get('provider', 'openai');
    const model = config.get('model', 'gpt-4o');
    const apiKey = config.get('apiKey', '');

    if (!apiKey) {
      this._messages.push({ type: 'bot', content: 'Please configure your API key in Settings > MyCode AI' });
      this._updateWebview();
      return;
    }

    try {
      this._view?.webview.postMessage({ type: 'response', data: 'Thinking...' });
      const response = await this._callAI(message, provider, model, apiKey);
      this._messages.push({ type: 'bot', content: response });
      this._updateWebview();
    } catch (error) {
      this._messages.push({ type: 'bot', content: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error') });
      this._updateWebview();
    }
  }

  private async _callAI(message: string, provider: string, model: string, apiKey: string): Promise<string> {
    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are MyCode AI, an intelligent coding assistant. Provide helpful, accurate, concise responses.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message?: string } };
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || '';
  }
}
