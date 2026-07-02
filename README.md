# MyCode-AI

An AI-powered code editor built with Electron + React + TypeScript, inspired by Cursor.

## Features

### Core Editor
- Monaco Editor integration with syntax highlighting
- Multi-file support with tab management
- Code folding and navigation
- Syntax highlighting for multiple languages

### AI-Powered Features
- Code completion powered by AI
- Code review and analysis
- Code refactoring suggestions
- Performance analysis

### Debugging Tools
- Variable watch panel
- Debug console with command execution
- Call stack visualization
- Memory leak detection

### Testing Integration
- Test runner panel
- Code coverage analysis
- Support for multiple test frameworks

### Build System
- CMake integration
- Cross-platform build configuration

### Extensions & Themes
- Extension market
- Theme switching
- Customizable UI

## Tech Stack

- **Framework**: Electron 29 + React 18
- **Language**: TypeScript
- **Editor**: Monaco Editor
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Testing**: Vitest

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Package
```bash
npm run pack
```

### Testing
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting & Formatting
```bash
npm run lint
npm run lint:fix
npm run format
```

## Project Structure

```
src/
├── main/          # Electron main process
├── renderer/      # React frontend
│   ├── components/ # UI components
│   ├── services/   # Core services
│   ├── hooks/      # React hooks
│   └── utils/      # Utility functions
├── preload/       # Preload scripts
└── types/         # Shared TypeScript types
```

## License

MIT