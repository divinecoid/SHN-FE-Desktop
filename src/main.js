const { app, BrowserWindow, Menu } = require('electron')

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

  // Create menu template
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            win.loadFile('src/renderer/pages/dashboard.html');
          }
        },
        {
          label: 'Input PO',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            win.loadFile('src/renderer/pages/index.html');
          }
        },
        {
          label: 'AR / AP',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            win.loadFile('src/renderer/pages/arap.html');
          }
        },
        {
          label: 'Mutasi',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            win.loadFile('src/renderer/pages/mutasi.html');
          }
        },
        { type: 'separator' },
        {
          label: 'Logout',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            win.webContents.executeJavaScript(`
              if (typeof showCustomConfirm === 'function') {
                showCustomConfirm('Yakin ingin logout?', () => {
                  localStorage.removeItem('isLoggedIn');
                  window.location.href = 'login.html';
                });
              } else {
                if (confirm('Yakin ingin logout?')) {
                  localStorage.removeItem('isLoggedIn');
                  window.location.href = 'login.html';
                }
              }
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Masterdata',
      submenu: [
        {
          label: 'Jenis Barang',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            win.loadFile('src/renderer/pages/jenis-barang.html');
          }
        },
        {
          label: 'Bentuk Barang',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            win.loadFile('src/renderer/pages/bentuk-barang.html');
          }
        },
        {
          label: 'Grade Barang',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Grade Barang - Coming Soon");');
          }
        },
        {
          label: 'Item Barang',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Item Barang - Coming Soon");');
          }
        },
        {
          label: 'Jenis Mutasi Stock',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Jenis Mutasi Stock - Coming Soon");');
          }
        },
        { type: 'separator' },
        {
          label: 'Supplier',
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Supplier - Coming Soon");');
          }
        },
        {
          label: 'Pelanggan',
          accelerator: 'CmdOrCtrl+7',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Pelanggan - Coming Soon");');
          }
        },
        {
          label: 'Gudang',
          accelerator: 'CmdOrCtrl+8',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Gudang - Coming Soon");');
          }
        },
        {
          label: 'Pelaksana',
          accelerator: 'CmdOrCtrl+9',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Pelaksana - Coming Soon");');
          }
        },
        {
          label: 'Jenis Transaksi Kas',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            // Placeholder for future implementation
            win.webContents.executeJavaScript('alert("Jenis Transaksi Kas - Coming Soon");');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'FUI',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            win.loadFile('src/renderer/pages/fui.html');
          }
        },
        {
          label: 'Workshop',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            win.loadFile('src/renderer/pages/workshop.html');
          }
        },
        {
          label: 'Report',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            win.loadFile('src/renderer/pages/report.html');
          }
        }
      ]
    },
    {
      label: 'Data',
      submenu: [
        {
          label: 'Clear All Data',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            win.webContents.executeJavaScript(`
              if (confirm('Yakin ingin menghapus semua data? Ini tidak dapat dibatalkan.')) {
                localStorage.clear();
                alert('Semua data telah dihapus.');
              }
            `);
          }
        },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            win.webContents.executeJavaScript(`
              const data = {};
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'surya-logam-jaya-data-' + new Date().toISOString().split('T')[0] + '.json';
              a.click();
              URL.revokeObjectURL(url);
            `);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            win.webContents.executeJavaScript(`
              alert('SURYA LOGAM JAYA\\nPT. SURYA HARSA NAGARA\\n\\nVersion: 1.0.0\\n\\nInventory Management System');
            `);
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+Shift+K',
          click: () => {
            win.webContents.executeJavaScript(`
              alert('Keyboard Shortcuts:\\n\\n' +
                'Ctrl+D - Dashboard\\n' +
                'Ctrl+P - Input PO\\n' +
                'Ctrl+A - AR/AP\\n' +
                'Ctrl+M - Mutasi\\n' +
                'Ctrl+F - FUI\\n' +
                'Ctrl+W - Workshop\\n' +
                'Ctrl+R - Report\\n' +
                'Ctrl+1-9 - Masterdata items\\n' +
                'Ctrl+L - Logout\\n' +
                'Ctrl+Q - Exit');
            `);
          }
        }
      ]
    }
  ];

  // Build menu from template
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
