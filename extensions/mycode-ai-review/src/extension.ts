import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

interface ReviewIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.review.file', async () => {
      await reviewActiveFile();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.review.selection', async () => {
      await reviewSelection();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.review.workspace', async () => {
      await reviewWorkspace();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.review.generateDoc', async () => {
      await generateDocumentation();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.review.refactor', async () => {
      await suggestRefactoring();
    })
  );

  console.log('MyCode AI Review extension activated');
}

export function deactivate() {}

async function reviewActiveFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const issues = await analyzeCode(content, document.languageId, document.fileName);
  
  showReviewResults(issues, document.fileName);
}

async function reviewSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showErrorMessage('No selection');
    return;
  }

  const content = editor.document.getText(selection);
  const issues = await analyzeCode(content, editor.document.languageId, editor.document.fileName);
  
  showReviewResults(issues, editor.document.fileName + ' (Selection)');
}

async function reviewWorkspace() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace open');
    return;
  }

  const allIssues: ReviewIssue[] = [];
  
  for (const folder of workspaceFolders) {
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.{ts,tsx,js,jsx,python,py,go,rs,java,css,scss}'));
    
    for (const file of files) {
      try {
        const content = (await vscode.workspace.fs.readFile(file)).toString();
        const issues = await analyzeCode(content, getLanguageId(file.fsPath), file.fsPath);
        allIssues.push(...issues);
      } catch {
        continue;
      }
    }
  }

  showReviewResults(allIssues, 'Workspace');
}

async function generateDocumentation() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const content = editor.document.getText();
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const apiKey = config.get('apiKey', '');

  if (!apiKey) {
    vscode.window.showErrorMessage('API key not configured');
    return;
  }

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    title: 'Generating Documentation...'
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
              content: 'You are a technical documentation writer. Generate comprehensive documentation for the provided code.'
            },
            {
              role: 'user',
              content: 'Generate documentation for the following code:\n\n' + content.substring(0, 5000)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const docContent = data.choices?.[0]?.message?.content || '';

      const docUri = vscode.Uri.file(editor.document.fileName + '.md');
      await vscode.workspace.fs.writeFile(docUri, Buffer.from(docContent));
      await vscode.window.showTextDocument(docUri);

      vscode.window.showInformationMessage('Documentation generated');
    } catch (error) {
      vscode.window.showErrorMessage('Failed to generate documentation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
}

async function suggestRefactoring() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const content = editor.document.getText();
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const apiKey = config.get('apiKey', '');

  if (!apiKey) {
    vscode.window.showErrorMessage('API key not configured');
    return;
  }

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    title: 'Analyzing code for refactoring...'
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
              content: 'You are a senior software engineer. Suggest refactoring improvements and provide the improved code.'
            },
            {
              role: 'user',
              content: 'Analyze this code and suggest refactoring:\n\n' + content.substring(0, 5000)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const refactoredContent = data.choices?.[0]?.message?.content || '';

      const refactorDoc = await vscode.workspace.openTextDocument({
        content: refactoredContent,
        language: editor.document.languageId
      });
      await vscode.window.showTextDocument(refactorDoc);

      vscode.window.showInformationMessage('Refactoring suggestions generated');
    } catch (error) {
      vscode.window.showErrorMessage('Failed to generate refactoring suggestions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
}

async function analyzeCode(content: string, language: string, fileName: string): Promise<ReviewIssue[]> {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const apiKey = config.get('apiKey', '');

  if (!apiKey) {
    vscode.window.showErrorMessage('API key not configured');
    return [];
  }

  const reviewConfig = vscode.workspace.getConfiguration('mycode-ai.review');
  const checkStyle = reviewConfig.get('checkStyle', true);
  const checkPerformance = reviewConfig.get('checkPerformance', true);
  const checkSecurity = reviewConfig.get('checkSecurity', true);
  const checkBestPractices = reviewConfig.get('checkBestPractices', true);

  const checks = [];
  if (checkStyle) checks.push('code style');
  if (checkPerformance) checks.push('performance');
  if (checkSecurity) checks.push('security');
  if (checkBestPractices) checks.push('best practices');

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
            content: 'You are a senior code reviewer. Analyze the code for issues and provide suggestions. Format output as JSON array of objects with "line", "severity" (error/warning/info), "message", and "suggestion" fields.'
          },
          {
            role: 'user',
            content: 'Review this ' + language + ' code file (' + fileName + ') for ' + checks.join(', ') + ' issues:\n\n' + content.substring(0, 5000)
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const contentStr = data.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = contentStr.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ReviewIssue[];
      }
    } catch {}

    return parseReviewFromString(contentStr);
  } catch {
    return [];
  }
}

function parseReviewFromString(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('ERROR') || line.includes('Error') || line.includes('error')) {
      issues.push({
        line: index + 1,
        severity: 'error',
        message: line.trim(),
        suggestion: 'Review the code at this location'
      });
    } else if (line.includes('WARNING') || line.includes('Warning') || line.includes('warning')) {
      issues.push({
        line: index + 1,
        severity: 'warning',
        message: line.trim(),
        suggestion: 'Consider improving this code'
      });
    } else if (line.includes('INFO') || line.includes('Info') || line.includes('info')) {
      issues.push({
        line: index + 1,
        severity: 'info',
        message: line.trim(),
        suggestion: 'Best practice suggestion'
      });
    }
  });

  return issues;
}

function showReviewResults(issues: ReviewIssue[], title: string) {
  if (issues.length === 0) {
    vscode.window.showInformationMessage('No issues found in ' + title);
    return;
  }

  const diagnosticCollection = vscode.languages.createDiagnosticCollection('mycode-ai-review');
  const diagnostics: Map<vscode.Uri, vscode.Diagnostic[]> = new Map();

  issues.forEach(issue => {
    const uri = vscode.window.activeTextEditor?.document.uri || vscode.Uri.file(title);
    if (!diagnostics.has(uri)) {
      diagnostics.set(uri, []);
    }

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(
        new vscode.Position(Math.max(0, issue.line - 1), 0),
        new vscode.Position(Math.max(0, issue.line - 1), 100)
      ),
      issue.message + '\nSuggestion: ' + issue.suggestion,
      issue.severity === 'error' ? vscode.DiagnosticSeverity.Error :
      issue.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
      vscode.DiagnosticSeverity.Information
    );

    diagnostics.get(uri)?.push(diagnostic);
  });

  diagnostics.forEach((diags, uri) => {
    diagnosticCollection.set(uri, diags);
  });

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  vscode.window.showInformationMessage(
    'Code review completed: ' + errorCount + ' errors, ' + warningCount + ' warnings, ' + infoCount + ' info'
  );
}

function getLanguageId(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescriptreact',
    'js': 'javascript',
    'jsx': 'javascriptreact',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'css': 'css',
    'scss': 'scss'
  };
  return langMap[ext] || 'plaintext';
}
