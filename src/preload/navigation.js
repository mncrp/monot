const {contextBridge, ipcRenderer} = require('electron');

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
    /* const file = fs.readFileSync(
      `${app.getPath('userData')}/engines.mncfg`,
      'utf-8'
    );
    const obj = JSON.parse(file);
    const engine = obj.values[obj.engine]; */
    const engine = 'https://duckduckgo.com/?q=';

    try {
      try {
        let url = new URL(word);
        url = word;
        ipcRenderer.invoke('moveView', url, index);
      } catch (e) {
        if (word.match(/\S+\.\S+/)) {
          ipcRenderer.invoke('moveView', `http://${word}`, index);
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
