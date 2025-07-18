const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    icon: 'src/renderer/assets/logo.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.maximize();

  win.loadFile('src/renderer/pages/login.html')

  // Disable zoom in/out and set zoom to 100%
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomLevel(0);
    win.webContents.setVisualZoomLevelLimits(1, 1);
    win.webContents.setZoomFactor(1);
  });

  // Block zoom shortcuts (Ctrl +, Ctrl -, Ctrl 0, Ctrl + mouse wheel)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (
        input.key === '+' ||
        input.key === '-' ||
        input.key === '=' ||
        input.key === '0' ||
        input.code === 'NumpadAdd' ||
        input.code === 'NumpadSubtract' ||
        input.code === 'Numpad0'
      ) {
        event.preventDefault();
      }
      if (input.type === 'keyDown' && (input.key === 'Add' || input.key === 'Subtract')) {
        event.preventDefault();
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
