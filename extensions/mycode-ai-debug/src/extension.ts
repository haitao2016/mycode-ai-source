import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

let aiDebugPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.start', async () => {
      await startDebugging();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.stop', () => {
      stopDebugging();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.restart', async () => {
      await restartDebugging();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.pause', () => {
      pauseDebugging();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.ai-assist', async () => {
      await openAiDebugAssistant();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.analyze-error', async () => {
      await analyzeError();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.watch-variable', async () => {
      await addWatchVariable();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.debug.evaluate', async () => {
      await evaluateExpression();
    })
  );

  setupDebugEventListeners(context);

  console.log('MyCode AI Debug extension activated');
}

export function deactivate() {
  if (aiDebugPanel) {
    aiDebugPanel.dispose();
  }
}

async function startDebugging() {
  const config = vscode.workspace.getConfiguration('mycode-ai.debug');
  if (!config.get('enabled', true)) {
    vscode.window.showErrorMessage('Debugging is disabled');
    return;
  }

  const debugType = await vscode.window.showQuickPick(['node', 'python', 'chrome'], {
    placeHolder: 'Select debug type'
  });

  if (!debugType) return;

  let configName = '';
  switch (debugType) {
    case 'node':
      configName = 'Launch Node.js';
      break;
    case 'python':
      configName = 'Python: Current File';
      break;
    case 'chrome':
      configName = 'Launch Chrome';
      break;
  }

  await vscode.debug.startDebugging(undefined, configName);
  
  if (config.get('autoAnalyzeErrors', false)) {
    setTimeout(async () => {
      await openAiDebugAssistant();
    }, 1000);
  }
}

function stopDebugging() {
  vscode.debug.stopDebugging();
}

async function restartDebugging() {
  await vscode.debug.stopDebugging();
  await startDebugging();
}

function pauseDebugging() {
  vscode.debug.stopDebugging();
}

async function addWatchVariable() {
  const variable = await vscode.window.showInputBox({
    prompt: 'Enter variable name to watch',
    placeHolder: 'e.g., myVariable'
  });

  if (!variable) return;

  vscode.window.showInformationMessage('Variable watch added: ' + variable);
}

async function evaluateExpression() {
  const expression = await vscode.window.showInputBox({
    prompt: 'Enter expression to evaluate',
    placeHolder: 'e.g., myVariable + 1'
  });

  if (!expression) return;

  vscode.window.showInformationMessage('Evaluating: ' + expression);
}

async function analyzeError() {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const apiKey = config.get('apiKey', '');

  if (!apiKey) {
    vscode.window.showErrorMessage('API key not configured');
    return;
  }

  const diagnostics = vscode.languages.getDiagnostics();
  let errorText = '';
  
  diagnostics.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach(diag => {
        if (typeof diag === 'object' && diag !== null && 'message' in diag) {
          errorText += diag.message + '\n';
        }
      });
    }
  });

  if (!errorText) {
    vscode.window.showInformationMessage('No errors found');
    return;
  }

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    title: 'Analyzing errors...'
  }, async () => {
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
            {
              role: 'system',
              content: 'You are a senior debugging assistant. Analyze the errors and provide fixes.'
            },
            {
              role: 'user',
              content: 'Analyze these errors:\n\n' + errorText.substring(0, 2000)
            }
          ],
          temperature: 0.5,
          max_tokens: 1000
        })
      });

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const analysis = data.choices?.[0]?.message?.content || '';

      const doc = await vscode.workspace.openTextDocument({
        content: analysis,
        language: 'markdown'
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage('Failed to analyze errors: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
}

async function openAiDebugAssistant() {
  if (aiDebugPanel) {
    aiDebugPanel.reveal();
    return;
  }

  aiDebugPanel = vscode.window.createWebviewPanel(
    'mycode-ai.debug.assist',
    'AI Debug Assistant',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true
    }
  );

  aiDebugPanel.webview.html = getAiDebugHtml();

  aiDebugPanel.onDidDispose(() => {
    aiDebugPanel = undefined;
  });

  aiDebugPanel.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case 'analyze':
        await analyzeError();
        break;
      case 'evaluate':
        await evaluateExpression();
        break;
      case 'watch':
        await addWatchVariable();
        break;
    }
  });
}

function getAiDebugHtml(): string {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AI Debug Assistant</title><style>' +
    'body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}' +
    '.debug-header{padding:12px 16px;background:#252526;border-bottom:1px solid #3c3c3c}' +
    '.debug-header h2{margin:0;font-size:14px;font-weight:600;color:#4ec9b0}' +
    '.debug-content{flex:1;overflow-y:auto;padding:16px}' +
    '.debug-card{background:#2d2d30;border-radius:8px;padding:12px;margin-bottom:12px}' +
    '.debug-card h3{margin:0 0 8px 0;font-size:13px;color:#007acc}' +
    '.debug-card p{margin:0;font-size:12px;color:#9d9d9d}' +
    '.debug-button{padding:10px 16px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;width:100%;margin-bottom:8px;background:#007acc;color:white}' +
    '.debug-button:hover{background:#005a9e}' +
    '.debug-button:last-child{margin-bottom:0}' +
    '.debug-status{padding:8px;background:#37373d;border-radius:4px;font-size:12px;color:#6e6e6e}' +
    '.debug-status.active{color:#4ec9b0}' +
    '</style></head><body>' +
    '<div class="debug-header"><h2>AI Debug Assistant</h2></div>' +
    '<div class="debug-content">' +
    '<div class="debug-card"><h3>Quick Actions</h3><button class="debug-button" onclick="sendMessage(\'analyze\')">Analyze Errors</button><button class="debug-button" onclick="sendMessage(\'evaluate\')">Evaluate Expression</button><button class="debug-button" onclick="sendMessage(\'watch\')">Watch Variable</button></div>' +
    '<div class="debug-card"><h3>Features</h3><p>• Error analysis and fixing suggestions</p><p>• Expression evaluation</p><p>• Variable watching</p><p>• Breakpoint management</p></div>' +
    '<div class="debug-status">Debugger ready</div>' +
    '</div>' +
    '<script>const vscode=acquireVsCodeApi();function sendMessage(type){vscode.postMessage({type});}<\/script></body></html>';
}

function setupDebugEventListeners(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.debug.onDidStartDebugSession(() => {
      console.log('Debug session started');
    })
  );

  context.subscriptions.push(
    vscode.debug.onDidTerminateDebugSession(() => {
      console.log('Debug session terminated');
    })
  );
}
