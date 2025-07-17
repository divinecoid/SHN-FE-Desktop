const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    icon: 'src/renderer/assets/logo.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.maximize();

  win.loadFile('src/renderer/pages/index.html')
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
