const { app, BrowserWindow } = require('electron');

function createWindow() {
  console.log('Creating window...');
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html').then(() => {
    console.log('HTML loaded');
  }).catch(err => {
    console.error('Failed to load HTML:', err);
  });

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('App loaded successfully');
  });
}

app.whenReady().then(() => {
  console.log('App ready');
  createWindow();
});