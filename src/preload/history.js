const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  },
  updateHistory: () => {
    ipcRenderer.invoke('update.History');
  },
  translate: (inEn) => {
    return ipcRenderer.invoke('translate.get', inEn);
  }
});
