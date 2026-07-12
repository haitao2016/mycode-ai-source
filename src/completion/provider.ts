import * as vscode from 'vscode';

export class CompletionProvider {
  private _enabled = true;
  private _pending: ReturnType<typeof setTimeout> | null = null;
  private _processing = false;

  public register(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
      { scheme: 'file' },
      {
        provideCompletionItems: async (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
          if (!this._enabled) return [];
          const config = vscode.workspace.getConfiguration('mycode-ai.completion');
          const minLen = config.get<number>('minPrefixLength', 2);
          const line = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
          const match = line.match(/(\w+)$/);
          const prefix = match ? match[1] : '';
          if (prefix.length < minLen) return [];
          if (this._pending) clearTimeout(this._pending);
          return new Promise<vscode.CompletionItem[]>((resolve) => {
            this._pending = setTimeout(async () => {
              if (this._processing) { resolve([]); return; }
              this._processing = true;
              try { resolve(await this._fetch(document, position)); }
              catch { resolve([]); }
              finally { this._processing = false; }
            }, config.get<number>('responseDelay', 500));
          });
        },
      },
      '.', '(', ' ', ':'
    );
    context.subscriptions.push(provider);
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.completionToggle', () => {
      this._enabled = !this._enabled;
      vscode.window.showInformationMessage(`AI Completion ${this._enabled ? 'enabled' : 'disabled'}`);
    }));
  }

  private async _fetch(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) return [];
    const maxSuggestions = vscode.workspace.getConfiguration('mycode-ai.completion').get<number>('maxSuggestions', 5);
    const lines = Math.min(position.line + 1, 50);
    const before = document.getText(new vscode.Range(Math.max(0, position.line - lines), 0, position.line, position.character));
    const after = document.getText(new vscode.Range(position.line, position.character, Math.min(document.lineCount, position.line + 10), 0));
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: config.get('model', 'gpt-4o'),
          messages: [
            { role: 'system', content: 'You are a code completion engine. Output ONLY the completion text (one per line, max 5 lines). No explanations.' },
            { role: 'user', content: `Complete:\nFile: ${document.fileName}\nLang: ${document.languageId}\nBefore:\n${before}\n\nAfter:\n${after}\n\nProvide up to ${maxSuggestions} completions.` }
          ],
          temperature: 0.3, max_tokens: 100
        }),
      });
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content ?? '';
      const lines = text.split('\n').filter(l => l.trim());
      return lines.slice(0, maxSuggestions).map((l, i) => {
        const item = new vscode.CompletionItem(l.trim(), vscode.CompletionItemKind.Snippet);
        item.insertText = l.trim();
        item.sortText = String.fromCharCode(65 + i);
        item.documentation = new vscode.MarkdownString('🤖 AI completion');
        return item;
      });
    } catch { return []; }
  }
}
