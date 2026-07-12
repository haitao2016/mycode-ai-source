const { defineConfig } = require('electron-vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

const srcDir = path.resolve(__dirname, 'src')

module.exports = defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      target: 'node18',
      lib: {
        entry: './src/main/index.ts',
        formats: ['cjs']
      },
      rollupOptions: {
        external: ['electron', 'fs', 'path']
      }
    }
  },
  preload: {
    build: {
      outDir: 'out/preload',
      target: 'node18',
      lib: {
        entry: './src/preload/index.ts',
        formats: ['cjs']
      }
    }
  },
  renderer: {
    root: './src/renderer',
    build: {
      outDir: 'out/renderer',
      target: 'chrome100'
    },
    resolve: {
      alias: {
        '@': srcDir
      }
    },
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true
    }
  }
})