const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require('electron');

ipcRenderer.on('updateTheme', (e, filepath) => {
  webFrame.executeJavaScript(`
    document.getElementById('theme').innerHTML = \`
    <h2>テーマ</h2>
    <p>現在${filepath}が選択されています</p>
    <p><a href="javascript:node.selectTheme();">ファイルを選択...</a></p>
    <p><a href="javascript:node.resetTheme();">テーマをリセット</a></p>
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
  }
});
