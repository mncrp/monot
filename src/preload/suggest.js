const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('node', {
  moveBrowser: (txt) => {
    ipcRenderer.invoke('suggest.searchBrowser', txt);
  }
});
