// require
const { app, BrowserWindow, BrowserView, dialog, ipcMain, Menu } = require('electron');
const contextMenu = require('electron-context-menu');
const fs = require('fs');

// variables
let win, setting, config;
let index = 0;
const adBlockCode = fs.readFileSync(`${__dirname}/src/script/adBlock.js`, 'utf-8');
const bv = [];
const viewY = 66;

// config.mncfg
try {
  fs.readFileSync(
    `${app.getPath('userData')}/config.mncfg`,
    'utf-8'
  );
} catch (e) {
  // app.getPath('userData')/config.mncfg isn't found
  fs.writeFile(
    `${app.getPath('userData')}/config.mncfg`,
    fs.readFileSync(`${__dirname}/src/config/config.mncfg`),
    (err) => {
      if (err) throw err;
    }
  );
}
// engines.mncfg
try {
  fs.readFileSync(
    `${app.getPath('userData')}/engines.mncfg`,
    'utf-8'
  );
} catch (e) {
  // app.getPath('userData')/config.mncfg isn't found
  fs.writeFile(
    `${app.getPath('userData')}/engines.mncfg`,
    fs.readFileSync(`${__dirname}/src/config/engines.mncfg`),
    (err) => {
      if (err) throw err;
    }
  );
}


contextMenu({
  prepend: () => [
    {
      label: '戻る',
      click: () => {
        bv[index].webContents.goBack();
      }
    },
    {
      label: '進む',
      click: () => {
        bv[index].webContents.goForward();
      }
    },
    {
      label: '設定',
      click: () => {
        showSetting();
      }
    }
  ]
});

// creating new tab function
function newtab() {
  let winSize = win.getSize();
  // create new tab
  const browserview = new BrowserView({
    backgroundColor: '#efefef',
    webPreferences: {
      scrollBounce: true,
      preload: `${__dirname}/src/script/preload-browserview.js`
    }
  });
  browserview.webContents.executeJavaScript(
    `document.addEventListener('contextmenu',()=>{
      node.context();
    })`
  );
  browserview.webContents.on('did-start-loading', () => {
    browserview.webContents.executeJavaScript(
      `document.addEventListener('contextmenu',()=>{
        node.context();
      })`
    );
  });

  // window's behavior
  win.on('closed', () => {
    win = null;
  });
  win.on('maximize', () => {
    winSize = win.getContentSize();
    browserview.setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY + 3 });
  });
  win.on('unmaximize', () => {
    winSize = win.getContentSize();
    browserview.setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
  });
  win.on('enter-full-screen', () => {
    winSize = win.getContentSize();
    browserview.setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY + 2 });
  });

  browserview.webContents.on('did-start-loading', () => {
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('yomikomi-bar')[0]
        .setAttribute('id','loading');
    `);
    browserview.webContents.executeJavaScript(
      `document.addEventListener('contextmenu',()=>{
        node.context();
      })`
    );
  });
  browserview.webContents.on('did-finish-load', () => {
    browserview.setBackgroundColor('#efefef');
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loaded')`
    );
    setTitleUrl(browserview.webContents.getURL());
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${browserview.webContents.getTitle()} - Monot';
      document.getElementById('opened')
        .getElementsByTagName('a')[0]
        .innerText='${browserview.webContents.getTitle()}';
    `);
  });
  browserview.webContents.on('did-stop-loading', () => {
    config = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.mncfg`, 'utf-8'));
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('yomikomi-bar')[0]
        .removeAttribute('id');
    `);
    setTitleUrl(browserview.webContents.getURL());

    // Force-Dark
    if (config.experiments.forceDark === true) {
      browserview.webContents.insertCSS(`
        *{
          background-color: #202020!important;
        }
        *{
          color: #bbb!important;
        }
        a{
          color: #7aa7cd!important;
        }`);
    }
    // fontChange
    if (config.experiments.fontChange === true) {
      browserview.webContents.insertCSS(`
        body,body>*, *{
          font-family: ${config.experiments.changedfont},'Noto Sans JP'!important;
        }`);
    }
    // AD Block
    if (config.experiments.adBlock === true) {
      browserview.webContents.executeJavaScript(adBlockCode);
    }
  });
  browserview.webContents.on('dom-ready', () => {
    // user-agent stylesheet
    browserview.webContents.insertCSS(
      fs.readFileSync(`${__dirname}/src/style/ua.css`, 'utf-8')
    );
  });
  // when the page title is updated (update the window title and tab title) config.mncfg
  browserview.webContents.on('page-title-updated', (e, t) => {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${t} - Monot';
      document.getElementsByTagName('span')[getCurrent()].getElementsByTagName('a')[0].innerText='${t}';`);
  });
  index = bv.length;
  bv.push(browserview);
  win.addBrowserView(browserview);
  bv[bv.length - 1].setBounds({
    x: 0,
    y: viewY,
    width: winSize[0],
    height: winSize[1] - viewY
  });
  bv[bv.length - 1].setAutoResize({
    width: true,
    height: true
  });
  bv[bv.length - 1].webContents.loadURL(
    `file://${__dirname}/src/resource/index.html`
  );
}

function nw() {
  // create window
  win = new BrowserWindow({
    width: 1000, height: 700, minWidth: 400, minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Monot by monochrome.',
    icon: `${__dirname}/src/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/src/script/preload.js`
    }
  });
  win.loadFile(`${__dirname}/src/index.html`);
  // create menu
  /* const browserView = new BrowserView({
    backgroundColor: '#efefef',
    webPreferences: {
      scrollBounce: true
    }
  });
  browserView.setBounds({
    x: win.getSize()[1] - 100,
    y: viewY,
    width: 500,
    height: 500
  });
  browserView.setAutoResize({
    width: true,
    height: true
  });
  win.addBrowserView(browserView);
  browserView.webContents.loadURL(
    `file://${__dirname}/src/menu/index.html`
  );*/
  // create tab
  newtab();
  /* koko nokoshitoite ne!!!(ichiou)
  let configObj = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.mncfg`, 'utf-8'));
  if (configObj.startup == true) {
    configObj.startup = false;
    const exists = (path) => {
      try {
        fs.readFileSync(path, 'utf-8');
        return true;
      } catch (e) {
        return false;
      }
    };
    if (exists(`/mncr/applications.mncfg`)) {
      let obj = JSON.parse(fs.readFileSync(`/mncr/applications.mncfg`, 'utf-8'));
      obj.monot = ['v.1.0.0 Beta 6', '6'];
      fs.writeFileSync(`/mncr/applications.mncfg`, JSON.stringify(obj));
    } else {
      fs.mkdir('/mncr/', () => {
        return true;
      });
      let obj = { monot: ['v.1.0.0 Beta 6', '6'] };
      fs.writeFileSync(`/mncr/applications.mncfg`, JSON.stringify(obj));
    }
    fs.writeFileSync(`${app.getPath('userData')}/config.mncfg`, JSON.stringify(configObj));
  }*/
}

function showSetting() {
  setting = new BrowserWindow({
    width: 760,
    height: 480,
    minWidth: 300,
    minHeight: 270,
    icon: `${__dirname}/src/image/logo.ico`,
    webPreferences: {
      preload: `${__dirname}/src/setting/preload.js`,
      scrollBounce: true
    }
  });
  setting.loadFile(`${__dirname}/src/setting/index.html`);
  if (config.experiments.forceDark === true) {
    setting.webContents.executeJavaScript(
      `document.querySelectorAll('input[type="checkbox"]')[0].checked=true`
    );
  }
}

// This function sets URL to the URL bar of the title bar.
function setTitleUrl(url) {
  if (!(url instanceof URL))
    url = new URL(url);

  // If the URL is Monot build-in HTML, the URL is not set in the URL bar.config.mncfg
  const resourceIndex = new URL(`file://${__dirname}/`);
  if (url.href.includes(resourceIndex.href))
    return Promise.resolve();

  // Set URL in the URL bar.
  return win.webContents.executeJavaScript(
    `document.getElementsByTagName('input')[0].value='${url.host + url.pathname + url.search + url.hash}'`
  );
}

app.on('ready', nw);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});
app.on('activate', () => {
  if (win === null)
    nw();
});

// ipc channels
ipcMain.handle('moveView', (e, link, ind) => {
  const current = ind;
  bv[current].webContents.executeJavaScript(
    `document.addEventListener('contextmenu',()=>{
      node.context();
    })`
  );
  if (link === '') {
    return;
  }

  try {
    setTitleUrl(bv[current].webContents.getURL());
    bv[current].webContents.loadURL(link);
    var title = bv[current].webContents.executeJavaScript(`return document.title;`);
    var description = bv[current].webContents.executeJavaScript(`return document.getElementsByName('description')[0].content;`);
    var url = bv[current].webContents.executeJavaScript(`return location.href;`);
    var icon = bv[current].webContents.executeJavaScript(`
    for (var i = 0; i < document.head.getElementsByTagName('link').length; i++) {
      if (document.head.getElementsByTagName('link')[i].getAttribute('rel') === "shortcut icon") {
        var favicon_url = document.head.getElementsByTagName('link')[i].getAttribute('href');
        break;
      } else {
        var favicon_url = '';
        return favicon_url;
      }
    };
    return favicon_url;
    `);
    var writeObj = {
      pageTitle: title,
      pageDescription: description,
      pageUrl: url,
      pageIcon: icon
    };
    var history = JSON.parse(fs.readFileSync(`${__dirname}/src/data/history.mndata`, 'utf-8'));
    history.unshift(writeObj);
    fs.writeFileSync(`${__dirname}/src/data/history.mndata`, history);
  } catch (e) {
    bv[current].webContents.loadURL(
      `file://${__dirname}/src/resource/server-notfound.html`
    );
    bv[current].webContents.executeJavaScript(
      `document.getElementsByTagName('span')[0].innerText='${link.toLowerCase()}';`
    );
  }
});
ipcMain.handle('windowClose', () => {
  win.close();
});
ipcMain.handle('windowMaximize', () => {
  win.maximize();
});
ipcMain.handle('windowMinimize', () => {
  win.minimize();
});
ipcMain.handle('windowUnmaximize', () => {
  win.unmaximize();
});
ipcMain.handle('windowMaxMin', () => {
  if (win.isMaximized() === true) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.handle('moveViewBlank', (e, index) => {
  bv[index].webContents.loadURL(
    `file://${__dirname}/src/resource/blank.html`
  );
});
ipcMain.handle('reloadBrowser', (e, index) => {
  bv[index].webContents.reload();
});
ipcMain.handle('browserBack', (e, index) => {
  bv[index].webContents.goBack();

});
ipcMain.handle('browserGoes', (e, index) => {
  bv[index].webContents.goForward();
});
ipcMain.handle('getBrowserUrl', (e, index) => {
  return bv[index].webContents.getURL();
});
ipcMain.handle('moveToNewTab', (e, index) => {
  bv[index].webContents.loadURL(`${__dirname}/src/resource/index.html`);
});
ipcMain.handle('context', () => {
  menu.popup();
});
ipcMain.handle('newtab', () => {
  newtab();
});
ipcMain.handle('tabMove', (e, i) => {
  if (i < 0)
    i = 0;
  win.setTopBrowserView(bv[i]);
  index = i;
  win.webContents.executeJavaScript(
    `document.getElementsByTagName('title')[0].innerText='${bv[i].webContents.getTitle()} - Monot';`);
});
ipcMain.handle('removeTab', (e, i) => {
  // source: https://www.gesource.jp/weblog/?p=4112
  try {
    win.removeBrowserView(bv[i]);
    bv[i].destroy();
    bv.splice(i, 1);
  } catch (e) {
    return;
  }
});
ipcMain.handle('userPath', () => {
  return app.getPath('userData');
});

const menu = Menu.buildFromTemplate([
  {
    label: '表示',
    submenu: [
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
        click: () => {
          bv[index].webContents.reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          bv[index].webContents.goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          bv[index].webContents.goForward();
        }
      }
    ]
  },
  {
    label: '編集',
    submenu: [
      {
        label: 'カット',
        role: 'cut'
      },
      {
        label: 'コピー',
        role: 'copy'
      },
      {
        label: 'ペースト',
        role: 'paste'
      }
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {
        label: 'Monotについて',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: () => {
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo.png',
            title: 'Monotについて',
            message: 'Monot 1.0.0 Beta 6について',
            detail: `Monot by monochrome. v.1.0.0 Beta 6 (Build 6)
バージョン: 1.0.0 Beta 6
ビルド番号: 6
開発者: 6人のMonot開発チーム

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot/

Copyright 2021 Sorakime and Monot development team.`
          });
        }
      },
      {
        label: '設定',
        accelerator: 'CmdOrCtrl+Alt+S',
        click: () => {
          showSetting();
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
        click: () => {
          bv[index].webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false,
        click: () => {
          bv[index].webContents.toggleDevTools();
        }
      }
    ]
  }
]);
Menu.setApplicationMenu(menu);
