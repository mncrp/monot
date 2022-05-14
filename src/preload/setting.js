const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('node', {
  changeSearchEngine: (engine) => {
    ipcRenderer.invoke('setting.searchEngine', engine);
  },
  changeExperimentalFunctions: (change, to) => {
    ipcRenderer.invoke('setting.changeExperimental', change, to);
  },
  deleteHistory: () => {
    ipcRenderer.invoke('setting.deleteHistory');
  },
  selectTheme: () => {
    ipcRenderer.invoke('setting.openThemeDialog');
  },
  resetTheme: () => {
    ipcRenderer.invoke('setting.resetTheme');
  }
});
