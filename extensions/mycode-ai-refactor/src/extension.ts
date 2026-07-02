import * as vscode from 'vscode';

interface RefactorAction {
  title: string;
  kind: vscode.CodeActionKind;
  command?: string;
  isPreferred?: boolean;
}

const REFACTOR_ACTIONS: RefactorAction[] = [
  { title: '✨ Explain this code', kind: vscode.CodeActionKind.QuickFix, command: 'explain' },
  { title: '📝 Add comments', kind: vscode.CodeActionKind.RefactorRewrite, command: 'addComments' },
  { title: '🧪 Generate tests', kind: vscode.CodeActionKind.Source, command: 'generateTests' },
  { title: '⚡ Optimize code', kind: vscode.CodeActionKind.RefactorRewrite, command: 'optimize' },
  { title: '🔤 Fix naming', kind: vscode.CodeActionKind.RefactorRewrite, command: 'fixNaming' },
  { title: '🛡️ Add error handling', kind: vscode.CodeActionKind.Refactor, command: 'addErrorHandling' },
  { title: '📦 Extract function', kind: vscode.CodeActionKind.RefactorExtract, command: 'extractFunction' },
  { title: '📄 Generate documentation', kind: vscode.CodeActionKind.Source, command: 'generateDocs' },
  { title: '🔄 Convert to arrow function', kind: vscode.CodeActionKind.RefactorRewrite, command: 'toArrow' }
];

export class AICodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor,
    vscode.CodeActionKind.RefactorExtract,
    vscode.CodeActionKind.RefactorRewrite,
    vscode.CodeActionKind.Source
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    const selection = range as vscode.Selection;
    const selectedText = document.getText(selection);

    if (!selectedText || selectedText.length < 5) {
      return [];
    }

    const config = vscode.workspace.getConfiguration('mycode-ai');
    const enabled = config.get<boolean>('refactor.enabled', true);
    
    if (!enabled) {
      return [];
    }

    for (const action of REFACTOR_ACTIONS) {
      const codeAction = new vscode.CodeAction(action.title, action.kind);
      codeAction.command = {
        title: action.title,
        command: `mycode-ai-refactor.${action.command}`,
        arguments: [{
          documentUri: document.uri,
          range: selection,
          text: selectedText
        }]
      };
      actions.push(codeAction);
    }

    return actions;
  }
}

export class RefactorAssistant {
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  async explainCode(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Analyzing code...',
      cancellable: false
    }, async () => {
      const explanation = await this._getExplanation(text, document.languageId);
      
      const panel = vscode.window.createWebviewPanel(
        'mycode-ai-explain',
        'Code Explanation',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      panel.webview.html = this._getExplanationHtml(text, explanation, document.languageId);
    });
  }

  async addComments(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);
    const editor = await vscode.window.showTextDocument(document);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Generating comments...',
      cancellable: false
    }, async () => {
      const commentedCode = await this._generateComments(text, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, commentedCode);
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage('Comments added successfully');
    });
  }

  async generateTests(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Generating tests...',
      cancellable: false
    }, async () => {
      const testCode = await this._generateTestCode(text, document.languageId);
      
      const testUri = this._getTestFileUri(document.uri, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.createFile(testUri, { overwrite: false, ignoreIfExists: true });
      edit.insert(testUri, new vscode.Position(0, 0), testCode);
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showTextDocument(testUri);
      vscode.window.showInformationMessage('Test file generated');
    });
  }

  async optimizeCode(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Optimizing code...',
      cancellable: false
    }, async () => {
      const optimizedCode = await this._getOptimizedCode(text, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, optimizedCode);
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage('Code optimized');
    });
  }

  async fixNaming(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.showInformationMessage(
      'Naming suggestions will be applied to selected code. Continue?',
      'Apply'
    ).then(async choice => {
      if (choice !== 'Apply') return;
      
      const improvedCode = this._improveNaming(text, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, improvedCode);
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage('Naming improved');
    });
  }

  async addErrorHandling(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Adding error handling...',
      cancellable: false
    }, async () => {
      const codeWithHandling = await this._addErrorHandling(text, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, codeWithHandling);
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage('Error handling added');
    });
  }

  async extractFunction(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    const functionName = await vscode.window.showInputBox({
      prompt: 'Enter a name for the extracted function',
      placeHolder: 'e.g., processUserData'
    });

    if (!functionName) return;

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Extracting function...',
      cancellable: false
    }, async () => {
      const extracted = this._extractFunction(text, functionName, document.languageId, range.start.line);
      
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, extracted.call);
      
      const insertPos = new vscode.Position(range.start.line, 0);
      edit.insert(document.uri, insertPos, extracted.function + '\n\n');
      
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage(`Function "${functionName}" extracted`);
    });
  }

  async generateDocs(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Generating documentation...',
      cancellable: false
    }, async () => {
      const docs = await this._generateDocumentation(text, document.languageId);
      
      const edit = new vscode.WorkspaceEdit();
      edit.insert(document.uri, new vscode.Position(range.start.line, 0), docs + '\n');
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage('Documentation generated');
    });
  }

  async toArrowFunction(params: any) {
    const { text, range, documentUri } = params;
    const document = await vscode.workspace.openTextDocument(documentUri);

    const arrowCode = this._convertToArrow(text);
    
    if (arrowCode === text) {
      vscode.window.showWarningMessage('No function declaration found to convert');
      return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, arrowCode);
    await vscode.workspace.applyEdit(edit);
    
    vscode.window.showInformationMessage('Converted to arrow function');
  }

  private async _getExplanation(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'explain');
    if (aiResult) return aiResult;

    const lines = code.split('\n').filter(l => l.trim());
    const functions = code.match(/function\s+(\w+)|def\s+(\w+)|const\s+(\w+)\s*=\s*(async\s+)?\(/g) || [];
    
    return `## Code Overview

This ${language} code contains ${lines.length} lines and ${functions.length} function(s).

## Key Components

${functions.map((f, i) => `- **Function ${i + 1}**: ${f.trim()}`).join('\n')}

## What It Does

This code appears to be part of a larger application. For a detailed explanation with specific line-by-line analysis, configure your AI API key in Settings > MyCode AI.

## Suggestions

- Consider adding proper error handling
- Add unit tests for critical functions
- Follow consistent naming conventions`;
  }

  private async _generateComments(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'addComments');
    if (aiResult) return aiResult;

    const lines = code.split('\n');
    const commentedLines: string[] = [];
    let inFunction = false;
    let functionStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/function\s+\w+|def\s+\w+|const\s+\w+\s*=\s*(async\s+)?\(/)) {
        inFunction = true;
        functionStart = i;
        
        const funcName = line.match(/function\s+(\w+)|def\s+(\w+)|const\s+(\w+)/)?.[1] || 
                         line.match(/function\s+(\w+)|def\s+(\w+)|const\s+(\w+)/)?.[2] ||
                         line.match(/function\s+(\w+)|def\s+(\w+)|const\s+(\w+)/)?.[3] || 'function';
        
        if (language === 'python') {
          commentedLines.push('    """');
          commentedLines.push(`    ${funcName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
          commentedLines.push('    ');
          commentedLines.push('    Args:');
          commentedLines.push('        None');
          commentedLines.push('    ');
          commentedLines.push('    Returns:');
          commentedLines.push('        None');
          commentedLines.push('    """');
        } else {
          commentedLines.push('/**');
          commentedLines.push(` * ${funcName.replace(/([A-Z])/g, ' $1').trim()}`);
          commentedLines.push(' *');
          commentedLines.push(' * @description TODO');
          commentedLines.push(' * @param {Object} params - TODO');
          commentedLines.push(' * @returns {void} TODO');
          commentedLines.push(' */');
        }
      }
      
      commentedLines.push(line);
    }

    return commentedLines.join('\n');
  }

  private async _generateTestCode(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'generateTests');
    if (aiResult) return aiResult;

    const functions = code.match(/function\s+(\w+)|def\s+(\w+)/g) || [];
    const funcNames = functions.map(f => {
      const m = f.match(/function\s+(\w+)|def\s+(\w+)/);
      return m?.[1] || m?.[2] || 'test';
    });

    if (language === 'python') {
      return `import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


class TestCode(unittest.TestCase):
    """Test cases for the code module."""

    def setUp(self):
        """Set up test fixtures."""
        pass

    def tearDown(self):
        """Tear down test fixtures."""
        pass

${funcNames.map(name => `    def test_${name}(self):
        """Test ${name} function."""
        # TODO: Implement test for ${name}
        self.assertTrue(True)
`).join('\n')}


if __name__ == '__main__':
    unittest.main()
`;
    }

    return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Code Tests', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

${funcNames.map(name => `  it('should ${name} correctly', () => {
    // TODO: Implement test for ${name}
    expect(true).toBe(true);
  });
`).join('\n')}
});
`;
  }

  private async _getOptimizedCode(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'optimize');
    if (aiResult) return aiResult;

    let optimized = code;
    
    optimized = optimized.replace(/var\s+(\w+)\s*=/g, 'const $1 =');
    optimized = optimized.replace(/\s+==\s+/g, ' === ');
    optimized = optimized.replace(/\s+!=\s+/g, ' !== ');
    
    return optimized;
  }

  private _improveNaming(code: string, language: string): string {
    let improved = code;
    
    const varPatterns = [
      { pattern: /\bvar1\b/g, replacement: 'firstVariable' },
      { pattern: /\bvar2\b/g, replacement: 'secondVariable' },
      { pattern: /\btmp\b/g, replacement: 'temporary' },
      { pattern: /\bdata\b/g, replacement: 'resultData' },
      { pattern: /\bflag\b/g, replacement: 'isCompleted' },
      { pattern: /\bcnt\b/g, replacement: 'count' },
      { pattern: /\bidx\b/g, replacement: 'index' },
      { pattern: /\bstr\b/g, replacement: 'text' },
      { pattern: /\bn\b/g, replacement: 'count' },
      { pattern: /\bi\b/g, replacement: 'index' }
    ];

    for (const { pattern, replacement } of varPatterns) {
      improved = improved.replace(pattern, replacement);
    }

    return improved;
  }

  private async _addErrorHandling(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'addErrorHandling');
    if (aiResult) return aiResult;

    if (language === 'python') {
      return `try:
${code.split('\n').map(l => '    ' + l).join('\n')}
except Exception as e:
    # TODO: Handle specific exceptions
    print(f"An error occurred: {e}")
    raise
`;
    }

    return `try {
${code.split('\n').map(l => '  ' + l).join('\n')}
} catch (error) {
  // TODO: Handle specific error types
  console.error('An error occurred:', error);
  throw error;
}
`;
  }

  private _extractFunction(code: string, name: string, language: string, lineOffset: number): { function: string; call: string } {
    const indent = code.match(/^(\s*)/)?.[1] || '';
    const trimmedCode = code.replace(/^\s*/gm, '');

    if (language === 'python') {
      return {
        function: `${indent}def ${name}():\n${code.split('\n').map(l => indent + '    ' + l.trimStart()).join('\n')}`,
        call: `${indent}${name}()`
      };
    }

    return {
      function: `${indent}function ${name}() {\n${code.split('\n').map(l => indent + '  ' + l.trimStart()).join('\n')}\n${indent}}`,
      call: `${indent}${name}();`
    };
  }

  private async _generateDocumentation(code: string, language: string): Promise<string> {
    const aiResult = await this._callAI(code, language, 'generateDocs');
    if (aiResult) return aiResult;

    const firstLineMatch = code.match(/function\s+(\w+)|def\s+(\w+)|class\s+(\w+)/);
    const name = firstLineMatch?.[1] || firstLineMatch?.[2] || firstLineMatch?.[3] || 'Code';

    if (language === 'python') {
      return `"""
${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

Description:
    TODO: Add description

Args:
    None

Returns:
    None

Raises:
    None
"""
`;
    }

    return `/**
 * ${name.replace(/([A-Z])/g, ' $1').trim()}
 * 
 * @description TODO - Add description
 * 
 * @param {Object} params - Parameters
 * @returns {void} 
 * @example
 * // Example usage
 * ${name}();
 */
`;
  }

  private _convertToArrow(code: string): string {
    return code.replace(
      /function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*)\}/,
      (match, name, params, body) => {
        return `const ${name} = (${params}) => {${body}};`;
      }
    );
  }

  private async _callAI(code: string, language: string, action: string): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    const baseUrl = config.get<string>('baseUrl', 'https://api.openai.com/v1');
    const model = config.get<string>('defaultModel', 'gpt-4o');

    if (!apiKey || code.length > 4000) {
      return null;
    }

    try {
      const prompts: Record<string, string> = {
        explain: 'Explain the following code in detail, including what it does, how it works, and potential improvements.',
        addComments: 'Add clear, concise comments to the following code. Return ONLY the modified code with comments.',
        generateTests: 'Generate unit tests for the following code. Return ONLY the test code.',
        optimize: 'Optimize the following code for better performance and readability. Return ONLY the optimized code.',
        addErrorHandling: 'Add proper error handling to the following code. Return ONLY the modified code.',
        generateDocs: 'Generate JSDoc/ docstring documentation for the following code. Return ONLY the documentation comment.'
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
              content: prompts[action] || 'Help with the following code.'
            },
            {
              role: 'user',
              content: `Language: ${language}\n\nCode:\n${code}`
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

  private _getTestFileUri(originalUri: vscode.Uri, language: string): vscode.Uri {
    const filePath = originalUri.fsPath;
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    const ext = fileName.substring(fileName.lastIndexOf('.'));

    let testFileName: string;
    if (language === 'python') {
      testFileName = `test_${baseName}.py`;
    } else {
      testFileName = `${baseName}.test${ext}`;
    }

    return vscode.Uri.file(`${dir}/${testFileName}`);
  }

  private _getExplanationHtml(code: string, explanation: string, language: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Explanation</title>
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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .lang-badge {
      padding: 4px 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📖 Code Explanation</h1>
    <span class="lang-badge">${language}</span>
  </div>
  
  <h2>Selected Code</h2>
  <pre>${this._escapeHtml(code)}</pre>
  
  <h2>Explanation</h2>
  <div id="explanation">${this._formatMarkdown(explanation)}</div>
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
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Refactor activated');

  const assistant = new RefactorAssistant(context);

  const actionProvider = new AICodeActionProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('*', actionProvider as unknown as vscode.CodeActionProvider<vscode.CodeAction>, {
      providedCodeActionKinds: AICodeActionProvider.providedCodeActionKinds
    })
  );

  const commands = [
    'explain',
    'addComments',
    'generateTests',
    'optimize',
    'fixNaming',
    'addErrorHandling',
    'extractFunction',
    'generateDocs',
    'toArrow'
  ];

  for (const cmd of commands) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`mycode-ai-refactor.${cmd}`, (params) => {
        if (!params) {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showWarningMessage('No code selected');
            return;
          }
          params = {
            documentUri: editor.document.uri,
            range: editor.selection,
            text: editor.document.getText(editor.selection)
          };
        }
        
        (assistant as any)[cmd](params);
      })
    );
  }
}

export function deactivate() {
  console.log('MyCode AI Refactor deactivated');
}
