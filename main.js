const {app, BrowserWindow, BrowserView, dialog, ipcMain, ipcRenderer, screen, Menu}=require('electron');
const fs=require('fs');
var win;
var bv=[];
const viewY=47;
var nowTab=0;

function nw(){
  win=new BrowserWindow({
    width: 1000, height: 700, minWidth: 500, minHeight: 200,
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
  bv[0]=new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  })
  let winSize=win.getSize();
  win.setBrowserView(bv[0]);
  bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  bv[0].setAutoResize({width: true, height: true});
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/index.html`);

  win.on('closed',()=>{
    win=null;
  })
  win.on('maximize',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x:0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('unmaximize',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('enter-full-screen',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })

  bv[0].webContents.on('did-start-loading',()=>{
    win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].setAttribute(\'id\',\'loading\')')
  })
  bv[0].webContents.on('did-finish-load',()=>{
    win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].setAttribute(\'id\',\'loaded\')').then(()=>{win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].removeAttribute(\'id\')')})
  })
}

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
    bv[0].webContents.loadURL(link).then(()=>{
      win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='${bv[0].webContents.getURL().substring(bv[0].webContents.getURL().indexOf('/')+2, bv[0].webContents.getURL().length)}'`)
    }).catch(()=>{
      bv[0].webContents.loadURL(`file://${__dirname}/src/resource/server-notfound.html`).then(()=>{
        win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='';`);
        bv[0].webContents.executeJavaScript(`document.getElementsByTagName('span')[0].innerText='${link}';
          var requiredUrl='${link}';
        `);
      })
      console.log('The previous error is normal. It redirected to a page where the server couldn\'t be found.');
    })
  }

  if(link!=`file://${__dirname}/../resource/index.html`){
    bv[0].webContents.executeJavaScript(`
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
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/blank.html`);
})
ipcMain.on('reloadBrowser',()=>{
  bv[0].webContents.reload();
})
ipcMain.on('browserBack',()=>{
  bv[0].webContents.goBack();
})
ipcMain.on('browserGoes',()=>{
  bv[0].webContents.goForward();
})
ipcMain.on('getTabList',()=>{
  return bv[0];
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
            message: 'Monot 1.0.0 Beta 3について',
            detail: `バージョン: 1.0.0 Beta 3
ビルド番号: 3
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
        role: 'hide',
        label: '隠す'
      },
      {
        role: 'hideothers',
        label: '他を隠す'
      },
      {
        role: 'reload',
        label: 'navの再表示',
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
          bv[0].webContents.reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'CmdOrCtrl+Alt+Z',
        click: ()=>{
          bv[0].webContents.goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'CmdOrCtrl+Alt+X',
        click: ()=>{
          bv[0].webContents.goForward();
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
          bv[0].webContents.toggleDevTools();
        }
      },
      {
        label: 'Monotの開発者向けツール',
        accelerator: 'Alt+F12',
        click: ()=>{
          win.webContents.toggleDevTools();
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);
