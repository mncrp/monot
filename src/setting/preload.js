const {contextBridge, dialog, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node',{
  changeSearchEngine: (engine)=>{
    /*let file=JSON.parse(fs.readFile(`${__dirname}/src/config/engines.mncfg`,'utf-8'));
    file.engine=engine;
    console.log(file);
    fs.writeFileSync(`${__dirname}/src/config/engines.mncfg`,JSON.stringify(file));*/
    //let obj=JSON.parse()
    let text=fs.readFileSync(`${__dirname}/../config/engines.mncfg`,'utf-8');
    let obj=JSON.parse(text);
    obj.engine=engine;
    fs.writeFileSync(`${__dirname}/../config/engines.mncfg`,JSON.stringify(obj));
  }
})
