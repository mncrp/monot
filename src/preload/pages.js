const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.invoke('context');
  }
});
