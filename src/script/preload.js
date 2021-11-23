const {contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node',{
  winClose: ()=>{
    //Close window
    ipcRenderer.send('windowClose');
  },
  winMinimize: ()=>{
    //Minimize Window
    ipcRenderer.send('windowMinimize');
  },
  winMaximize: ()=>{
    //Maximize Window
    ipcRenderer.send('windowMaximize');
  },
  winUnmaximize: ()=>{
    //Unmaximize Window
    ipcRenderer.send('windowUnmaximize');
  },
  maxMin: ()=>{
    //Maximize or Minimize Window
    ipcRenderer.send('windowMaxMin');
  },
  moveBrowser: (word,index)=>{
    //Page navigation
    let file=fs.readFileSync(`${__dirname}/../config/engines.mncfg`,'utf-8');
    let obj=JSON.parse(file);
    let engine=obj.values[obj.engine];
    if(word.toLowerCase().substring(0, 6)=='http:/' || word.toLowerCase().substring(0, 7)=='https:/'){
      // for like "https://example.com" and "http://example.com"
      if(word.indexOf(' ')==-1){
        //if it's url
        ipcRenderer.send('moveView',word,index);
      }else{
        //if it's not url
        ipcRenderer.send('moveView',engine+word,index);
      }
    }else if(word.indexOf(' ')==-1&&word.indexOf('.')!=-1){
      //for like "example.com" and "example.com/example/"
      ipcRenderer.send('moveView',`http://${word}`,index);
    }else{
      //LAST
      ipcRenderer.send('moveView',engine+word,index);
    }
  },
  moveToNewTab: (index)=>{
    //move to new tab
    ipcRenderer.send('moveToNewTab',index)
  },
  reloadBrowser: (index)=>{
    //reload current BrowserView
    ipcRenderer.send('reloadBrowser',index);
  },
  backBrowser: (index)=>{
    //back current BrowserView
    ipcRenderer.send('browserBack',index);
  },
  goBrowser: (index)=>{
    //go current BrowserView
    ipcRenderer.send('browserGoes',index);
  },
  dirName: ()=>{return __dirname},
  optionsWindow: ()=>{
    //open options (settings) window
    ipcRenderer.send('options');
  },
  newtab: ()=>{
    //create new tab
    ipcRenderer.send('newtab');
  },
  tabMove: (index)=>{
    //move tab
    ipcRenderer.send('tabMove',index);
  },
  removeTab: (index)=>{
    //remove tab
    ipcRenderer.send('removeTab',index)
  }
})
