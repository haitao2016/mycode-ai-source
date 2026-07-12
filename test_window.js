const { app, BrowserWindow } = require('electron');

function createWindow() {
  console.log('Creating window...');
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Test Window'
  });

  mainWindow.loadFile('temp_extract/dist/renderer/index_simple.html').then(() => {
    console.log('HTML loaded successfully');
  }).catch(err => {
    console.error('Failed to load HTML:', err);
  });

  mainWindow.on('closed', () => {
    console.log('Window closed');
    app.quit();
  });
}

app.whenReady().then(() => {
  console.log('App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
