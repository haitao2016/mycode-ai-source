import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.resolve(__dirname, '../preload/index.js');
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: 'MyCode AI',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.show();

  const htmlPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadFile(htmlPath).then(() => {
    console.log('[Window] HTML file loaded successfully');
  }).catch((error) => {
    console.error('[Window] Failed to load HTML file:', error);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Window] App loaded successfully');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});