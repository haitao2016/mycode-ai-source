import * as vscode from 'vscode';

interface ReviewIssue {
  id: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: 'high' | 'medium' | 'low';
  category: 'bug' | 'performance' | 'security' | 'style' | 'best-practice';
  title: string;
  description: string;
  suggestion?: string;
  code?: string;
}

interface ReviewResult {
  file: string;
  issues: ReviewIssue[];
  timestamp: number;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<string, number>;
  };
}

interface ReviewHistoryItem {
  file: string;
  timestamp: number;
  issueCount: number;
}

export class CodeReviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mycode-ai-review';
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  private _diagnosticCollection: vscode.DiagnosticCollection;
  private _currentResult: ReviewResult | null = null;
  private _history: ReviewHistoryItem[] = [];

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._diagnosticCollection = vscode.languages.createDiagnosticCollection('mycode-ai-review');
    context.subscriptions.push(this._diagnosticCollection);
    
    const savedHistory = context.globalState.get<string>('mycode-ai-review.history');
    if (savedHistory) {
      try {
        this._history = JSON.parse(savedHistory);
      } catch {}
    }
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'reviewFile':
            this._reviewCurrentFile();
            break;
          case 'reviewWorkspace':
            this._reviewWorkspace();
            break;
          case 'jumpToIssue':
            this._jumpToIssue(message.issue);
            break;
          case 'applyFix':
            this._applyFix(message.issue);
            break;
          case 'getHistory':
            this._sendHistory();
            break;
          case 'clearDiagnostics':
            this._diagnosticCollection.clear();
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  async reviewCurrentFile() {
    await this._reviewCurrentFile();
  }

  private async _reviewCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No file open to review');
      return;
    }

    const document = editor.document;
    await this._reviewDocument(document);
  }

  private async _reviewDocument(document: vscode.TextDocument) {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Reviewing code...',
      cancellable: false
    }, async () => {
      const issues = await this._analyzeCode(document);
      
      const result: ReviewResult = {
        file: document.uri.fsPath,
        issues,
        timestamp: Date.now(),
        summary: this._calculateSummary(issues)
      };

      this._currentResult = result;
      this._updateDiagnostics(document.uri, issues);
      this._addToHistory(document.uri.fsPath, issues.length);
      this._updateView();
    });
  }

  private async _reviewWorkspace() {
    const files = await vscode.workspace.findFiles(
      '**/*.{ts,js,tsx,jsx,py,go,java}',
      '**/node_modules/**'
    );

    if (files.length === 0) {
      vscode.window.showWarningMessage('No source files found in workspace');
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Reviewing workspace...',
      cancellable: true
    }, async (progress) => {
      const allIssues: ReviewIssue[] = [];
      let currentFile = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        currentFile = file.fsPath;
        
        progress.report({
          message: `Reviewing ${file.fsPath.split('/').pop()} (${i + 1}/${files.length})`,
          increment: (1 / files.length) * 100
        });

        try {
          const document = await vscode.workspace.openTextDocument(file);
          const issues = await this._analyzeCode(document);
          allIssues.push(...issues);
          this._updateDiagnostics(file, issues);
        } catch {}
      }

      const result: ReviewResult = {
        file: vscode.workspace.name || 'workspace',
        issues: allIssues,
        timestamp: Date.now(),
        summary: this._calculateSummary(allIssues)
      };

      this._currentResult = result;
      this._updateView();
      
      vscode.window.showInformationMessage(
        `Review complete: ${allIssues.length} issues found`
      );
    });
  }

  private async _analyzeCode(document: vscode.TextDocument): Promise<ReviewIssue[]> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    const useAI = config.get<boolean>('review.useAI', true);

    const issues: ReviewIssue[] = [];
    
    const staticIssues = this._runStaticAnalysis(document);
    issues.push(...staticIssues);

    if (apiKey && useAI && document.lineCount < 1000) {
      try {
        const aiIssues = await this._runAIReview(document);
        issues.push(...aiIssues);
      } catch {
      }
    }

    return issues;
  }

  private _runStaticAnalysis(document: vscode.TextDocument): ReviewIssue[] {
    const issues: ReviewIssue[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    const language = document.languageId;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (language === 'typescript' || language === 'javascript' || language === 'typescriptreact' || language === 'javascriptreact') {
        if (line.includes('console.log') && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: `console-log-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: line.indexOf('console.log') + 1,
            severity: 'low',
            category: 'best-practice',
            title: 'Console log statement',
            description: 'Remove console.log before committing to production code.',
            suggestion: 'Use a proper logging library or remove debug statements.',
            code: line.trim()
          });
        }

        if (line.match(/var\s+\w+/) && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: `var-declaration-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: line.indexOf('var') + 1,
            severity: 'medium',
            category: 'best-practice',
            title: 'Use of var declaration',
            description: 'Prefer const/let over var for better scoping.',
            suggestion: 'Replace var with const or let.',
            code: line.trim()
          });
        }

        if (line.includes('==') && !line.includes('===') && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            id: `eqeq-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: line.indexOf('==') + 1,
            severity: 'medium',
            category: 'bug',
            title: 'Loose equality operator',
            description: 'Using == may cause unexpected type coercion.',
            suggestion: 'Use === for strict equality comparison.',
            code: line.trim()
          });
        }

        if (line.includes('eval(') && !line.includes('//')) {
          issues.push({
            id: `eval-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: line.indexOf('eval') + 1,
            severity: 'high',
            category: 'security',
            title: 'Use of eval()',
            description: 'eval() can be dangerous and lead to security vulnerabilities.',
            suggestion: 'Avoid using eval(). Use safer alternatives like JSON.parse() or Function constructor with caution.',
            code: line.trim()
          });
        }

        if (line.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*$/) && i < lines.length - 1) {
          const nextLines = lines.slice(i + 1, Math.min(i + 10, lines.length));
          const funcText = nextLines.join('\n');
          if (funcText.length > 500) {
            issues.push({
              id: `long-function-${i}`,
              file: document.uri.fsPath,
              line: lineNum,
              column: 1,
              severity: 'medium',
              category: 'style',
              title: 'Long function',
              description: 'This function may be too long. Consider breaking it into smaller functions.',
              suggestion: 'Extract related logic into separate functions for better readability and maintainability.',
              code: line.trim()
            });
          }
        }

        if (line.match(/^\s*try\s*\{/) && i < lines.length - 1) {
          let hasCatch = false;
          for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
            if (lines[j].includes('catch')) {
              hasCatch = true;
              if (lines[j].match(/catch\s*\([^)]*\)\s*\{\s*\}/) || 
                  (j + 1 < lines.length && lines[j + 1].trim() === '}')) {
                issues.push({
                  id: `empty-catch-${i}`,
                  file: document.uri.fsPath,
                  line: j + 1,
                  column: 1,
                  severity: 'high',
                  category: 'bug',
                  title: 'Empty catch block',
                  description: 'Empty catch blocks silently swallow errors, making debugging difficult.',
                  suggestion: 'At minimum, log the error or rethrow it.',
                  code: lines[j].trim()
                });
              }
              break;
            }
          }
          if (!hasCatch) {
            issues.push({
              id: `no-catch-${i}`,
              file: document.uri.fsPath,
              line: lineNum,
              column: 1,
              severity: 'high',
              category: 'bug',
              title: 'try without catch',
              description: 'try block without catch may cause unhandled exceptions.',
              suggestion: 'Add a catch block to handle errors properly.',
              code: line.trim()
            });
          }
        }
      }

      if (language === 'python') {
        if (line.includes('print(') && !line.includes('#') && !line.trim().startsWith('#')) {
          issues.push({
            id: `print-statement-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: line.indexOf('print') + 1,
            severity: 'low',
            category: 'best-practice',
            title: 'print statement',
            description: 'Consider using logging module instead of print().',
            suggestion: 'Use logging module for production code.',
            code: line.trim()
          });
        }

        if (line.match(/^\s*def\s+\w+/) && line.length > 100) {
          issues.push({
            id: `long-line-${i}`,
            file: document.uri.fsPath,
            line: lineNum,
            column: 1,
            severity: 'low',
            category: 'style',
            title: 'Line too long',
            description: 'Line exceeds 100 characters (PEP 8 recommends 79).',
            suggestion: 'Break the line into multiple lines for better readability.',
            code: line.trim().substring(0, 80) + '...'
          });
        }
      }

      if (line.trim().length > 150) {
        issues.push({
          id: `long-line-${i}`,
          file: document.uri.fsPath,
          line: lineNum,
          column: 1,
          severity: 'low',
          category: 'style',
          title: 'Very long line',
          description: 'Line is very long and may be hard to read.',
          suggestion: 'Consider breaking this line into multiple lines.',
          code: line.trim().substring(0, 100) + '...'
        });
      }
    }

    const todoCount = (text.match(/TODO|FIXME|XXX/gi) || []).length;
    if (todoCount > 0) {
      const todoLine = text.split('\n').findIndex(l => /TODO|FIXME|XXX/i.test(l)) + 1;
      issues.push({
        id: 'todo-items',
        file: document.uri.fsPath,
        line: todoLine || 1,
        column: 1,
        severity: 'low',
        category: 'best-practice',
        title: `${todoCount} TODO/FIXME item(s) found`,
        description: 'There are TODO or FIXME comments that need attention.',
        suggestion: 'Consider addressing these items before release.',
        code: ''
      });
    }

    return issues;
  }

  private async _runAIReview(document: vscode.TextDocument): Promise<ReviewIssue[]> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    const baseUrl = config.get<string>('baseUrl', 'https://api.openai.com/v1');
    const model = config.get<string>('defaultModel', 'gpt-4o');

    if (!apiKey) {
      return [];
    }

    const code = document.getText();
    if (code.length > 8000) {
      return [];
    }

    try {
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
              content: `You are a code review assistant. Analyze the following code and identify issues.
Categories: bug, performance, security, style, best-practice
Severities: high, medium, low

Respond with a JSON array of issues, each with:
- line: line number
- column: column number
- severity: high/medium/low
- category: bug/performance/security/style/best-practice
- title: short title
- description: detailed description
- suggestion: how to fix it

Only respond with valid JSON. If no issues found, respond with empty array [].`
            },
            {
              role: 'user',
              content: `Language: ${document.languageId}\n\nCode:\n${code}`
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const aiIssues = JSON.parse(jsonMatch[0]);
        return aiIssues.map((issue: any, idx: number) => ({
          id: `ai-${idx}`,
          file: document.uri.fsPath,
          line: issue.line || 1,
          column: issue.column || 1,
          severity: issue.severity || 'medium',
          category: issue.category || 'best-practice',
          title: issue.title || 'AI Suggestion',
          description: issue.description || '',
          suggestion: issue.suggestion
        }));
      }
    } catch {
    }

    return [];
  }

  private _calculateSummary(issues: ReviewIssue[]) {
    const summary = {
      total: issues.length,
      high: 0,
      medium: 0,
      low: 0,
      byCategory: {
        bug: 0,
        performance: 0,
        security: 0,
        style: 0,
        'best-practice': 0
      } as Record<string, number>
    };

    for (const issue of issues) {
      summary[issue.severity]++;
      summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
    }

    return summary;
  }

  private _updateDiagnostics(uri: vscode.Uri, issues: ReviewIssue[]) {
    const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
      const range = new vscode.Range(
        issue.line - 1,
        issue.column - 1,
        issue.endLine ? issue.endLine - 1 : issue.line - 1,
        issue.endColumn || issue.column + 10
      );

      const severity = issue.severity === 'high' 
        ? vscode.DiagnosticSeverity.Error
        : issue.severity === 'medium'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;

      const diagnostic = new vscode.Diagnostic(range, issue.title, severity);
      diagnostic.source = 'MyCode AI Review';
      diagnostic.code = issue.category;
      return diagnostic;
    });

    this._diagnosticCollection.set(uri, diagnostics);
  }

  private _addToHistory(file: string, issueCount: number) {
    this._history.unshift({
      file,
      timestamp: Date.now(),
      issueCount
    });

    if (this._history.length > 50) {
      this._history = this._history.slice(0, 50);
    }

    this._context.globalState.update('mycode-ai-review.history', JSON.stringify(this._history));
  }

  private _jumpToIssue(issue: ReviewIssue) {
    vscode.workspace.openTextDocument(vscode.Uri.file(issue.file)).then(doc => {
      vscode.window.showTextDocument(doc).then(editor => {
        const position = new vscode.Position(issue.line - 1, issue.column - 1);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      });
    });
  }

  private async _applyFix(issue: ReviewIssue) {
    if (!issue.suggestion) {
      vscode.window.showInformationMessage('No automatic fix available for this issue');
      return;
    }

    vscode.window.showInformationMessage(
      `Suggestion: ${issue.suggestion}`,
      'Open File'
    ).then(choice => {
      if (choice === 'Open File') {
        this._jumpToIssue(issue);
      }
    });
  }

  private _sendHistory() {
    if (this._view) {
      this._view.webview.postMessage({
        command: 'updateHistory',
        history: this._history
      });
    }
  }

  private _updateView() {
    if (this._view && this._currentResult) {
      this._view.webview.postMessage({
        command: 'updateReview',
        result: this._currentResult
      });
    }
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCode AI Code Review</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 12px;
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

    .btn-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 6px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
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

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .summary-card {
      padding: 10px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      text-align: center;
    }

    .summary-card .count {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .summary-card .label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .summary-card.high .count { color: var(--vscode-charts-red); }
    .summary-card.medium .count { color: var(--vscode-charts-yellow); }
    .summary-card.low .count { color: var(--vscode-charts-blue); }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 4px 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .filter-tab.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .category-bars {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .category-bar .name {
      width: 90px;
      color: var(--vscode-descriptionForeground);
    }

    .category-bar .bar-bg {
      flex: 1;
      height: 8px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      overflow: hidden;
    }

    .category-bar .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }

    .category-bar .count {
      width: 30px;
      text-align: right;
      font-weight: 500;
    }

    .issues-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .issue-card {
      padding: 10px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      border-left: 3px solid var(--vscode-panel-border);
      cursor: pointer;
      transition: background 0.15s;
    }

    .issue-card:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .issue-card.high { border-left-color: var(--vscode-charts-red); }
    .issue-card.medium { border-left-color: var(--vscode-charts-yellow); }
    .issue-card.low { border-left-color: var(--vscode-charts-blue); }

    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
    }

    .issue-title {
      font-weight: 500;
      font-size: 12px;
    }

    .issue-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .issue-badge.high { background: var(--vscode-charts-red); color: white; }
    .issue-badge.medium { background: var(--vscode-charts-yellow); color: black; }
    .issue-badge.low { background: var(--vscode-charts-blue); color: white; }

    .issue-category {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .issue-desc {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .issue-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
    }

    .issue-location {
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .empty-state .title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .empty-state .desc {
      font-size: 12px;
    }

    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .tab {
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: var(--vscode-descriptionForeground);
    }

    .tab.active {
      color: var(--vscode-foreground);
      border-bottom-color: var(--vscode-button-background);
    }

    .history-item {
      padding: 8px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: pointer;
    }

    .history-item:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .history-file {
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .history-meta {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      display: flex;
      justify-content: space-between;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="btn-row">
      <button class="btn" onclick="reviewFile()">🔍 Review File</button>
      <button class="btn btn-secondary" onclick="reviewWorkspace()">📁 Review Workspace</button>
    </div>
  </div>

  <div class="tabs">
    <div class="tab active" onclick="switchTab('results')">Results</div>
    <div class="tab" onclick="switchTab('history')">History</div>
  </div>

  <div id="resultsPanel">
    <div id="emptyState" class="empty-state">
      <div class="icon">🔍</div>
      <div class="title">No review yet</div>
      <div class="desc">Click "Review File" to analyze the current file</div>
    </div>

    <div id="reviewContent" style="display: none; flex-direction: column; gap: 12px; display: none;">
      <div class="summary-cards">
        <div class="summary-card high">
          <div class="count" id="highCount">0</div>
          <div class="label">High</div>
        </div>
        <div class="summary-card medium">
          <div class="count" id="mediumCount">0</div>
          <div class="label">Medium</div>
        </div>
        <div class="summary-card low">
          <div class="count" id="lowCount">0</div>
          <div class="label">Low</div>
        </div>
      </div>

      <div>
        <div class="section-title" style="margin-bottom: 6px;">By Category</div>
        <div class="category-bars" id="categoryBars"></div>
      </div>

      <div>
        <div class="section-title" style="margin-bottom: 6px;">Filter</div>
        <div class="filter-tabs" id="filterTabs">
          <div class="filter-tab active" onclick="setFilter('all')">All</div>
          <div class="filter-tab" onclick="setFilter('high')">High</div>
          <div class="filter-tab" onclick="setFilter('medium')">Medium</div>
          <div class="filter-tab" onclick="setFilter('low')">Low</div>
        </div>
      </div>

      <div class="section-title">Issues</div>
      <div class="issues-container" id="issuesContainer"></div>
    </div>
  </div>

  <div id="historyPanel" style="display: none;">
    <div id="historyList" style="overflow-y: auto; flex: 1;"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentResult = null;
    let currentFilter = 'all';

    function reviewFile() {
      vscode.postMessage({ command: 'reviewFile' });
    }

    function reviewWorkspace() {
      vscode.postMessage({ command: 'reviewWorkspace' });
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      
      if (tab === 'results') {
        document.getElementById('resultsPanel').style.display = 'block';
        document.getElementById('historyPanel').style.display = 'none';
      } else {
        document.getElementById('resultsPanel').style.display = 'none';
        document.getElementById('historyPanel').style.display = 'block';
        vscode.postMessage({ command: 'getHistory' });
      }
    }

    function setFilter(filter) {
      currentFilter = filter;
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      renderIssues();
    }

    function jumpToIssue(issue) {
      vscode.postMessage({ command: 'jumpToIssue', issue });
    }

    function applyFix(issue) {
      vscode.postMessage({ command: 'applyFix', issue });
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'updateReview') {
        currentResult = message.result;
        renderReview();
      } else if (message.command === 'updateHistory') {
        renderHistory(message.history);
      }
    });

    function renderReview() {
      if (!currentResult) return;

      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('reviewContent').style.display = 'flex';

      document.getElementById('highCount').textContent = currentResult.summary.high;
      document.getElementById('mediumCount').textContent = currentResult.summary.medium;
      document.getElementById('lowCount').textContent = currentResult.summary.low;

      const categoryColors = {
        bug: 'var(--vscode-charts-red)',
        performance: 'var(--vscode-charts-orange)',
        security: 'var(--vscode-charts-purple)',
        style: 'var(--vscode-charts-blue)',
        'best-practice': 'var(--vscode-charts-green)'
      };

      const categoryLabels = {
        bug: '🐛 Bugs',
        performance: '⚡ Performance',
        security: '🔒 Security',
        style: '🎨 Style',
        'best-practice': '✨ Best Practice'
      };

      const maxCount = Math.max(...Object.values(currentResult.summary.byCategory), 1);
      const categoryBars = document.getElementById('categoryBars');
      categoryBars.innerHTML = Object.entries(currentResult.summary.byCategory)
        .map(([cat, count]) => {
          const pct = (count / maxCount) * 100;
          return '<div class="category-bar">' +
            '<span class="name">' + categoryLabels[cat] + '</span>' +
            '<div class="bar-bg"><div class="bar-fill" style="width:' + pct + '%; background:' + categoryColors[cat] + '"></div></div>' +
            '<span class="count">' + count + '</span>' +
            '</div>';
        }).join('');

      renderIssues();
    }

    function renderIssues() {
      if (!currentResult) return;

      let issues = currentResult.issues;
      if (currentFilter !== 'all') {
        issues = issues.filter(i => i.severity === currentFilter);
      }

      const container = document.getElementById('issuesContainer');
      
      if (issues.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">No issues found</div>';
        return;
      }

      container.innerHTML = issues.map((issue, i) => {
        return '<div class="issue-card ' + issue.severity + '" onclick="jumpToIssue(' + JSON.stringify(issue).replace(/"/g, '&quot;') + ')">' +
          '<div class="issue-header">' +
          '<div class="issue-title">' + escapeHtml(issue.title) + '</div>' +
          '<span class="issue-badge ' + issue.severity + '">' + issue.severity.toUpperCase() + '</span>' +
          '</div>' +
          '<div class="issue-category">' + issue.category + '</div>' +
          '<div class="issue-desc">' + escapeHtml(issue.description) + '</div>' +
          '<div class="issue-meta">' +
          '<span class="issue-location">L' + issue.line + ':' + issue.column + '</span>' +
          '</div>' +
          '</div>';
      }).join('');
    }

    function renderHistory(history) {
      const list = document.getElementById('historyList');
      
      if (!history || history.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">No history yet</div>';
        return;
      }

      list.innerHTML = history.map(item => {
        const fileName = item.file.split('/').pop() || item.file;
        const date = new Date(item.timestamp).toLocaleString();
        return '<div class="history-item">' +
          '<div class="history-file">' + escapeHtml(fileName) + '</div>' +
          '<div class="history-meta">' +
          '<span>' + date + '</span>' +
          '<span>' + item.issueCount + ' issues</span>' +
          '</div>' +
          '</div>';
      }).join('');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Review activated');

  const provider = new CodeReviewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CodeReviewProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-review.reviewFile', () => {
      provider.reviewCurrentFile();
      vscode.commands.executeCommand('mycode-ai-review.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-review.reviewWorkspace', () => {
      vscode.commands.executeCommand('mycode-ai-review.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-review.showReport', () => {
      vscode.commands.executeCommand('mycode-ai-review.focus');
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Review deactivated');
}
