const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  },
  translate: (inEn) => {
    return ipcRenderer.invoke('translate.get', inEn);
  }
});
