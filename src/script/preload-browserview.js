const {contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.invoke('context');
  }
});
