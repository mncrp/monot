const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('node', {
  changeSearchEngine: (engine) => {
    ipcRenderer.invoke('setting.searchEngine', engine);
  },
  changeExperimentalFunctions: (change, to) => {
    ipcRenderer.invoke('setting.changeExperimental');
  }
});
