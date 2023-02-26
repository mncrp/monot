const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  },
  removeBookmark: (key) => {
    ipcRenderer.invoke('removeBookmark', key);
  },
  translate: (inEn) => {
    return ipcRenderer.invoke('translate.get', inEn);
  }
});
