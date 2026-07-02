import * as vscode from 'vscode';

interface DebugSessionInfo {
  id: string;
  name: string;
  type: string;
  state: 'inactive' | 'idle' | 'running' | 'stopped';
  breakpoints: vscode.Breakpoint[];
  variables: Map<string, any>;
  lastStackTrace?: string;
  lastError?: string;
}

interface ErrorAnalysis {
  error: string;
  type: string;
  likelyCause: string;
  possibleFixes: string[];
  relatedCode?: string;
  severity: 'low' | 'medium' | 'high';
}

const COMMON_ERROR_PATTERNS: Array<{ pattern: RegExp; type: string; cause: string; fixes: string[]; severity: 'low' | 'medium' | 'high' }> = [
  {
    pattern: /Cannot read property '.*' of undefined|Cannot read properties of undefined/,
    type: 'TypeError',
    cause: 'Trying to access a property on an undefined value. The variable or object is not initialized or is null/undefined.',
    fixes: [
      'Check if the variable is properly initialized before use',
      'Add null/undefined check with optional chaining (?.)',
      'Verify the data source provides the expected value',
      'Add a guard clause to handle the undefined case'
    ],
    severity: 'high'
  },
  {
    pattern: /is not a function|is not defined/,
    type: 'ReferenceError/TypeError',
    cause: 'The function or variable does not exist in the current scope, or is misspelled.',
    fixes: [
      'Check for typos in the function/variable name',
      'Verify the function is imported/required correctly',
      'Ensure the variable is declared before use',
      'Check the scope chain for accessibility'
    ],
    severity: 'high'
  },
  {
    pattern: /Unexpected token|SyntaxError/,
    type: 'SyntaxError',
    cause: 'There is a syntax error in the code. This could be a missing bracket, parenthesis, or invalid syntax.',
    fixes: [
      'Check for missing or extra brackets, parentheses, or braces',
      'Verify all statements are properly terminated',
      'Check for mismatched quotes',
      'Ensure the correct JavaScript/TypeScript version syntax is used'
    ],
    severity: 'high'
  },
  {
    pattern: /Maximum call stack size exceeded|stack overflow/,
    type: 'RangeError',
    cause: 'Infinite recursion or very deep function call stack. A function is calling itself without a proper base case.',
    fixes: [
      'Check for missing base case in recursive functions',
      'Verify recursion termination conditions',
      'Consider converting recursion to iteration for very deep calls',
      'Increase stack size if absolutely necessary'
    ],
    severity: 'high'
  },
  {
    pattern: /Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND/,
    type: 'Network Error',
    cause: 'Network request failed. The server might be down, there is no internet connection, or the URL is incorrect.',
    fixes: [
      'Check your internet connection',
      'Verify the API endpoint URL is correct',
      'Ensure the server is running and accessible',
      'Check CORS configuration for browser requests',
      'Add proper error handling and retry logic'
    ],
    severity: 'medium'
  },
  {
    pattern: /404|Not Found/,
    type: 'HTTP 404',
    cause: 'The requested resource was not found on the server.',
    fixes: [
      'Verify the URL path is correct',
      'Check if the resource exists on the server',
      'Ensure the correct HTTP method is used (GET, POST, etc.)',
      'Check API version compatibility'
    ],
    severity: 'medium'
  },
  {
    pattern: /401|Unauthorized|403|Forbidden/,
    type: 'Authentication Error',
    cause: 'Authentication failed or insufficient permissions. The user is not logged in or does not have access.',
    fixes: [
      'Verify authentication credentials/token are valid',
      'Check if the token has expired',
      'Ensure the user has required permissions',
      'Re-authenticate if necessary'
    ],
    severity: 'medium'
  },
  {
    pattern: /500|Internal Server Error/,
    type: 'HTTP 500',
    cause: 'Server-side error. The server encountered an unexpected condition.',
    fixes: [
      'Check server logs for detailed error information',
      'Verify the request payload is correct',
      'Retry the request after a short delay',
      'Contact server admin if the issue persists'
    ],
    severity: 'medium'
  },
  {
    pattern: /Timeout|timed out|ETIMEDOUT/,
    type: 'Timeout Error',
    cause: 'The operation took too long to complete. The request exceeded the timeout limit.',
    fixes: [
      'Check if the server is responding slowly',
      'Increase the timeout duration if appropriate',
      'Optimize the operation to be faster',
      'Implement retry with backoff strategy'
    ],
    severity: 'medium'
  },
  {
    pattern: /Module not found|Cannot find module/,
    type: 'Module Resolution Error',
    cause: 'A required module/package is not installed or the import path is incorrect.',
    fixes: [
      'Install the missing package: npm install <package-name>',
      'Check the import path for typos',
      'Verify the package is listed in package.json',
      'Run npm install to ensure all dependencies are installed'
    ],
    severity: 'medium'
  },
  {
    pattern: /Type '.*' is not assignable to type|Property '.*' does not exist on type/,
    type: 'TypeScript Error',
    cause: 'Type mismatch in TypeScript. The value type does not match the expected type.',
    fixes: [
      'Check the type definition of the variable/function',
      'Add proper type guards or type assertions',
      'Verify the data structure matches the interface',
      'Update the type definition if needed'
    ],
    severity: 'medium'
  },
  {
    pattern: /EACCES|permission denied|EPERM/,
    type: 'Permission Error',
    cause: 'Insufficient permissions to access a file or resource.',
    fixes: [
      'Check file/directory permissions',
      'Run the command with appropriate privileges',
      'Change ownership or permissions of the file',
      'Use a different directory with proper access'
    ],
    severity: 'medium'
  },
  {
    pattern: /ENOENT|no such file or directory/,
    type: 'File Not Found',
    cause: 'The file or directory does not exist at the specified path.',
    fixes: [
      'Verify the file path is correct',
      'Check if the file exists',
      'Ensure the working directory is correct',
      'Create the file/directory if needed'
    ],
    severity: 'low'
  }
];

export class DebugAssistant {
  private _context: vscode.ExtensionContext;
  private _sessions: Map<string, DebugSessionInfo> = new Map();
  private _panel: vscode.WebviewPanel | null = null;
  private _breakpointHistory: Array<{ breakpoint: vscode.Breakpoint; hitCount: number; lastHit?: number }> = [];

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._setupDebugListeners();
  }

  private _setupDebugListeners() {
    vscode.debug.onDidStartDebugSession(session => {
      this._sessions.set(session.id, {
        id: session.id,
        name: session.name,
        type: session.type,
        state: 'running',
        breakpoints: [],
        variables: new Map()
      });
      this._updatePanel();
    });

    vscode.debug.onDidTerminateDebugSession(session => {
      const info = this._sessions.get(session.id);
      if (info) {
        info.state = 'inactive';
      }
      this._updatePanel();
    });

    vscode.debug.onDidChangeActiveDebugSession(e => {
      this._updatePanel();
    });

    vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
      if (e.event === 'stopped') {
        const info = this._sessions.get(e.session.id);
        if (info) {
          info.state = 'stopped';
        }
        this._captureStackTrace(e.session);
      } else if (e.event === 'continued') {
        const info = this._sessions.get(e.session.id);
        if (info) {
          info.state = 'running';
        }
      }
      this._updatePanel();
    });

    vscode.debug.onDidChangeBreakpoints(e => {
      e.added.forEach(bp => {
        this._breakpointHistory.push({ breakpoint: bp, hitCount: 0 });
      });
      this._updatePanel();
    });
  }

  private async _captureStackTrace(session: vscode.DebugSession) {
    try {
      const stackTrace = await session.customRequest('stackTrace', { threadId: 1 });
      if (stackTrace?.stackFrames?.length > 0) {
        const trace = stackTrace.stackFrames
          .slice(0, 10)
          .map((f: any) => `  at ${f.name} (${f.source?.path || 'unknown'}:${f.line})`)
          .join('\n');
        
        const info = this._sessions.get(session.id);
        if (info) {
          info.lastStackTrace = trace;
        }
      }
    } catch {}
  }

  async analyzeError() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    
    let errorText = selectedText;
    if (!errorText) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter the error message or stack trace to analyze',
        placeHolder: 'e.g., Cannot read property of undefined'
      });
      if (!input) return;
      errorText = input;
    }

    const analysis = this._analyzeError(errorText);
    
    this._showAnalysisPanel(analysis, errorText);
  }

  async explainStackTrace() {
    const activeSession = vscode.debug.activeDebugSession;
    
    let stackTrace = '';
    
    if (activeSession) {
      try {
        const result = await activeSession.customRequest('stackTrace', { threadId: 1 });
        if (result?.stackFrames?.length > 0) {
          stackTrace = result.stackFrames
            .map((f: any) => `${f.name} @ ${f.source?.name || 'unknown'}:${f.line}`)
            .join('\n');
        }
      } catch {}
    }

    if (!stackTrace) {
      const input = await vscode.window.showInputBox({
        prompt: 'Paste the stack trace to explain',
        placeHolder: 'at functionName (file.js:123)'
      });
      if (!input) return;
      stackTrace = input;
    }

    const explanation = await this._explainStackTrace(stackTrace);
    
    const panel = vscode.window.createWebviewPanel(
      'mycode-ai-debug-stacktrace',
      'Stack Trace Explanation',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    panel.webview.html = this._getStackTraceHtml(stackTrace, explanation);
  }

  async suggestFix() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const diagnostic = vscode.languages.getDiagnostics(editor.document.uri);
    const errors = diagnostic.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    
    if (errors.length === 0) {
      vscode.window.showInformationMessage('No errors found in the current file');
      return;
    }

    const error = errors[0];
    const errorText = error.message;
    const analysis = this._analyzeError(errorText);

    vscode.window.showInformationMessage(
      `AI Debug: ${analysis.likelyCause.substring(0, 60)}...`,
      'View Details',
      'Apply Suggestion'
    ).then(choice => {
      if (choice === 'View Details') {
        this._showAnalysisPanel(analysis, errorText);
      } else if (choice === 'Apply Suggestion' && analysis.possibleFixes.length > 0) {
        vscode.window.showQuickPick(analysis.possibleFixes, {
          placeHolder: 'Select a fix to apply (opens documentation)'
        });
      }
    });
  }

  private _analyzeError(errorText: string): ErrorAnalysis {
    for (const pattern of COMMON_ERROR_PATTERNS) {
      if (pattern.pattern.test(errorText)) {
        return {
          error: errorText.substring(0, 200),
          type: pattern.type,
          likelyCause: pattern.cause,
          possibleFixes: pattern.fixes,
          severity: pattern.severity
        };
      }
    }

    return {
      error: errorText.substring(0, 200),
      type: 'Unknown Error',
      likelyCause: 'The error does not match any known pattern. It could be a custom error or a less common issue.',
      possibleFixes: [
        'Check the error message for specific details',
        'Look at the stack trace to find the source',
        'Add logging to trace the execution path',
        'Use a debugger to step through the code',
        'Search online for similar errors'
      ],
      severity: 'medium'
    };
  }

  private async _explainStackTrace(stackTrace: string): Promise<string> {
    const aiExplanation = await this._callAI(stackTrace, 'explainStackTrace');
    if (aiExplanation) return aiExplanation;

    const lines = stackTrace.split('\n').filter(l => l.trim());
    const functionNames = lines
      .map(l => l.match(/at\s+(\w+|\w+\.\w+)/)?.[1])
      .filter(Boolean);

    return `## Stack Trace Analysis

**Depth:** ${lines.length} frames

**Call Chain:**
${functionNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

## What This Means

The stack trace shows the sequence of function calls that led to the error. Read it from bottom to top:
- The bottom is where execution started
- Each line is a function call
- The top is where the error occurred

## How to Debug

1. Start from the top of the stack (where the error occurred)
2. Examine the code at the specified line number
3. Work your way down to understand the call path
4. Look for unexpected values or states

## Common Causes

- Null/undefined values passed through the call chain
- Incorrect parameters passed between functions
- Unexpected return values
- State changes that break assumptions`;
  }

  private async _callAI(text: string, action: string): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    const baseUrl = config.get<string>('baseUrl', 'https://api.openai.com/v1');
    const model = config.get<string>('defaultModel', 'gpt-4o');

    if (!apiKey || text.length > 4000) {
      return null;
    }

    try {
      const prompts: Record<string, string> = {
        explainStackTrace: 'Explain this stack trace in detail. What does it mean, what caused it, and how to debug it?',
        analyzeError: 'Analyze this error message. What is the likely cause and what are the possible fixes?'
      };

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
              content: prompts[action] || 'Help with debugging.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  private _showAnalysisPanel(analysis: ErrorAnalysis, errorText: string) {
    if (!this._panel) {
      this._panel = vscode.window.createWebviewPanel(
        'mycode-ai-debug-analysis',
        'AI Debug Analysis',
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      this._panel.onDidDispose(() => {
        this._panel = null;
      });
    }

    this._panel.webview.html = this._getAnalysisHtml(analysis, errorText);
    this._panel.reveal();
  }

  private _updatePanel() {
    if (this._panel) {
      this._panel.webview.postMessage({
        command: 'updateDebugState',
        sessions: Array.from(this._sessions.values()),
        breakpoints: vscode.debug.breakpoints
      });
    }
  }

  private _getAnalysisHtml(analysis: ErrorAnalysis, errorText: string): string {
    const severityColors: Record<string, string> = {
      high: 'var(--vscode-charts-red)',
      medium: 'var(--vscode-charts-yellow)',
      low: 'var(--vscode-charts-blue)'
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error Analysis</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 20px; margin-bottom: 16px; }
    h2 { font-size: 16px; margin: 20px 0 10px; }
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
      background: ${severityColors[analysis.severity]};
    }
    .error-box {
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      padding: 12px;
      border-radius: 6px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      margin: 12px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .type-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .cause-box {
      background: var(--vscode-editor-inactiveSelectionBackground);
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      border-left: 3px solid var(--vscode-charts-orange);
    }
    .fixes-list {
      list-style: none;
      padding: 0;
    }
    .fix-item {
      padding: 10px 12px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      margin-bottom: 6px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .fix-number {
      background: var(--vscode-charts-green);
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .fix-text { flex: 1; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 AI Error Analysis</h1>
    <span class="severity-badge">${analysis.severity}</span>
  </div>

  <div class="type-label">Error Type</div>
  <h2>${analysis.type}</h2>

  <div class="type-label">Error Message</div>
  <div class="error-box">${this._escapeHtml(errorText)}</div>

  <h2>💡 Likely Cause</h2>
  <div class="cause-box">${analysis.likelyCause}</div>

  <h2>🔧 Possible Fixes</h2>
  <ol class="fixes-list">
    ${analysis.possibleFixes.map((fix, i) => `
      <li class="fix-item">
        <span class="fix-number">${i + 1}</span>
        <span class="fix-text">${fix}</span>
      </li>
    `).join('')}
  </ol>
</body>
</html>`;
  }

  private _getStackTraceHtml(stackTrace: string, explanation: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stack Trace Explanation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 20px; margin-bottom: 16px; }
    h2 { font-size: 16px; margin: 20px 0 10px; }
    h3 { font-size: 14px; margin: 16px 0 8px; }
    pre {
      background: var(--vscode-editor-inactiveSelectionBackground);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      white-space: pre-wrap;
    }
    code {
      background: var(--vscode-editor-inactiveSelectionBackground);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
    }
    ul, ol { margin-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    p { margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>📊 Stack Trace Explanation</h1>
  
  <h2>Stack Trace</h2>
  <pre>${this._escapeHtml(stackTrace)}</pre>
  
  <h2>Explanation</h2>
  <div>${this._formatMarkdown(explanation)}</div>
</body>
</html>`;
  }

  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private _formatMarkdown(text: string): string {
    let html = text;
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Debug Assistant activated');

  const assistant = new DebugAssistant(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-debug.analyzeError', () => {
      assistant.analyzeError();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-debug.explainStackTrace', () => {
      assistant.explainStackTrace();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-debug.suggestFix', () => {
      assistant.suggestFix();
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Debug Assistant deactivated');
}
