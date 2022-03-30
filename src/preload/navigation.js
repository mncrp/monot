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
  maxMinMac: () => {
    ipcRenderer.invoke('windowMaxMinMac');
  },
  moveBrowser: (url, index) => {
    // Page navigation
    ipcRenderer.invoke('moveView', url, index);
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
  showMenu: () => {
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
  },
  popupMenu: () => {
    ipcRenderer.invoke('popupNavigationMenu');
  }
});
