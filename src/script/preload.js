const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('node',{
  winClose: ()=>{
    ipcRenderer.send('windowClose');
  },
  winMinimize: ()=>{
    ipcRenderer.send('windowMinimize');
  },
  winMaximize: ()=>{
    ipcRenderer.send('windowMaximize');
  },
  winUnmaximize: ()=>{
    ipcRenderer.send('windowUnmaximize');
  },
  maxMin: ()=>{
    ipcRenderer.send('windowMaxMin');
  },
  moveBrowser: (word)=>{
    if(word.toLowerCase().substring(0, 6)=='http:/' || word.toLowerCase().substring(0, 7)=='https:/'){
      // for like "https://example.com" and "http://example.com"
      if(word.indexOf(' ')==-1){
        //if it's url
        ipcRenderer.send('moveView',word);
      }else{
        //if it's not url
        ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
      }
    }else if(word.indexOf(' ')==-1&&word.indexOf('.')!=-1){
      //for like "example.com" and "example.com/example/"
      ipcRenderer.send('moveView',`http://${word}`);
    }else{
      //LAST
      ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
    }
  },
  moveToNewTab: ()=>{
    ipcRenderer.send('moveView',`file://${__dirname}/../resource/index.html`)
  },
  reloadBrowser: ()=>{
    ipcRenderer.send('reloadBrowser');
  },
  backBrowser: ()=>{
    ipcRenderer.send('browserBack');
  },
  goBrowser: ()=>{
    ipcRenderer.send('browserGoes');
  },
  searchBrowser: (word)=>{
    ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
  },
  dirName: ()=>{return __dirname},
  getTab: ()=>{
    return ipcRenderer.send('getTabList');
  },
  makeTab: ()=>{
    ipcRenderer.send('makeNewTab');
  }
})
