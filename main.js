const {app, BrowserWindow, BrowserView, dialog, ipcMain, ipcRenderer, screen, Menu}=require('electron');
var win, bv;

function nw(){
  win=new BrowserWindow({
    width: 850, height: 550, minWidth: 500, minHeight: 250,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Monot by monochrome.',
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
  bv.setBounds({x: 0, y: 50, width: winSize[0], height: 500});
  bv.setAutoResize({width: true, height: true});
  bv.webContents.loadURL(`file://${__dirname}/src/resource/index.html`);

  win.on('closed',()=>{
    win=null;
  })
  win.on('maximize',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x:0, y: 49, width: winSize[0], height: winSize[1]-50});
  })
  win.on('unmaximize',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x: 0, y: 50, width: winSize[0], height: winSize[1]-50});
  })
  win.on('enter-full-screen',()=>{
    winSize=win.getContentSize();
    bv.setBounds({x: 0, y: 50, width: winSize[0], height: winSize[1]-50});
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

ipcMain.on('moveView',(e,link)=>{
  bv.webContents.loadURL(link);
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
            message: 'Monot 1.0 Beta 1について',
            detail: `バージョン: 1.0.0 Beta 1
ビルド番号: 1
開発者: Sorakime

リポジトリ: https://github.com/Sorakime/monot
Copyright 2021 Sorakime.`
          })
        }
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
        role: 'quit'
      }
    ]
  },
  {
    label: '移動',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'Ctrl+R',
        click: ()=>{
          bv.webContents.reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Ctrl+Shift+Z',
        click: ()=>{
          bv.webContents.goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Ctrl+Shift+X',
        click: ()=>{
          bv.webContents.goForward();
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);
