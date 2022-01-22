const {contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.invoke('context');
  },
  getEngineURL: () => {
    let url;
    // たぶんここら辺バグってる
    async function getUserPath() {
      const res = await ipcRenderer.invoke('userPath');
      const file = fs.readFileSync(
        `${res}/engines.mncfg`,
        'utf-8'
      );
      const obj = JSON.parse(file);
      url = obj.values[obj.engine];
      console.log(url);
    }
    return url;
  }
});
