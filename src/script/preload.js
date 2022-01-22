const {app, contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node', {
  winClose: () => {
    // Close window
    ipcRenderer.invoke('windowClose');
  },
  winMinimize: () => {
    // Minimize Window
    ipcRenderer.invoke('windowMinimize');
  },
  winMaximize: () => {
    // Maximize Window
    ipcRenderer.invoke('windowMaximize');
  },
  winUnmaximize: () => {
    // Unmaximize Window
    ipcRenderer.invoke('windowUnmaximize');
  },
  maxMin: () => {
    // Maximize or Minimize Window
    ipcRenderer.invoke('windowMaxMin');
  },
  moveBrowser: (word, index) => {
    // Page navigation
    const file = fs.readFileSync(
      `${app.getPath('userData')}/engines.mncfg`,
      'utf-8'
    );
    const obj = JSON.parse(file);
    const engine = obj.values[obj.engine];

    try {
      try {
        const url = new URL(word);
        ipcRenderer.invoke('moveView', url.origin, index);
      } catch (e) {
        if (word.match(/\S+\.\S+/)) {
          const url = new URL(`http://${word}`);
          ipcRenderer.invoke('moveView', url.origin, index);
        } else {
          ipcRenderer.invoke('moveView', engine + word, index);
        }
      }
    } catch (e) {
      ipcRenderer.invoke('moveView', engine + word, index);
    }
  },
  moveToNewTab: (index) => {
    // move to new tab
    ipcRenderer.invoke('moveToNewTab', index);
  },
  reloadBrowser: (index) => {
    // reload current BrowserView
    ipcRenderer.invoke('reloadBrowser', index);
  },
  backBrowser: (index) => {
    // back current BrowserView
    ipcRenderer.invoke('browserBack', index);
  },
  goBrowser: (index) => {
    // go current BrowserView
    ipcRenderer.invoke('browserGoes', index);
  },
  dirName: () => {
    return __dirname;
  },
  optionsWindow: () => {
    // open options (settings) window
    ipcRenderer.invoke('options');
  },
  newtab: () => {
    // create new tab
    ipcRenderer.invoke('newtab');
  },
  tabMove: (index) => {
    // move tab
    ipcRenderer.invoke('tabMove', index);
  },
  removeTab: (index) => {
    // remove tab
    ipcRenderer.invoke('removeTab', index);
  }
});
