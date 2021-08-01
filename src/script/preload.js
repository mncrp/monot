const {contextBridge, ipcRenderer} = require('electron');
const {execSync}=require('child_process');

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
    try{
        if(word.toLowerCase().substring(0, 4)=='http'){
        ipcRenderer.send('moveView',word);
      }else if(word.toLowerCase().substring(0, 4)!='http'){
        let output=execSync(`ping -n 1 ${word}`);
        let dat=output.toString().substring(0, output.toString().indexOf('/')).toLowerCase();
        if(dat.substring(0,3)!='ping'){
          ipcRenderer.send('moveView',`http://${word}`);
        }else{
          ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
        }
      }else if(word=='about:blank'){
        ipcRenderer.send('moveViewBlank');
      }else{
        ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
      }
    }catch(e){
      ipcRenderer.send('moveView',`https://www.duckduckgo.com/?q=${word}`);
    }
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
  }
})
