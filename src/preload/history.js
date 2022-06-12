const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  }
});
