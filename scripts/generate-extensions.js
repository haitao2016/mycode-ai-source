const fs = require('fs');
const path = require('path');

const EXTENSIONS_DIR = path.resolve(__dirname, '..', 'extensions');

const extensions = [
  {
    name: 'mycode-ai-chat',
    displayName: 'MyCode AI Chat',
    description: 'AI chat sidebar for MyCode AI',
    category: 'AI',
    activationEvents: ['onView:mycode-ai-chat'],
    main: true,
    contributes: {
      viewsContainers: {
        activitybar: [
          {
            id: 'mycode-ai',
            title: 'MyCode AI',
            icon: '$(sparkle)'
          }
        ]
      },
      views: {
        'mycode-ai': [
          {
            id: 'mycode-ai-chat',
            name: 'AI Chat',
            type: 'webview'
          }
        ]
      },
      commands: [
        {
          command: 'mycode-ai-chat.newConversation',
          title: 'New Conversation',
          category: 'MyCode AI Chat'
        },
        {
          command: 'mycode-ai-chat.clearHistory',
          title: 'Clear Chat History',
          category: 'MyCode AI Chat'
        }
      ]
    }
  },
  {
    name: 'mycode-ai-agent',
    displayName: 'MyCode AI Agent',
    description: 'Agent mode for automated tasks',
    category: 'AI',
    activationEvents: ['onView:mycode-ai-agent'],
    main: true,
    contributes: {
      views: {
        'mycode-ai': [
          {
            id: 'mycode-ai-agent',
            name: 'Agent Mode',
            type: 'webview'
          }
        ]
      },
      commands: [
        {
          command: 'mycode-ai-agent.start',
          title: 'Start Agent',
          category: 'MyCode AI Agent'
        },
        {
          command: 'mycode-ai-agent.stop',
          title: 'Stop Agent',
          category: 'MyCode AI Agent'
        }
      ]
    }
  },
  {
    name: 'mycode-ai-completion',
    displayName: 'MyCode AI Completion',
    description: 'AI code completion and inline editing',
    category: 'AI',
    activationEvents: ['onStartupFinished'],
    main: true,
    contributes: {
      completionProviders: [
        {
          language: '*',
          providerId: 'mycode-ai-completion'
        }
      ],
      codeActions: [
        {
          languages: ['*'],
          kind: 'quickfix'
        }
      ],
      commands: [
        {
          command: 'mycode-ai-completion.toggle',
          title: 'Toggle AI Completion',
          category: 'MyCode AI'
        }
      ],
      configuration: {
        title: 'MyCode AI Completion',
        properties: {
          'mycode-ai.completion.enabled': {
            type: 'boolean',
            default: true,
            description: 'Enable AI code completion'
          },
          'mycode-ai.completion.debounce': {
            type: 'number',
            default: 150,
            description: 'Debounce delay in milliseconds'
          }
        }
      }
    }
  },
  {
    name: 'mycode-ai-review',
    displayName: 'MyCode AI Review',
    description: 'AI-powered code review and analysis',
    category: 'AI',
    activationEvents: ['onCommand:mycode-ai-review.reviewFile'],
    main: true,
    contributes: {
      commands: [
        {
          command: 'mycode-ai-review.reviewFile',
          title: 'Review Current File',
          category: 'MyCode AI Review',
          icon: '$(search)'
        },
        {
          command: 'mycode-ai-review.reviewWorkspace',
          title: 'Review Workspace',
          category: 'MyCode AI Review'
        },
        {
          command: 'mycode-ai-review.showReport',
          title: 'Show Review Report',
          category: 'MyCode AI Review'
        }
      ],
      views: {
        'mycode-ai': [
          {
            id: 'mycode-ai-review',
            name: 'Code Review',
            type: 'webview'
          }
        ]
      }
    }
  },
  {
    name: 'mycode-ai-search',
    displayName: 'MyCode AI Semantic Search',
    description: 'Semantic code search powered by AI',
    category: 'AI',
    activationEvents: ['onCommand:mycode-ai-search.search'],
    main: true,
    contributes: {
      commands: [
        {
          command: 'mycode-ai-search.search',
          title: 'Semantic Search',
          category: 'MyCode AI Search',
          icon: '$(search)'
        },
        {
          command: 'mycode-ai-search.buildIndex',
          title: 'Build Semantic Index',
          category: 'MyCode AI Search'
        },
        {
          command: 'mycode-ai-search.updateIndex',
          title: 'Update Semantic Index',
          category: 'MyCode AI Search'
        }
      ]
    }
  },
  {
    name: 'mycode-ai-refactor',
    displayName: 'MyCode AI Refactor',
    description: 'AI-powered code refactoring assistant',
    category: 'AI',
    activationEvents: ['onStartupFinished'],
    main: true,
    contributes: {
      codeActions: [
        {
          languages: ['*'],
          kind: 'refactor'
        },
        {
          languages: ['*'],
          kind: 'refactor.extract'
        },
        {
          languages: ['*'],
          kind: 'source'
        }
      ],
      commands: [
        {
          command: 'mycode-ai-refactor.explain',
          title: 'Explain Code',
          category: 'MyCode AI Refactor'
        },
        {
          command: 'mycode-ai-refactor.generateTests',
          title: 'Generate Tests',
          category: 'MyCode AI Refactor'
        },
        {
          command: 'mycode-ai-refactor.addComments',
          title: 'Add Comments',
          category: 'MyCode AI Refactor'
        }
      ]
    }
  },
  {
    name: 'mycode-ai-debug',
    displayName: 'MyCode AI Debug Assistant',
    description: 'AI-powered debugging assistant',
    category: 'AI',
    activationEvents: ['onDebug'],
    main: true,
    contributes: {
      commands: [
        {
          command: 'mycode-ai-debug.analyzeError',
          title: 'Analyze Current Error',
          category: 'MyCode AI Debug',
          icon: '$(bug)'
        },
        {
          command: 'mycode-ai-debug.explainStackTrace',
          title: 'Explain Stack Trace',
          category: 'MyCode AI Debug'
        },
        {
          command: 'mycode-ai-debug.suggestFix',
          title: 'Suggest Fix',
          category: 'MyCode AI Debug'
        }
      ],
      debuggers: [
        {
          type: 'mycode-ai-debug',
          label: 'AI Debug Assistant'
        }
      ]
    }
  }
];

function generateExtension(ext) {
  const extDir = path.join(EXTENSIONS_DIR, ext.name);
  
  if (fs.existsSync(extDir)) {
    console.log(`Skip existing: ${ext.name}`);
    return;
  }

  console.log(`Generating: ${ext.name}`);
  fs.mkdirSync(extDir, { recursive: true });
  fs.mkdirSync(path.join(extDir, 'src'), { recursive: true });

  const packageJson = {
    name: ext.name,
    displayName: ext.displayName,
    description: ext.description,
    version: '1.0.0',
    publisher: 'mycode-ai',
    engines: {
      vscode: '^1.95.0'
    },
    categories: [ext.category],
    activationEvents: ext.activationEvents,
    main: ext.main ? './out/extension.js' : undefined,
    contributes: ext.contributes,
    devDependencies: {
      '@types/vscode': '^1.95.0',
      typescript: '^5.4.0'
    },
    scripts: {
      compile: 'tsc -p tsconfig.json',
      watch: 'tsc -watch -p tsconfig.json'
    }
  };

  fs.writeFileSync(
    path.join(extDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  );

  const tsconfig = {
    compilerOptions: {
      module: 'commonjs',
      target: 'ES2022',
      outDir: 'out',
      lib: ['ES2022'],
      sourceMap: true,
      rootDir: 'src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: 'node',
      resolveJsonModule: true,
      declaration: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'out']
  };

  fs.writeFileSync(
    path.join(extDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  );

  const extensionTs = `import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('${ext.displayName} activated');
  registerCommands(context);
}

function registerCommands(context: vscode.ExtensionContext) {
${ext.contributes?.commands?.map(cmd => `  context.subscriptions.push(
    vscode.commands.registerCommand('${cmd.command}', () => {
      vscode.window.showInformationMessage('${cmd.title} - Coming Soon');
    })
  );`).join('\n') || ''}
}

export function deactivate() {
  console.log('${ext.displayName} deactivated');
}
`;

  fs.writeFileSync(
    path.join(extDir, 'src', 'extension.ts'),
    extensionTs
  );

  const gitignore = `node_modules
out
.vscode-test
*.vsix
.DS_Store
`;

  fs.writeFileSync(
    path.join(extDir, '.gitignore'),
    gitignore
  );

  console.log(`  Done: ${ext.name}`);
}

extensions.forEach(generateExtension);
console.log(`\nGenerated ${extensions.length} extensions`);
