# MyCode-AI

AI-powered IDE based on Code-OSS (VS Code open source).

## Architecture

MyCode-AI is built as a VS Code extension collection that injects into Code-OSS, providing AI-powered coding assistance through native VS Code APIs.

```
mycode-ai/
├── extensions/
│   └── mycode-ai-core/       # Core VS Code extension
│       ├── src/
│       │   ├── extension.ts  # Extension entry point
│       │   ├── panels/       # Webview View providers
│       │   ├── commands/     # VS Code commands
│       │   └── services/     # Business logic
│       └── package.json      # Extension manifest
├── scripts/
│   └── inject-into-code-oss.js  # Build & inject script
└── src/renderer/services/    # Legacy services (deprecated)
```

## Prerequisites

- [Code-OSS](https://github.com/microsoft/vscode) source code
- Node.js >= 18
- npm or yarn

## Build

```bash
# Install dependencies
npm install

# Build extension
npm run build:ext

# Inject into Code-OSS
npm run inject

# Or build everything
npm run build
```

## Development

```bash
# Watch extension changes
npm run build:ext:watch
```

## Features

- **AI Chat** - Webview View sidebar for AI-powered conversations
- **Code Generation** - Generate code from natural language descriptions
- **Code Review** - AI-powered code review and suggestions
- **Plan Management** - Development plan and milestone tracking
- **Skills** - ClawHub skill marketplace integration

## Extension Commands

| Command | Description |
|---------|-------------|
| `MyCode-AI: Open AI Chat` | Open AI chat sidebar |
| `MyCode-AI: Generate Code` | Generate code from selection |
| `MyCode-AI: Explain Code` | Explain selected code |
| `MyCode-AI: Review Code` | Review selected code |
| `MyCode-AI: Toggle` | Enable/disable MyCode-AI |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mycode-ai.enabled` | boolean | true | Enable MyCode-AI features |
| `mycode-ai.provider` | string | "openai" | AI provider (openai/anthropic/google/local) |
| `mycode-ai.apiKey` | string | "" | API key for selected provider |
| `mycode-ai.model` | string | "gpt-4" | Model to use |
