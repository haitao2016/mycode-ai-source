import * as vscode from 'vscode';

interface CompletionCache {
  key: string;
  items: vscode.CompletionItem[];
  timestamp: number;
}

export class AICompletionProvider implements vscode.CompletionItemProvider {
  private _cache: CompletionCache | null = null;
  private _debounceTimer: NodeJS.Timeout | null = null;

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const enabled = config.get<boolean>('completion.enabled', true);
    
    if (!enabled) {
      return [];
    }

    const debounce = config.get<number>('completion.debounce', 150);
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    if (linePrefix.trim().length < 3) {
      return [];
    }

    const cacheKey = `${document.uri.fsPath}:${position.line}:${position.character}`;
    
    if (this._cache && this._cache.key === cacheKey && Date.now() - this._cache.timestamp < 5000) {
      return this._cache.items;
    }

    return new Promise((resolve) => {
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }

      this._debounceTimer = setTimeout(async () => {
        const items = await this._getCompletions(document, position);
        this._cache = {
          key: cacheKey,
          items,
          timestamp: Date.now()
        };
        resolve(items);
      }, debounce);
    });
  }

  private async _getCompletions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[]> {
    try {
      const config = vscode.workspace.getConfiguration('mycode-ai');
      const apiKey = config.get<string>('apiKey', '');
      
      if (!apiKey) {
        return this._getFallbackCompletions(document, position);
      }

      return this._getFallbackCompletions(document, position);
    } catch {
      return [];
    }
  }

  private _getFallbackCompletions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const lastWord = linePrefix.match(/\w+$/)?.[0] || '';

    if (lastWord.length < 2) {
      return [];
    }

    const language = document.languageId;
    const snippets = this._getLanguageSnippets(language);
    
    return snippets
      .filter(s => s.prefix.toLowerCase().startsWith(lastWord.toLowerCase()))
      .map(s => {
        const item = new vscode.CompletionItem(s.prefix, vscode.CompletionItemKind.Snippet);
        item.detail = s.description;
        item.documentation = s.body;
        item.insertText = new vscode.SnippetString(s.body);
        item.sortText = `0_${s.prefix}`;
        return item;
      });
  }

  private _getLanguageSnippets(language: string): Array<{ prefix: string; body: string; description: string }> {
    const snippets: Record<string, Array<{ prefix: string; body: string; description: string }>> = {
      typescript: [
        { prefix: 'log', body: 'console.log(${1:value});$0', description: 'console.log' },
        { prefix: 'func', body: 'function ${1:name}(${2:params}): ${3:void} {\n\t${0}\n}', description: 'Function declaration' },
        { prefix: 'afunc', body: 'async function ${1:name}(${2:params}): Promise<${3:void}> {\n\t${0}\n}', description: 'Async function' },
        { prefix: 'const', body: 'const ${1:name} = ${2:value};$0', description: 'Const declaration' },
        { prefix: 'let', body: 'let ${1:name} = ${2:value};$0', description: 'Let declaration' },
        { prefix: 'if', body: 'if (${1:condition}) {\n\t${0}\n}', description: 'If statement' },
        { prefix: 'ife', body: 'if (${1:condition}) {\n\t${2:// true\n} else {\n\t${0:// false\n}', description: 'If-else statement' },
        { prefix: 'for', body: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${0}\n}', description: 'For loop' },
        { prefix: 'foreach', body: '${1:array}.forEach((${2:item}) => {\n\t${0}\n});', description: 'ForEach loop' },
        { prefix: 'class', body: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${0}\n\t}\n}', description: 'Class declaration' },
        { prefix: 'imp', body: 'import ${1:default} from \"${2:module}\";$0', description: 'Import default' },
        { prefix: 'imn', body: 'import { ${1:named} } from \"${2:module}\";$0', description: 'Import named' },
        { prefix: 'try', body: 'try {\n\t${0}\n} catch (${1:error}) {\n\t\n}', description: 'Try-catch' },
        { prefix: 'ret', body: 'return ${0};', description: 'Return statement' },
      ],
      javascript: [
        { prefix: 'log', body: 'console.log(${1:value});$0', description: 'console.log' },
        { prefix: 'func', body: 'function ${1:name}(${2:params}) {\n\t${0}\n}', description: 'Function declaration' },
        { prefix: 'afunc', body: 'async function ${1:name}(${2:params}) {\n\t${0}\n}', description: 'Async function' },
        { prefix: 'const', body: 'const ${1:name} = ${2:value};$0', description: 'Const declaration' },
        { prefix: 'arrow', body: '(${1:params}) => ${0}', description: 'Arrow function' },
        { prefix: 'if', body: 'if (${1:condition}) {\n\t${0}\n}', description: 'If statement' },
        { prefix: 'for', body: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${0}\n}', description: 'For loop' },
        { prefix: 'class', body: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${0}\n\t}\n}', description: 'Class declaration' },
        { prefix: 'imp', body: 'import ${1:default} from \"${2:module}\";$0', description: 'Import' },
        { prefix: 'req', body: 'const ${1:module} = require(\"${2:module}\");$0', description: 'Require' },
      ],
      python: [
        { prefix: 'def', body: 'def ${1:name}(${2:params}):\n\t${0}', description: 'Function definition' },
        { prefix: 'class', body: 'class ${1:ClassName}:\n\tdef __init__(self, ${2:params}):\n\t\t${0}', description: 'Class definition' },
        { prefix: 'if', body: 'if ${1:condition}:\n\t${0}', description: 'If statement' },
        { prefix: 'fore', body: 'for ${1:item} in ${2:iterable}:\n\t${0}', description: 'For loop' },
        { prefix: 'while', body: 'while ${1:condition}:\n\t${0}', description: 'While loop' },
        { prefix: 'imp', body: 'import ${1:module}$0', description: 'Import' },
        { prefix: 'from', body: 'from ${1:module} import ${2:name}$0', description: 'From import' },
        { prefix: 'try', body: 'try:\n\t${0}\nexcept ${1:Exception} as e:\n\tpass', description: 'Try-except' },
        { prefix: 'pri', body: 'print(${0})', description: 'Print' },
        { prefix: 'ret', body: 'return ${0}', description: 'Return' },
        { prefix: 'with', body: 'with open(\"${1:file}\", \"${2:r}\") as f:\n\t${0}', description: 'With open' },
      ],
      json: [
        { prefix: '{', body: '{\n\t${0}\n}', description: 'Object' },
        { prefix: '[', body: '[\n\t${0}\n]', description: 'Array' },
        { prefix: 'key', body: '\"${1:key}\": ${0}', description: 'Key-value pair' },
      ],
      html: [
        { prefix: 'div', body: '<div>${0}</div>', description: 'Div element' },
        { prefix: 'divc', body: '<div class=\"${1:class}\">${0}</div>', description: 'Div with class' },
        { prefix: 'p', body: '<p>${0}</p>', description: 'Paragraph' },
        { prefix: 'a', body: '<a href=\"${1:url}\">${0}</a>', description: 'Link' },
        { prefix: 'img', body: '<img src=\"${1:src}\" alt=\"${2:alt}\" />$0', description: 'Image' },
        { prefix: 'btn', body: '<button>${0}</button>', description: 'Button' },
        { prefix: 'input', body: '<input type=\"${1:text}\" name=\"${2:name}\" />$0', description: 'Input' },
      ],
      css: [
        { prefix: '.', body: '.${1:class} {\n\t${0}\n}', description: 'Class selector' },
        { prefix: '#', body: '#${1:id} {\n\t${0}\n}', description: 'ID selector' },
        { prefix: 'flex', body: 'display: flex;\njustify-content: center;\nalign-items: center;$0', description: 'Flexbox center' },
        { prefix: 'grid', body: 'display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:1}rem;$0', description: 'Grid layout' },
        { prefix: 'm', body: 'margin: ${0};', description: 'Margin' },
        { prefix: 'p', body: 'padding: ${0};', description: 'Padding' },
        { prefix: 'bg', body: 'background: ${0};', description: 'Background' },
        { prefix: 'c', body: 'color: ${0};', description: 'Color' },
      ],
    };

    return snippets[language] || [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MyCode AI Completion Extension activated');

  const provider = new AICompletionProvider();
  const languages = ['typescript', 'javascript', 'python', 'html', 'css', 'json', 'typescriptreact', 'javascriptreact'];

  for (const lang of languages) {
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        lang,
        provider,
        '.',
        ' ',
        '\t',
        '\n'
      )
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai-completion.toggle', async () => {
      const config = vscode.workspace.getConfiguration('mycode-ai');
      const enabled = config.get<boolean>('completion.enabled', true);
      await config.update('completion.enabled', !enabled, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(
        `AI Completion ${!enabled ? 'enabled' : 'disabled'}`
      );
    })
  );
}

export function deactivate() {
  console.log('MyCode AI Completion Extension deactivated');
}
