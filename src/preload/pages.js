const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('node', {
  context: (text) => {
    ipcRenderer.invoke('context', text);
  }
});
