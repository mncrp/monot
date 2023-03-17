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
  let setWallpaperMessage = '';
  if (filepath === undefined) {
    setWallpaperMessage = '${wallpaper_set1}';
  } else {
    setWallpaperMessage = `\${wallpaper_set1} ${filepath} \${wallpaper_set2}`;
  }

  webFrame.executeJavaScript(`
    document.getElementById('wallpaper').innerHTML = \`
    <h2>\${wallpaper}</h2>
    <p>${setWallpaperMessage}</p>
    <p><a href="javascript:node.selectWallpaper();">\${select_file}...</a></p>
    <p><a href="javascript:node.resetWallpaper();">\${reset_wallpaper}</a></p>
  \`;
  `);
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
  }
});
