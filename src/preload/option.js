const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  viewSettings: () => {
    ipcRenderer.invoke('settings.view');
    ipcRenderer.invoke('options');
  }
});
