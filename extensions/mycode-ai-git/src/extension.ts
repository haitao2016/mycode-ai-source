import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

interface SearchResult {
  uri: vscode.Uri;
  line: number;
  lineText: string;
  match: string;
}

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  const gitProvider = new GitViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mycode-ai.git', gitProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.git.status', async () => {
      await showGitStatus();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.git.commit', async () => {
      await gitCommit();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.git.push', async () => {
      await gitPush();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.git.pull', async () => {
      await gitPull();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.git.init', async () => {
      await gitInit();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.search.global', async () => {
      await globalSearch();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.search.symbol', async () => {
      await symbolSearch();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.search.file', async () => {
      await fileSearch();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.search.semantic', async () => {
      await semanticSearch();
    })
  );

  setupGitStatusBar(context);

  console.log('MyCode AI Git extension activated');
}

export function deactivate() {}

function setupGitStatusBar(context: vscode.ExtensionContext) {
  const gitStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  
  async function updateGitStatus() {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (gitExtension && gitExtension.isActive) {
        const api = gitExtension.exports.getAPI(1);
        const repositories = api.repositories;
        
        if (repositories.length > 0) {
          const repo = repositories[0];
          const branch = repo.state.HEAD?.name || 'detached';
          const changes = repo.state.workingTreeChanges.length;
          const staged = repo.state.indexChanges.length;
          
          let statusText = `$(git-branch) ${branch}`;
          if (changes > 0) statusText += ` ~${changes}`;
          if (staged > 0) statusText += ` +${staged}`;
          
          gitStatusBar.text = statusText;
          gitStatusBar.show();
        } else {
          gitStatusBar.hide();
        }
      }
    } catch {
      gitStatusBar.hide();
    }
  }

  updateGitStatus();
  
  vscode.workspace.onDidChangeWorkspaceFolders(updateGitStatus);
  
  context.subscriptions.push(gitStatusBar);
}

async function showGitStatus(): Promise<GitStatus | undefined> {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return undefined;
  }

  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }

  try {
    const api = gitExtension.exports.getAPI(1);
    const repositories = api.repositories;

    if (repositories.length === 0) {
      vscode.window.showInformationMessage('No Git repository found');
      return undefined;
    }

    const repo = repositories[0];
    const status: GitStatus = {
      branch: repo.state.HEAD?.name || 'detached',
      ahead: repo.state.HEAD?.ahead || 0,
      behind: repo.state.HEAD?.behind || 0,
      staged: repo.state.indexChanges.map((c: { uri: vscode.Uri }) => c.uri.fsPath),
      unstaged: repo.state.workingTreeChanges.map((c: { uri: vscode.Uri }) => c.uri.fsPath),
      untracked: repo.state.untrackedChanges.map((c: { uri: vscode.Uri }) => c.uri.fsPath)
    };

    const message = `Git Status:\nBranch: ${status.branch}\nAhead: ${status.ahead}\nBehind: ${status.behind}\n\nStaged: ${status.staged.length}\nUnstaged: ${status.unstaged.length}\nUntracked: ${status.untracked.length}`;
    vscode.window.showInformationMessage(message);

    return status;
  } catch (error) {
    vscode.window.showErrorMessage('Failed to get Git status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return undefined;
  }
}

async function gitCommit() {
  const message = await vscode.window.showInputBox({
    prompt: 'Enter commit message',
    placeHolder: 'Add meaningful commit message'
  });

  if (!message) return;

  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }

  try {
    const api = gitExtension.exports.getAPI(1);
    const repositories = api.repositories;

    if (repositories.length === 0) {
      vscode.window.showErrorMessage('No Git repository found');
      return;
    }

    const repo = repositories[0];
    await repo.commit(message);
    vscode.window.showInformationMessage('Commit successful');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to commit: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function gitPush() {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }

  try {
    const api = gitExtension.exports.getAPI(1);
    const repositories = api.repositories;

    if (repositories.length === 0) {
      vscode.window.showErrorMessage('No Git repository found');
      return;
    }

    const repo = repositories[0];
    await repo.push();
    vscode.window.showInformationMessage('Push successful');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to push: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function gitPull() {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }

  try {
    const api = gitExtension.exports.getAPI(1);
    const repositories = api.repositories;

    if (repositories.length === 0) {
      vscode.window.showErrorMessage('No Git repository found');
      return;
    }

    const repo = repositories[0];
    await repo.pull();
    vscode.window.showInformationMessage('Pull successful');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to pull: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function gitInit() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace open');
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  
  try {
    const terminal = vscode.window.createTerminal('Git Terminal');
    terminal.sendText('cd ' + rootPath + ' && git init');
    terminal.show();
    
    vscode.window.showInformationMessage('Git repository initialized');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to initialize Git: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function globalSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'Enter search query',
    placeHolder: 'Search for text in workspace'
  });

  if (!query) return;

  const config = vscode.workspace.getConfiguration('mycode-ai.search');
  const includePatterns = config.get('include', ['**/*']);
  const excludePatterns = config.get('exclude', []);

  try {
    const results = await vscode.workspace.findFiles(
      '**/*',
      '{node_modules,.git,dist}/**'
    );

    const searchResults: SearchResult[] = [];
    
    for (const uri of results) {
      try {
        const content = (await vscode.workspace.fs.readFile(uri)).toString();
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes(query)) {
            searchResults.push({
              uri,
              line: index + 1,
              lineText: line.trim(),
              match: query
            });
          }
        });
      } catch {
        continue;
      }
    }

    if (searchResults.length === 0) {
      vscode.window.showInformationMessage('No results found');
      return;
    }

    const items: vscode.QuickPickItem[] = searchResults.map(result => ({
      label: `${result.uri.fsPath}:${result.line}`,
      description: result.lineText.substring(0, 100) + (result.lineText.length > 100 ? '...' : '')
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Found ${searchResults.length} results`,
      matchOnDescription: true
    });

    if (selected) {
      const [filePath, lineStr] = selected.label.split(':');
      const uri = vscode.Uri.file(filePath);
      const line = parseInt(lineStr) - 1;
      await vscode.window.showTextDocument(uri, { selection: new vscode.Selection(line, 0, line, 0) });
    }
  } catch (error) {
    vscode.window.showErrorMessage('Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function symbolSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'Enter symbol name',
    placeHolder: 'Search for functions, classes, variables'
  });

  if (!query) return;

  try {
    const symbols = await vscode.commands.executeCommand('workbench.action.findSymbol', query);
    
    if (symbols && Array.isArray(symbols) && symbols.length > 0) {
      const items: vscode.QuickPickItem[] = symbols.map((sym: { location: { uri: vscode.Uri; range: vscode.Range }; name: string; kind: string }) => ({
        label: sym.name,
        description: `${sym.kind} - ${sym.location.uri.fsPath}:${sym.location.range.start.line + 1}`
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `Found ${symbols.length} symbols`,
        matchOnDescription: true
      });

      if (selected) {
        const symbol = symbols.find((s: { name: string }) => s.name === selected.label);
        if (symbol) {
          await vscode.window.showTextDocument(symbol.location.uri, { selection: symbol.location.range });
        }
      }
    } else {
      vscode.window.showInformationMessage('No symbols found');
    }
  } catch (error) {
    vscode.window.showErrorMessage('Symbol search failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function fileSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'Enter file name',
    placeHolder: 'Search for files in workspace'
  });

  if (!query) return;

  try {
    const files = await vscode.workspace.findFiles(`**/*${query}*`);

    if (files.length === 0) {
      vscode.window.showInformationMessage('No files found');
      return;
    }

    const items: vscode.QuickPickItem[] = files.map(file => ({
      label: file.fsPath.split('/').pop() || '',
      description: file.fsPath
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Found ${files.length} files`,
      matchOnDescription: true
    });

    if (selected) {
      const file = files.find(f => f.fsPath === selected.description);
      if (file) {
        await vscode.window.showTextDocument(file);
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage('File search failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function semanticSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'Enter semantic search query',
    placeHolder: 'Search by meaning/concept (e.g., "authentication", "database connection")'
  });

  if (!query) return;

  vscode.window.showInformationMessage('Semantic search requires AI model integration. Using text-based search as fallback.');
  
  await globalSearch();
}

class GitViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
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
        case 'refresh':
          await showGitStatus();
          break;
        case 'commit':
          await gitCommit();
          break;
        case 'push':
          await gitPush();
          break;
        case 'pull':
          await gitPull();
          break;
      }
    });
  }

  private _getHtmlForWebview(): string {
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>MyCode Git</title><style>' +
      'body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;background:#1e1e1e;color:#d4d4d4;height:100vh;display:flex;flex-direction:column}' +
      '.git-header{padding:12px 16px;background:#252526;border-bottom:1px solid #3c3c3c}' +
      '.git-header h2{margin:0;font-size:14px;font-weight:600}' +
      '.git-content{flex:1;overflow-y:auto;padding:16px}' +
      '.git-controls{display:flex;gap:8px;margin-bottom:16px}' +
      '.git-controls button{padding:8px 12px;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;background:#007acc;color:white}' +
      '.git-controls button:hover{background:#005a9e}' +
      '.status-card{background:#2d2d30;border-radius:8px;padding:12px;margin-bottom:12px}' +
      '.status-title{font-weight:600;font-size:13px;margin-bottom:8px;color:#4ec9b0}' +
      '.status-item{padding:4px 0;font-size:12px;color:#9d9d9d}' +
      '.empty-state{text-align:center;color:#6e6e6e;padding:40px 20px}' +
      '</style></head><body>' +
      '<div class="git-header"><h2>Git Control</h2></div>' +
      '<div class="git-content">' +
      '<div class="git-controls"><button onclick="sendMessage(\'refresh\')">Refresh</button><button onclick="sendMessage(\'commit\')">Commit</button><button onclick="sendMessage(\'push\')">Push</button><button onclick="sendMessage(\'pull\')">Pull</button></div>' +
      '<div class="status-card"><div class="status-title">Quick Actions</div><div class="status-item">Use the buttons above to manage your Git repository</div></div>' +
      '<div class="empty-state"><p>Git status will appear here</p></div>' +
      '</div>' +
      '<script>const vscode=acquireVsCodeApi();function sendMessage(type){vscode.postMessage({type});}<\/script></body></html>';
  }
}
