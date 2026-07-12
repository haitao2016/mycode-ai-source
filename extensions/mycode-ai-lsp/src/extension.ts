import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

let lspEnabled = true;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.lsp.restart', async () => {
      await restartLanguageServers();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.lsp.status', () => {
      showLspStatus();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.lsp.enable', async () => {
      lspEnabled = true;
      await restartLanguageServers();
      vscode.window.showInformationMessage('LSP enabled');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.lsp.disable', async () => {
      lspEnabled = false;
      vscode.window.showInformationMessage('LSP disabled');
    })
  );

  const config = vscode.workspace.getConfiguration('mycode-ai.lsp');
  if (config.get('enabled', true)) {
    startLanguageServers();
  }

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('mycode-ai.lsp')) {
      restartLanguageServers();
    }
  });

  registerCustomProviders(context);

  console.log('MyCode AI LSP extension activated');
}

export function deactivate() {}

async function startLanguageServers() {
  const config = vscode.workspace.getConfiguration('mycode-ai.lsp');
  
  if (config.get('typescript.enabled', true)) {
    await configureTypeScriptServer();
  }
  
  if (config.get('python.enabled', true)) {
    await configurePythonServer();
  }
}

async function restartLanguageServers() {
  if (lspEnabled) {
    await startLanguageServers();
  }
}

async function configureTypeScriptServer() {
  try {
    const tsExtension = vscode.extensions.getExtension('vscode.typescript-language-features');
    if (tsExtension && !tsExtension.isActive) {
      await tsExtension.activate();
    }
    console.log('TypeScript Language Server configured');
  } catch (error) {
    console.log('Failed to configure TypeScript Language Server:', error);
  }
}

async function configurePythonServer() {
  try {
    const pyExtension = vscode.extensions.getExtension('ms-python.python');
    if (pyExtension && !pyExtension.isActive) {
      await pyExtension.activate();
    }
    console.log('Python Language Server configured');
  } catch (error) {
    console.log('Failed to configure Python Language Server:', error);
  }
}

function showLspStatus() {
  const tsExtension = vscode.extensions.getExtension('vscode.typescript-language-features');
  const pyExtension = vscode.extensions.getExtension('ms-python.python');
  
  const tsStatus = tsExtension?.isActive ? 'Running' : 'Stopped';
  const pyStatus = pyExtension?.isActive ? 'Running' : 'Stopped';
  
  const message = `LSP Status:\nTypeScript: ${tsStatus}\nPython: ${pyStatus}`;
  vscode.window.showInformationMessage(message);
}

function registerCustomProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideHover: async (document: vscode.TextDocument, position: vscode.Position) => {
          return new vscode.Hover('AI-powered hover information');
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideDefinition: async (document: vscode.TextDocument, position: vscode.Position) => {
          return [];
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideCompletionItems: async () => {
          return [];
        }
      },
      '.', ' '
    )
  );

  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideReferences: async () => {
          return [];
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerRenameProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideRenameEdits: async () => {
          return null;
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'],
      {
        provideDocumentFormattingEdits: async () => {
          return [];
        }
      }
    )
  );
}
