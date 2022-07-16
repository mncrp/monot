const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require('electron');

ipcRenderer.on('updateTheme', (e, filepath) => {
  let setThemeMessage = '';
  if (filepath === undefined) {
    setThemeMessage = '現在テーマは設定されてません';
  } else {
    setThemeMessage = `現在のテーマは ${ filepath } です`;
  }

  webFrame.executeJavaScript(`
    document.getElementById('theme').innerHTML = \`
    <h2>テーマ</h2>
    <p>${setThemeMessage}</p>
    <p><a href="javascript:node.selectTheme();">ファイルを選択...</a></p>
    <p><a href="javascript:node.resetTheme();">テーマをリセット</a></p>
  \`;
  `);
});

ipcRenderer.on('updateWallpaper', (e, filepath) => {
  let setWallpaperMessage = '';
  if (filepath === undefined) {
    setWallpaperMessage = '現在の壁紙は設定されてません';
  } else {
    setWallpaperMessage = `現在の壁紙は ${ filepath } です`;
  }

  webFrame.executeJavaScript(`
    document.getElementById('wallpaper').innerHTML = \`
    <h2>壁紙</h2>
    <p>${setWallpaperMessage}</p>
    <p><a href="javascript:node.selectWallpaper();">ファイルを選択...</a></p>
    <p><a href="javascript:node.resetWallpaper();">壁紙をリセット</a></p>
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
  }
});
