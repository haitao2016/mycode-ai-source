# MyCode AI — VS Code Extension

AI-powered coding assistant: chat, agent, completion, review, debug, git, LSP & tasks — all inside VS Code.

## Features

| Feature | Description |
|---------|-------------|
| **AI Chat** 💬 | Chat with AI in the sidebar |
| **AI Agent** 🤖 | Autonomous multi-step coding agent |
| **Code Completion** ✨ | AI-powered inline suggestions |
| **Code Review** 👁️ | Review files or workspace for issues |
| **Generate Docs** 📝 | Auto-generate documentation |
| **Refactor** 🔧 | AI-suggested improvements |
| **Debug Assistant** 🐛 | AI error analysis |
| **Git Control** 🌿 | Commit, push, pull from sidebar |
| **LSP Integration** 📡 | Language server management |
| **Task Runner** ⚡ | Build, test, clean commands |
| **Search** 🔍 | Global, symbol, file search |

## Quick Start

```bash
npm install
npm run compile
```

Then set your API key in VS Code settings:

```json
{
  "mycode-ai.apiKey": "sk-your-key",
  "mycode-ai.provider": "openai",
  "mycode-ai.model": "gpt-4o"
}
```

## Commands (30+)

Right-click selected code → Generate / Explain / Review / Refactor.
Or use `Cmd/Ctrl+Shift+P` → "MyCode AI: ..."

## Architecture

```
src/
├── extension.ts          # Entry point
├── types.ts / aiService.ts
├── chat/provider.ts      # AI Chat webview
├── agent/provider.ts     # AI Agent webview
├── completion/provider.ts
├── review/commands.ts
├── debug/commands.ts
├── git/provider.ts
├── lsp/commands.ts
├── task/commands.ts
└── search/commands.ts
```

## License

MIT
