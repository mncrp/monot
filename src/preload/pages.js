const {webFrame, contextBridge, ipcRenderer} = require('electron');

webFrame.setZoomFactor(1);

contextBridge.exposeInMainWorld('node', {
  context: (text) => {
    ipcRenderer.invoke('context', text);
  }
});
