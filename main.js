const {app, BrowserWindow, BrowserView, dialog, ipcMain, ipcRenderer, screen, Menu}=require('electron');
const fs=require('fs');
var win;
var bv=[];
const viewY=50;
var nowTab=0;

function nw(){
  win=new BrowserWindow({
    width: 850, height: 550, minWidth: 500, minHeight: 250,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Monot by monochrome.',
    icon: `${__dirname}/src/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration:false,
      contextIsolation: true,
      preload: `${__dirname}/src/script/preload.js`
    }
  });
  win.loadFile(`${__dirname}/src/index.html`);
  bv=new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  })
  let winSize=win.getSize();
  win.setBrowserView(bv);
  bv.setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  bv.setAutoResize({width: true, height: true});
  bv.webContents.loadURL(`file://${__dirname}/src/resource/index.html`);

  win.on('closed',()=>{
    win=null;
  })
  win.on('maximize',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x:0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('unmaximize',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('enter-full-screen',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
}/*
function newTab(){
  let b=new BrowserView();
  bv.push(b);
  win.setBrowserView(bv.slice(-1)[0]);
  bv.slice(-1)[0].setBounds({x:0,y:viewY,width:winSize[0],height:winSize[1]-viewY});
  bv.slice(-1)[0].setAutoResize({width:true,height:true});
  nowTab=bv.length+1;
  bv[nowTab].webContents.loadURL(`file://${__dirname}/src/resource/index.html`);
}
function removeTab(num){
  bv.splice(num);
}*/

app.on('ready', nw);

app.on('window-all-closed',()=>{
  if(process.platform!=='darwin')
    app.quit();
});

app.on('activate',()=>{
  if(win===null)
    nw();
})

//ipc channels
ipcMain.on('moveView',(e,link)=>{
  if(link==''){
    return true;
  }else{
    bv.webContents.loadURL(link).then(()=>{
      win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='${bv.webContents.getURL().substring(bv.webContents.getURL().indexOf('/')+2, bv.webContents.getURL().length)}'`)
    }).catch(()=>{
      bv.webContents.loadURL(`file://${__dirname}/src/resource/server-notfound.html`).then(()=>{
        win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='';`);
        bv.webContents.executeJavaScript(`document.getElementsByTagName('span')[0].innerText='${link}';
          window.node.reload='${bv.webContents.reload}';
        `);
      })
      console.log('The previous error is normal. It redirected to a page where the server couldn\'t be found.');
      /*
      fs.writeFileSync(`${__dirname}/src/config/history.json`,
        JSON.stringify(
          JSON.parse(
            fs.readFileSync(`${__dirname}/src/config/history.json`,'utf-8')
          ).unshift([link, bv.webContents.getTitle()])
        )
      );
      */
    })
  }

  if(link!=`file://${__dirname}/../resource/index.html`){
    bv.webContents.executeJavaScript(`
      document.getElementsByTagName('head')[0].innerHTML=document.getElementsByTagName('head')[0].innerHTML+'<style>*{-webkit-app-region: none!important}</style>'
      document.body.style.userSelect='inherit'
      `);
  }
})
ipcMain.on('windowClose',()=>{
  win.close();
})
ipcMain.on('windowMaximize',()=>{
  win.maximize();
})
ipcMain.on('windowMinimize',()=>{
  win.minimize();
})
ipcMain.on('windowUnmaximize',()=>{
  win.unmaximize();
})
ipcMain.on('windowMaxMin',()=>{
  if(win.isMaximized()==true){
    win.unmaximize();
  }else{
    win.maximize();
  }
})
ipcMain.on('moveViewBlank',()=>{
  bv.webContents.loadURL(`file://${__dirname}/src/resource/blank.html`);
})
ipcMain.on('reloadBrowser',()=>{
  bv.webContents.reload();
})
ipcMain.on('browserBack',()=>{
  bv.webContents.goBack();
})
ipcMain.on('browserGoes',()=>{
  bv.webContents.goForward();
})
ipcMain.on('getTabList',()=>{
  return bv;
})
ipcMain.on('makeNewTab',()=>{
  newTab();
})

let menu=Menu.buildFromTemplate([
  {
    label: '表示',
    submenu: [
      {
        label: 'Monotについて',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: ()=>{
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo.png',
            title: 'Monotについて',
            message: 'Monot 1.0 Beta 2について',
            detail: `バージョン: 1.0.0 Beta 2
ビルド番号: 2
開発者: Sorakime

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot

Copyright 2021 Sorakime.`
          })
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen',
        accelerator: 'F11',
        label: '全画面表示'
      },
      {
        type: 'separator'
      },
      {
        role: 'hide',
        label: '隠す'
      },
      {
        role: 'hideothers',
        label: '他を隠す'
      },
      {
        role: 'reload',
        label: '再起動',
        accelerator: 'CmdOrCtrl+Alt+R'
      },
      {
        label: '終了',
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  {
    label: '移動',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'CmdOrCtrl+R',
        click: ()=>{
          bv.webContents.reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'CtrlOrCmd+Alt+Z',
        click: ()=>{
          bv.webContents.goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'CtrlOrCmd+Alt+X',
        click: ()=>{
          bv.webContents.goForward();
        }
      }
    ]
  },
  {
    label: '開発',
    submenu: [
      {
        label: '開発者向けツール',
        accelerator: 'F12',
        click: ()=>{
          bv.webContents.toggleDevTools()
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);
