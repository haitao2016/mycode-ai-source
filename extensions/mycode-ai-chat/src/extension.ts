import * as vscode from 'vscode';

export class AIChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai-chat';
  private _view?: vscode.WebviewView;
  private _conversationHistory: Array<{ role: string; content: string }> = [];
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._loadHistory();
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          this._context.asAbsolutePath('media')
        )
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'sendMessage':
            this._handleSendMessage(message.text);
            break;
          case 'newConversation':
            this._handleNewConversation();
            break;
          case 'clearHistory':
            this._handleClearHistory();
            break;
          case 'addCodeContext':
            this._handleAddCodeContext();
            break;
          case 'loadHistory':
            this._sendHistoryToWebview();
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  private async _handleSendMessage(text: string) {
    if (!text.trim()) {
      return;
    }

    this._conversationHistory.push({ role: 'user', content: text });
    this._saveHistory();

    this._view?.webview.postMessage({
      command: 'addMessage',
      role: 'user',
      content: text
    });

    try {
      const config = vscode.workspace.getConfiguration('mycode-ai');
      const apiKey = config.get<string>('apiKey', '');
      const baseUrl = config.get<string>('baseUrl', 'https://api.openai.com/v1');
      const model = config.get<string>('defaultModel', 'gpt-4o');
      const temperature = config.get<number>('temperature', 0.7);
      const maxTokens = config.get<number>('maxTokens', 4096);

      if (!apiKey) {
        this._view?.webview.postMessage({
          command: 'addMessage',
          role: 'assistant',
          content: '⚠️ API key not configured. Please set your API key in Settings > MyCode AI > API Key.'
        });
        return;
      }

      this._view?.webview.postMessage({
        command: 'startStreaming'
      });

      const messages = [
        {
          role: 'system',
          content: 'You are MyCode AI, a helpful AI coding assistant. You help users write, understand, and debug code. Be concise, helpful, and accurate.'
        },
        ...this._conversationHistory.slice(-20).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ];

      let fullResponse = '';
      
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: true
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.substring(6);
              if (data === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  this._view?.webview.postMessage({
                    command: 'streamChunk',
                    content
                  });
                }
              } catch {
              }
            }
          }
        }
      } catch (error: any) {
        fullResponse = `❌ Error: ${error.message}`;
        this._view?.webview.postMessage({
          command: 'streamChunk',
          content: `\n\n${fullResponse}`
        });
      }

      if (fullResponse && !fullResponse.startsWith('❌')) {
        this._conversationHistory.push({ role: 'assistant', content: fullResponse });
        this._saveHistory();
      }

      this._view?.webview.postMessage({
        command: 'endStreaming'
      });

    } catch (error: any) {
      this._view?.webview.postMessage({
        command: 'addMessage',
        role: 'assistant',
        content: `❌ Error: ${error.message}`
      });
      this._view?.webview.postMessage({
        command: 'endStreaming'
      });
    }
  }

  private _handleNewConversation() {
    this._conversationHistory = [];
    this._saveHistory();
    this._view?.webview.postMessage({
      command: 'clearMessages'
    });
  }

  private _handleClearHistory() {
    this._conversationHistory = [];
    this._saveHistory();
    this._view?.webview.postMessage({
      command: 'clearMessages'
    });
    vscode.window.showInformationMessage('Chat history cleared');
  }

  private _handleAddCodeContext() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const text = selection.isEmpty
      ? editor.document.getText()
      : editor.document.getText(selection);

    const fileName = editor.document.fileName;
    const language = editor.document.languageId;

    const contextMessage = `\`\`\`${language}: ${fileName}\n${text}\n\`\`\``;

    this._view?.webview.postMessage({
      command: 'addContext',
      content: contextMessage,
      label: `Code from ${fileName}`
    });

    this._view?.show?.(true);
  }

  private _loadHistory() {
    try {
      const saved = this._context.globalState.get<string>('mycode-ai-chat-history');
      if (saved) {
        this._conversationHistory = JSON.parse(saved);
      }
    } catch {
      this._conversationHistory = [];
    }
  }

  private _saveHistory() {
    try {
      const recent = this._conversationHistory.slice(-50);
      this._context.globalState.update(
        'mycode-ai-chat-history',
        JSON.stringify(recent)
      );
    } catch {
    }
  }

  private _sendHistoryToWebview() {
    this._view?.webview.postMessage({
      command: 'loadHistory',
      messages: this._conversationHistory
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode AI Chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .header {
      padding: 10px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .header-title {
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-actions {
      display: flex;
      gap: 4px;
    }

    .icon-btn {
      background: none;
      border: none;
      color: var(--vscode-icon-foreground);
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      gap: 8px;
      max-width: 100%;
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .message.user .message-avatar {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .message-content {
      padding: 8px 12px;
      border-radius: 6px;
      background: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      max-width: calc(100% - 40px);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .message.user .message-content {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-left: none;
    }

    .message-content pre {
      background: var(--vscode-editor-background);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
    }

    .message-content code {
      background: var(--vscode-editor-background);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
    }

    .message-content pre code {
      padding: 0;
      background: none;
    }

    .message-content p {
      margin-bottom: 8px;
    }

    .message-content p:last-child {
      margin-bottom: 0;
    }

    .input-area {
      padding: 12px;
      border-top: 1px solid var(--vscode-panel-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .context-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
    }

    .context-tag .remove {
      cursor: pointer;
      opacity: 0.7;
    }

    .context-tag .remove:hover {
      opacity: 1;
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    textarea {
      flex: 1;
      resize: none;
      min-height: 40px;
      max-height: 150px;
      padding: 8px 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.4;
      outline: none;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    .send-btn {
      padding: 0 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--vscode-foreground);
      opacity: 0.4;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .welcome {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }

    .welcome h2 {
      margin-bottom: 8px;
      color: var(--vscode-foreground);
    }

    .welcome-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 16px;
      justify-content: center;
    }

    .suggestion-chip {
      padding: 6px 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 16px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .suggestion-chip:hover {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">
      <span>✨</span>
      <span>MyCode AI Chat</span>
    </div>
    <div class="header-actions">
      <button class="icon-btn" id="addCodeBtn" title="Add code from editor" onclick="addCodeContext()">📎</button>
      <button class="icon-btn" id="newChatBtn" title="New conversation" onclick="newConversation()">🆕</button>
      <button class="icon-btn" id="clearBtn" title="Clear history" onclick="clearHistory()">🗑️</button>
    </div>
  </div>

  <div class="messages" id="messages">
    <div class="welcome" id="welcome">
      <h2>👋 Welcome to MyCode AI</h2>
      <p>How can I help you code today?</p>
      <div class="welcome-suggestions">
        <div class="suggestion-chip" onclick="sendSuggestion('Explain this code')">Explain this code</div>
        <div class="suggestion-chip" onclick="sendSuggestion('Find bugs')">Find bugs</div>
        <div class="suggestion-chip" onclick="sendSuggestion('Optimize performance')">Optimize performance</div>
        <div class="suggestion-chip" onclick="sendSuggestion('Write tests')">Write tests</div>
        <div class="suggestion-chip" onclick="sendSuggestion('Add comments')">Add comments</div>
      </div>
    </div>
  </div>

  <div class="input-area">
    <div id="contextTags"></div>
    <div class="input-row">
      <textarea 
        id="input" 
        placeholder="Ask anything about your code..."
        rows="2"
      ></textarea>
      <button class="send-btn" id="sendBtn" onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    const messagesEl = document.getElementById('messages');
    const welcomeEl = document.getElementById('welcome');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const contextTagsEl = document.getElementById('contextTags');
    
    let isStreaming = false;
    let currentAssistantEl = null;
    let currentContent = '';
    let contextCode = '';

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    function sendMessage() {
      if (isStreaming) return;
      
      const text = inputEl.value.trim();
      if (!text) return;

      const fullText = contextCode 
        ? contextCode + '\\n\\n' + text 
        : text;

      vscode.postMessage({ command: 'sendMessage', text: fullText });
      
      addMessage('user', text);
      inputEl.value = '';
      contextCode = '';
      contextTagsEl.innerHTML = '';
      
      if (welcomeEl) {
        welcomeEl.style.display = 'none';
      }
    }

    function sendSuggestion(text) {
      inputEl.value = text;
      sendMessage();
    }

    function newConversation() {
      vscode.postMessage({ command: 'newConversation' });
      messagesEl.innerHTML = '';
      messagesEl.appendChild(welcomeEl);
      if (welcomeEl) {
        welcomeEl.style.display = '';
      }
    }

    function clearHistory() {
      vscode.postMessage({ command: 'clearHistory' });
      messagesEl.innerHTML = '';
      messagesEl.appendChild(welcomeEl);
      if (welcomeEl) {
        welcomeEl.style.display = '';
      }
    }

    function addCodeContext() {
      vscode.postMessage({ command: 'addCodeContext' });
    }

    function addMessage(role, content) {
      const msgEl = document.createElement('div');
      msgEl.className = 'message ' + role;
      
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = role === 'user' ? '👤' : '🤖';
      
      const contentEl = document.createElement('div');
      contentEl.className = 'message-content';
      contentEl.innerHTML = renderMarkdown(content);
      
      msgEl.appendChild(avatar);
      msgEl.appendChild(contentEl);
      messagesEl.appendChild(msgEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      
      return contentEl;
    }

    function renderMarkdown(text) {
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      html = html.replace(/\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
        return '<pre><code>' + code.trim() + '</code></pre>';
      });
      
      html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      html = html.replace(/\\n\\n/g, '</p><p>');
      html = html.replace(/\\n/g, '<br>');
      html = '<p>' + html + '</p>';
      
      return html;
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      
      switch (message.command) {
        case 'addMessage':
          addMessage(message.role, message.content);
          if (welcomeEl) {
            welcomeEl.style.display = 'none';
          }
          break;
          
        case 'startStreaming':
          isStreaming = true;
          sendBtn.disabled = true;
          currentContent = '';
          currentAssistantEl = addMessage('assistant', '');
          currentAssistantEl.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
          if (welcomeEl) {
            welcomeEl.style.display = 'none';
          }
          break;
          
        case 'streamChunk':
          if (currentAssistantEl) {
            currentContent += message.content;
            currentAssistantEl.innerHTML = renderMarkdown(currentContent);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          break;
          
        case 'endStreaming':
          isStreaming = false;
          sendBtn.disabled = false;
          currentAssistantEl = null;
          currentContent = '';
          break;
          
        case 'clearMessages':
          messagesEl.innerHTML = '';
          messagesEl.appendChild(welcomeEl);
          if (welcomeEl) {
            welcomeEl.style.display = '';
          }
          break;
          
        case 'addContext':
          contextCode = message.content;
          const tag = document.createElement('span');
          tag.className = 'context-tag';
          tag.innerHTML = message.label + ' <span class="remove" onclick="removeContext()">✕</span>';
          contextTagsEl.innerHTML = '';
          contextTagsEl.appendChild(tag);
          break;
          
        case 'loadHistory':
          if (message.messages && message.messages.length > 0) {
            messagesEl.innerHTML = '';
            if (welcomeEl) {
              welcomeEl.style.display = 'none';
            }
            for (const msg of message.messages) {
              addMessage(msg.role, msg.content);
            }
          }
          break;
      }
    });

    function removeContext() {
      contextCode = '';
      contextTagsEl.innerHTML = '';
    }

    vscode.postMessage({ command: 'loadHistory' });
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Chat Extension activated');

  const provider = new AIChatProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AIChatProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-chat.newConversation', () => {
      vscode.commands.executeCommand('mycode-ai-chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-chat.clearHistory', () => {
      context.globalState.update('mycode-ai-chat-history', undefined);
      vscode.window.showInformationMessage('Chat history cleared');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-chat.addCodeContext', () => {
      vscode.commands.executeCommand('mycode-ai-chat.focus');
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Chat Extension deactivated');
}
