const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadFile('mainPg.html');
}

app.whenReady().then(() => {
  createWindow();
});

// This part handles the electron folder function made with chatgpt (because i had no idea how to do it)
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return [];

  const folderPath = result.filePaths[0];
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => ({
      name: file,
      path: path.join(folderPath, file)
    }));

  return files;
});