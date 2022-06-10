const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require('electron');

ipcRenderer.on('updatedHistory', (e, html) => {
  webFrame.firstChild.executeJavaScript(`
    if (document.body.id === 'history') {
      document.getElementById('histories').innerHTML = \`
        \${document.getElementById('histories').innerHTML}${html}
      \`;
    }
  `);
});

ipcRenderer.on('updatedBookmark', (e, html) => {
  webFrame.firstChild.executeJavaScript(`
    if (document.body.id === 'bookmark') {
      document.getElementById('bookmarks').innerHTML = \`
        \${document.getElementById('bookmarks').innerHTML}${html}
      \`;
    }
  `);
});

contextBridge.exposeInMainWorld('node', {
  viewSettings: () => {
    ipcRenderer.invoke('settings.view');
    ipcRenderer.invoke('options');
  },
  viewHistory: () => {
    ipcRenderer.invoke('viewHistory');
    ipcRenderer.invoke('options');
  },
  updateHistory: () => {
    ipcRenderer.invoke('updateHistory');
  },
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  },
  addBookmark: () => {
    ipcRenderer.invoke('addABookmark');
  },
  updateBookmark: () => {
    ipcRenderer.invoke('updateBookmark');
  },
  viewBookmark: () => {
    ipcRenderer.invoke('viewBookmark');
    ipcRenderer.invoke('options');
  },
  removeBookmark: (key) => {
    ipcRenderer.invoke('removeBookmark', key);
  }
});
