const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require('electron');

ipcRenderer.on('updateTheme', (e, filepath) => {
  let setThemeMessage = '';
  if (filepath === undefined) {
    setThemeMessage = '${theme_notset}';
  } else {
    setThemeMessage = `\${theme_set1} ${filepath} \${theme_set2}`;
  }

  webFrame.executeJavaScript(`
    document.getElementById('theme').innerHTML = \`
    <h2>\${theme}</h2>
    <p>${setThemeMessage}</p>
    <p><a href="javascript:node.selectTheme();">\${select_file}...</a></p>
    <p><a href="javascript:node.resetTheme();">$\{reset_theme}</a></p>
  \`;
  `);
});

ipcRenderer.on('updateWallpaper', (e, filepath) => {
  if (filepath !== undefined) {
    (async function() {
      webFrame.executeJavaScript(`
      document.getElementById('wallpaper-msg').innerHTML = \`
      ${await ipcRenderer.invoke('translate.get', 'wallpaper_set1')} ${filepath} ${await ipcRenderer.invoke('translate.get', 'wallpaper_set2')}\`;`);
    })();
  }
});

contextBridge.exposeInMainWorld('node', {
  changeSearchEngine: (engine) => {
    ipcRenderer.invoke('setting.searchEngine', engine);
  },
  changeExperimentalFunctions: (change, to) => {
    ipcRenderer.invoke('setting.changeExperimental', change, to);
  },
  changeUI: (to) => {
    ipcRenderer.invoke('setting.changeUI', to);
  },
  deleteHistory: () => {
    ipcRenderer.invoke('setting.deleteHistory');
  },
  selectTheme: () => {
    ipcRenderer.invoke('setting.openThemeDialog');
  },
  resetTheme: () => {
    ipcRenderer.invoke('setting.resetTheme');
  },
  selectWallpaper: () => {
    ipcRenderer.invoke('setting.openWallpaperDialog');
  },
  resetWallpaper: () => {
    ipcRenderer.invoke('setting.resetWallpaper');
  },
  open: (url) => {
    ipcRenderer.invoke('openPage', url);
  },
  translate: (inEn) => {
    return ipcRenderer.invoke('translate.get', inEn);
  },
  translateAbout: (inEn) => {
    return ipcRenderer.invoke('translate.getAbout', inEn);
  },
  setLang: (lang) => {
    ipcRenderer.invoke('setLang', lang);
  },
  addEngine: (url, name) => {
    ipcRenderer.invoke('addEngine', url, name);
  },
  init: () => {
    ipcRenderer.invoke('init');
  }
});
