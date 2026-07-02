import * as vscode from 'vscode';

interface CodeSnippet {
  file: string;
  line: number;
  endLine: number;
  content: string;
  language: string;
  tokens: string[];
  score?: number;
}

interface SearchIndex {
  snippets: CodeSnippet[];
  fileCount: number;
  indexedAt: number;
  isBuilding: boolean;
}

interface SearchResult {
  query: string;
  results: CodeSnippet[];
  duration: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'no',
  'if', 'then', 'else', 'when', 'where', 'what', 'which', 'who',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
  'get', 'set', 'let', 'var', 'const', 'let', 'function', 'return',
  'this', 'that', 'these', 'those', 'it', 'its', 'as', 'into'
]);

export class SemanticSearchProvider {
  private _context: vscode.ExtensionContext;
  private _index: SearchIndex = {
    snippets: [],
    fileCount: 0,
    indexedAt: 0,
    isBuilding: false
  };
  private _panel: vscode.WebviewPanel | null = null;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  async search() {
    if (!this._panel) {
      this._panel = vscode.window.createWebviewPanel(
        'mycode-ai-search',
        'Semantic Search',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      this._panel.webview.html = this._getHtmlForWebview();

      this._panel.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'search':
              this._doSearch(message.query);
              break;
            case 'jumpTo':
              this._jumpToResult(message.result);
              break;
            case 'buildIndex':
              this.buildIndex();
              break;
            case 'getIndexStatus':
              this._sendIndexStatus();
              break;
          }
        },
        undefined,
        this._context.subscriptions
      );

      this._panel.onDidDispose(() => {
        this._panel = null;
      });
    }

    this._panel.reveal();
    this._sendIndexStatus();
  }

  async buildIndex() {
    if (this._index.isBuilding) {
      vscode.window.showWarningMessage('Index build already in progress');
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('No workspace folder open');
      return;
    }

    this._index.isBuilding = true;
    this._sendIndexStatus();

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Building search index...',
      cancellable: true
    }, async (progress, token) => {
      try {
        const files = await vscode.workspace.findFiles(
          '**/*.{ts,js,tsx,jsx,py,go,java,rs,json,md}',
          '**/node_modules/**'
        );

        const snippets: CodeSnippet[] = [];
        let processed = 0;

        for (const file of files) {
          if (token.isCancellationRequested) {
            break;
          }

          try {
            const document = await vscode.workspace.openTextDocument(file);
            const fileSnippets = this._extractSnippets(document);
            snippets.push(...fileSnippets);
          } catch {}

          processed++;
          if (processed % 10 === 0) {
            progress.report({
              message: `Indexed ${processed}/${files.length} files`,
              increment: (10 / files.length) * 100
            });
          }
        }

        this._index = {
          snippets,
          fileCount: files.length,
          indexedAt: Date.now(),
          isBuilding: false
        };

        this._context.globalState.update(
          'mycode-ai-search.indexTime',
          this._index.indexedAt
        );

        vscode.window.showInformationMessage(
          `Index built: ${snippets.length} snippets from ${files.length} files`
        );
      } catch (error: any) {
        this._index.isBuilding = false;
        vscode.window.showErrorMessage(`Index build failed: ${error.message}`);
      }

      this._sendIndexStatus();
    });
  }

  private _extractSnippets(document: vscode.TextDocument): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    const language = document.languageId;

    snippets.push({
      file: document.uri.fsPath,
      line: 1,
      endLine: lines.length,
      content: text.substring(0, 500),
      language,
      tokens: this._tokenize(text)
    });

    const functionPatterns = [
      /function\s+(\w+)\s*\(/,
      /const\s+(\w+)\s*=\s*(async\s+)?\(/,
      /let\s+(\w+)\s*=\s*(async\s+)?function/,
      /def\s+(\w+)\s*\(/,
      /func\s+(\w+)\s*\(/,
      /public\s+\w+\s+(\w+)\s*\(/,
      /private\s+\w+\s+(\w+)\s*\(/,
      /class\s+(\w+)/,
      /interface\s+(\w+)/,
      /type\s+(\w+)\s*=/
    ];

    let currentFunctionStart = -1;
    let currentFunctionName = '';
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of functionPatterns) {
        const match = line.match(pattern);
        if (match && currentFunctionStart === -1) {
          currentFunctionStart = i + 1;
          currentFunctionName = match[1];
          braceDepth = 0;
          break;
        }
      }

      if (currentFunctionStart !== -1) {
        braceDepth += (line.match(/\{/g) || []).length;
        braceDepth -= (line.match(/\}/g) || []).length;

        if (braceDepth <= 0 && i > currentFunctionStart) {
          const snippetText = lines.slice(currentFunctionStart - 1, i + 1).join('\n');
          snippets.push({
            file: document.uri.fsPath,
            line: currentFunctionStart,
            endLine: i + 1,
            content: snippetText.substring(0, 1000),
            language,
            tokens: this._tokenize(snippetText + ' ' + currentFunctionName)
          });
          currentFunctionStart = -1;
          currentFunctionName = '';
        }
      }
    }

    const classPattern = /(?:class|interface|type\s+\w+\s*=)\s+(\w+)/;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(classPattern);
      if (match) {
        const endLine = Math.min(i + 30, lines.length);
        const snippetText = lines.slice(i, endLine).join('\n');
        snippets.push({
          file: document.uri.fsPath,
          line: i + 1,
          endLine: endLine,
          content: snippetText.substring(0, 1000),
          language,
          tokens: this._tokenize(snippetText)
        });
      }
    }

    return snippets;
  }

  private _tokenize(text: string): string[] {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    const camelCaseTokens: string[] = [];
    for (const token of tokens) {
      const parts = token.split(/(?=[A-Z])/).filter(p => p.length > 1);
      if (parts.length > 1) {
        camelCaseTokens.push(...parts.map(p => p.toLowerCase()));
      }
      camelCaseTokens.push(token.toLowerCase());
    }

    return [...new Set(camelCaseTokens)];
  }

  private async _doSearch(query: string) {
    const startTime = Date.now();

    if (this._index.snippets.length === 0) {
      await this.buildIndex();
    }

    const queryTokens = this._tokenize(query);
    const results: CodeSnippet[] = [];

    for (const snippet of this._index.snippets) {
      let score = 0;
      
      for (const token of queryTokens) {
        if (snippet.tokens.includes(token)) {
          score += 2;
        }
        
        for (const snippetToken of snippet.tokens) {
          if (snippetToken.startsWith(token) || token.startsWith(snippetToken)) {
            score += 0.5;
          }
          if (this._levenshteinDistance(token, snippetToken) <= 2) {
            score += 0.3;
          }
        }
      }

      const snippetLower = snippet.content.toLowerCase();
      const queryLower = query.toLowerCase();
      if (snippetLower.includes(queryLower)) {
        score += 3;
      }

      if (score > 0.5) {
        results.push({ ...snippet, score });
      }
    }

    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    const topResults = results.slice(0, 50);

    const duration = Date.now() - startTime;

    if (this._panel) {
      this._panel.webview.postMessage({
        command: 'searchResults',
        results: topResults,
        query,
        duration
      });
    }
  }

  private _levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private _jumpToResult(result: CodeSnippet) {
    vscode.workspace.openTextDocument(vscode.Uri.file(result.file)).then(doc => {
      vscode.window.showTextDocument(doc, {
        selection: new vscode.Range(
          result.line - 1,
          0,
          result.endLine - 1,
          0
        )
      });
    });
  }

  private _sendIndexStatus() {
    if (this._panel) {
      this._panel.webview.postMessage({
        command: 'indexStatus',
        status: {
          snippetCount: this._index.snippets.length,
          fileCount: this._index.fileCount,
          indexedAt: this._index.indexedAt,
          isBuilding: this._index.isBuilding
        }
      });
    }
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Semantic Search</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100vh;
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .search-box {
      display: flex;
      gap: 8px;
    }

    .search-input {
      flex: 1;
      padding: 8px 12px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      font-size: 13px;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .btn {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .suggestion-chip {
      padding: 4px 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
    }

    .suggestion-chip:hover {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .results-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .result-card {
      padding: 12px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .result-card:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .result-file {
      font-weight: 500;
      font-size: 12px;
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .result-score {
      font-size: 10px;
      color: var(--vscode-charts-green);
      font-weight: 500;
    }

    .result-lines {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 6px;
    }

    .result-code {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      background: var(--vscode-editor-background);
      padding: 8px;
      border-radius: 4px;
      white-space: pre-wrap;
      overflow-x: auto;
      max-height: 120px;
      overflow-y: auto;
      line-height: 1.4;
      color: var(--vscode-descriptionForeground);
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--vscode-descriptionForeground);
    }

    .empty-state .icon {
      font-size: 56px;
      margin-bottom: 16px;
    }

    .empty-state .title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .empty-state .desc {
      font-size: 13px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .results-count {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="font-size: 16px; font-weight: 600;">🔍 Semantic Search</h2>
    <div class="search-box">
      <input type="text" class="search-input" id="searchInput" 
        placeholder="Search code by meaning..." 
        onkeydown="if(event.key==='Enter')doSearch()">
      <button class="btn" onclick="doSearch()">Search</button>
    </div>
    <div class="suggestions">
      <span class="suggestion-chip" onclick="setQuery('user authentication')">user auth</span>
      <span class="suggestion-chip" onclick="setQuery('database query')">database</span>
      <span class="suggestion-chip" onclick="setQuery('error handling')">error handling</span>
      <span class="suggestion-chip" onclick="setQuery('API endpoint')">API</span>
      <span class="suggestion-chip" onclick="setQuery('utility function')">utils</span>
    </div>
    <div class="status-bar">
      <span id="indexStatus">Index: not built</span>
      <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="buildIndex()">
        Build Index
      </button>
    </div>
  </div>

  <div id="resultsContainer" class="results-container">
    <div class="empty-state">
      <div class="icon">🔎</div>
      <div class="title">Search your codebase</div>
      <div class="desc">Enter a query above to find code by meaning</div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function setQuery(q) {
      document.getElementById('searchInput').value = q;
      doSearch();
    }

    function doSearch() {
      const query = document.getElementById('searchInput').value.trim();
      if (!query) return;
      vscode.postMessage({ command: 'search', query });
    }

    function buildIndex() {
      vscode.postMessage({ command: 'buildIndex' });
    }

    function jumpToResult(result) {
      vscode.postMessage({ command: 'jumpTo', result });
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      
      if (message.command === 'searchResults') {
        renderResults(message.results, message.query, message.duration);
      } else if (message.command === 'indexStatus') {
        updateIndexStatus(message.status);
      }
    });

    function updateIndexStatus(status) {
      const el = document.getElementById('indexStatus');
      if (status.isBuilding) {
        el.textContent = 'Building index...';
      } else if (status.indexedAt) {
        const date = new Date(status.indexedAt).toLocaleString();
        el.textContent = \`Index: \${status.snippetCount} snippets · \${status.fileCount} files · \${date}\`;
      } else {
        el.textContent = 'Index: not built';
      }
    }

    function renderResults(results, query, duration) {
      const container = document.getElementById('resultsContainer');
      
      if (results.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="icon">📭</div>
            <div class="title">No results found</div>
            <div class="desc">Try different keywords or build the index first</div>
          </div>
        \`;
        return;
      }

      container.innerHTML = \`
        <div class="results-header">
          <span class="results-count">\${results.length} results in \${duration}ms</span>
        </div>
        \${results.map(r => \`
          <div class="result-card" onclick='jumpToResult(\${JSON.stringify(r)})'>
            <div class="result-header">
              <span class="result-file">\${escapeHtml(r.file.split('/').pop() || r.file)}</span>
              <span class="result-score">\${(r.score || 0).toFixed(1)}</span>
            </div>
            <div class="result-lines">Lines \${r.line}-\${r.endLine} · \${r.language}</div>
            <div class="result-code">\${escapeHtml(r.content.substring(0, 300))}\${r.content.length > 300 ? '...' : ''}</div>
          </div>
        \`).join('')}
      \`;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    vscode.postMessage({ command: 'getIndexStatus' });
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Semantic Search activated');

  const provider = new SemanticSearchProvider(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-search.search', () => {
      provider.search();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-search.buildIndex', () => {
      provider.buildIndex();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-search.updateIndex', () => {
      provider.buildIndex();
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Semantic Search deactivated');
}
