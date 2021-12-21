const {contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.invoke('context');
  },
  getEngineURL: () => {
    const file = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, 'utf-8');
    const obj = JSON.parse(file);
    return obj.values[obj.engine];
  }
});
