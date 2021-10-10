const {contextBridge, ipcRenderer, Menu} = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('node',{
  context: ()=>{
    ipcRenderer.send('context');
  },
  getEngineURL: ()=>{
    let file=fs.readFileSync(`${__dirname}/../config/engines.mncfg`,'utf-8');
    let obj=JSON.parse(file);
    return obj.values[obj.engine];
  }
})
