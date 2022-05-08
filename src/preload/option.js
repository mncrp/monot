const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require('electron');

ipcRenderer.on('updatedHistory', (e, html) => {
  webFrame.firstChild.executeJavaScript(`
    console.log(
      document.body
    );
    if (document.body.id === 'history') {
      document.getElementById('histories').innerHTML = \`
        \${document.getElementById('histories').innerHTML}${html}
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
  }
});
