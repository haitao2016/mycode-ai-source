import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

let completionEnabled = true;
let pendingRequest: ReturnType<typeof setTimeout> | null = null;
let isProcessing = false;



export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: '*' },
    {
      provideCompletionItems: async (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
        if (!completionEnabled) return [];

        const config = vscode.workspace.getConfiguration('mycode-ai.completion');
        const minPrefixLength = config.get('minPrefixLength', 2);
        
        const lineText = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
        const prefixMatch = lineText.match(/(\w+)$/);
        const prefix = prefixMatch ? prefixMatch[1] : '';
        
        if (prefix.length < minPrefixLength) return [];

        if (pendingRequest) {
          clearTimeout(pendingRequest);
        }

        return new Promise((resolve) => {
          pendingRequest = setTimeout(async () => {
            if (isProcessing) {
              resolve([]);
              return;
            }
            
            isProcessing = true;
            try {
              const suggestions = await fetchCompletions(document, position);
              resolve(suggestions);
            } catch {
              resolve([]);
            } finally {
              isProcessing = false;
            }
          }, config.get('responseDelay', 500));
        });
      },
      resolveCompletionItem: (item: vscode.CompletionItem) => {
        return item;
      }
    },
    ...vscode.workspace.getConfiguration('mycode-ai.completion').get('triggerCharacters', [' ', '.'])
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.completion.toggle', () => {
      completionEnabled = !completionEnabled;
      vscode.window.showInformationMessage(
        'AI Completion ' + (completionEnabled ? 'enabled' : 'disabled')
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.completion.refresh', () => {
      vscode.commands.executeCommand('editor.action.triggerSuggest');
    })
  );

  context.subscriptions.push(completionProvider);

  console.log('MyCode AI Completion extension activated');
}

export function deactivate() {
  if (pendingRequest) {
    clearTimeout(pendingRequest);
  }
}

async function fetchCompletions(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const apiKey = config.get('apiKey', '');
  
  if (!apiKey) return [];

  const maxSuggestions = vscode.workspace.getConfiguration('mycode-ai.completion').get('maxSuggestions', 5);
  const lineCount = Math.min(position.line + 1, 50);
  
  const beforeContent = document.getText(new vscode.Range(Math.max(0, position.line - lineCount), 0, position.line, position.character));
  const afterContent = document.getText(new vscode.Range(position.line, position.character, Math.min(document.lineCount, position.line + 10), 0));
  
  const context = {
    file: document.fileName,
    language: document.languageId,
    before: beforeContent,
    after: afterContent
  };

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
            content: 'You are a code completion assistant. Provide only code suggestions without explanations. Format output as JSON array of objects with "text" and "score" fields.'
          },
          {
            role: 'user',
            content: 'Complete the following code:\n\nFile: ' + context.file + '\nLanguage: ' + context.language + '\n\nBefore:\n' + context.before + '\n\nAfter:\n' + context.after + '\n\nProvide ' + maxSuggestions + ' completion suggestions.'
          }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    });

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const suggestions = JSON.parse(content) as Array<{ text: string; score?: number }>;
      return suggestions.slice(0, maxSuggestions).map((s, index) => {
        const item = new vscode.CompletionItem(s.text.trim(), vscode.CompletionItemKind.Snippet);
        item.insertText = s.text.trim();
        item.sortText = String.fromCharCode(65 + index);
        item.documentation = new vscode.MarkdownString('AI-powered code completion');
        return item;
      });
    } catch {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      return lines.slice(0, maxSuggestions).map((line, index) => {
        const item = new vscode.CompletionItem(line.trim(), vscode.CompletionItemKind.Snippet);
        item.insertText = line.trim();
        item.sortText = String.fromCharCode(65 + index);
        item.documentation = new vscode.MarkdownString('AI-powered code completion');
        return item;
      });
    }
  } catch {
    return [];
  }
}
