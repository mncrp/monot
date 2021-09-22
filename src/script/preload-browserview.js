const {contextBridge, ipcRenderer, Menu} = require('electron');
const fs = require('fs');
const path = require('path');

function isIndex() {
  if(ipcRenderer.send('getBrowserUrl')==path.join(`${__dirname}/../resource/index.html`)){
    return true;
  }else{
    return false;
  }
}

contextBridge.exposeInMainWorld('node',{
  saveEngine: (engine)=>{
    if(isIndex()){
      let obj=JSON.parse(fs.readFileSync(`${__dirname}/src/config/setting.mncfg`));
      obj.engine=engine;
      fs.writeFileSync(
        `${__dirname}/src/config/setting.mncfg`,
        JSON.stringify(obj)
      )
      console.log(JSON.stringify(obj))
    }
  },
  context: ()=>{
    ipcRenderer.send('context');
  },
  getEngineURL: ()=>{
    let file=fs.readFileSync(`${__dirname}/../config/engines.mncfg`,'utf-8');
    let obj=JSON.parse(file);
    return obj.values[obj.engine];
  }
})
