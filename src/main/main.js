// require
const {app, BrowserWindow, BrowserView, dialog, ipcMain, Menu} = require('electron');
const contextMenu = require('electron-context-menu');
const fs = require('fs');

// letiables
let win, setting, config;
let index = 0;
const directory = `${__dirname}/..`;
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
    fs.readFileSync(`${app.getPath('userData')}/config.mncfg`),
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
    fs.readFileSync(`${app.getPath('userData')}/engines.mncfg`),
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
  const adBlockCode = fs.readFileSync(
    `${directory}/proprietary/experimental/adBlock.js`,
    'utf-8'
  );
  let winSize = win.getSize();
  // create new tab
  const browserview = new BrowserView({
    backgroundColor: '#efefef',
    webPreferences: {
      scrollBounce: true,
      preload: `${directory}/preload/pages.js`
    }
  });

  browserview.webContents.executeJavaScript(`
    document.addEventListener('contextmenu',()=>{
      node.context();
    })
  `);

  // window's behavior
  win.on('closed', () => {
    win = null;
  });
  win.on('maximize', () => {
    winSize = win.getContentSize();
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 3
    });
  });
  win.on('unmaximize', () => {
    winSize = win.getContentSize();
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY
    });
  });
  win.on('enter-full-screen', () => {
    winSize = win.getContentSize();
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 2
    });
  });

  browserview.webContents.on('did-start-loading', () => {
    browserview.webContents.executeJavaScript(`
      document.addEventListener('contextmenu',()=>{
        node.context();
      })
    `);
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('yomikomi-bar')[0]
        .setAttribute('id','loading');
    `);
  });
  browserview.webContents.on('did-finish-load', () => {
    browserview.setBackgroundColor('#efefef');
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loaded')
    `);
    setTitleUrl(browserview.webContents.getURL());
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('title')[0].innerText='${browserview.webContents.getTitle()} - Monot';
      document.getElementById('opened')
        .getElementsByTagName('a')[0]
        .innerText='${browserview.webContents.getTitle()}';
    `);
  });
  browserview.webContents.on('did-stop-loading', () => {
    config = JSON.parse(
      fs.readFileSync(
        `${app.getPath('userData')}/config.mncfg`,
        'utf-8'
      )
    );
    const enginesConfig = fs.readFileSync(
      `${app.getPath('userData')}/engines.mncfg`,
      'utf-8'
    );
    const obj = JSON.parse(enginesConfig);
    const engineURL = obj.values[obj.engine];

    win.webContents.executeJavaScript(`
      document.getElementsByTagName('yomikomi-bar')[0]
        .removeAttribute('id');
    `);
    browserview.webContents.executeJavaScript(`
      url = '${engineURL}';
    `);
    setTitleUrl(browserview.webContents.getURL());

    // Force-Dark
    if (config.experiments.forceDark === true) {
      browserview.webContents.insertCSS(
        fs.readFileSync(
          `${directory}/proprietary/style/forcedark.css`,
          'utf-8'
        )
      );
    }
    // fontChange
    if (config.experiments.fontChange === true) {
      browserview.webContents.insertCSS(`
        body,body>*, *{
          font-family: ${config.experiments.changedfont},'Noto Sans JP'!important;
        }
      `);
    }
    // AD Block
    if (config.experiments.adBlock === true) {
      browserview.webContents.executeJavaScript(adBlockCode);
    }
  });
  browserview.webContents.on('dom-ready', () => {
    // user-agent stylesheet
    browserview.webContents.insertCSS(
      fs.readFileSync(
        `${directory}/proprietary/style/ua.css`,
        'utf-8'
      )
    );
  });
  // when the page title is updated (update the window title and tab title) config.mncfg
  browserview.webContents.on('page-title-updated', (e, t) => {
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('title')[0].innerText='${t} - Monot';
      document.getElementsByTagName('span')[getCurrent()].getElementsByTagName('a')[0].innerText='${t}';
    `);
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
    `file://${directory}/browser/home.html`
  );
}

function nw() {
  // create window
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Monot by monochrome.',
    icon: `${directory}/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${directory}/preload/navigation.js`
    }
  });
  win.setBackgroundColor('#ffffff');
  win.loadFile(`${directory}/renderer/navigation/navigation.html`);
  function getEngine() {
    const data = fs.readFileSync(
      `${app.getPath('userData')}/engines.mncfg`,
      'utf-8'
    );
    const obj = JSON.parse(data);
    return obj.values[obj.engine];
  }
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
    engine = '${getEngine()}';
  `);
  });

  // create tab
  newtab();
}

function showSetting() {
  setting = new BrowserWindow({
    width: 760,
    height: 480,
    minWidth: 300,
    minHeight: 270,
    icon: `${directory}/image/logo.ico`,
    webPreferences: {
      preload: `${directory}/preload/setting.js`,
      scrollBounce: true
    }
  });
  setting.loadFile(`${directory}/renderer/setting/index.html`);
  if (config.experiments.forceDark === true) {
    setting.webContents.executeJavaScript(
      `document.querySelectorAll('input[type="checkbox"]')[0].checked=true;`
    );
  }
}

// This function sets URL to the URL bar of the title bar.
function setTitleUrl(url) {
  if (!(url instanceof URL)) {
    url = new URL(url);
  }
  // If the URL is Monot build-in HTML, the URL is not set in the URL bar.
  const resourceIndex = new URL(`file://${__dirname}/`);
  const partOfUrl = url.href.substring(0, resourceIndex.href.length - 5);
  const partOfResourceIndex = resourceIndex.href.substring(0, resourceIndex.href.length - 5);
  const isSame = partOfUrl === partOfResourceIndex;
  if (isSame)
    return Promise.resolve();

  // Set URL in the URL bar.
  return win.webContents.executeJavaScript(`
    document.getElementsByTagName('input')[0].value='${url.href}';
  `);
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
  bv[current].webContents.executeJavaScript(`
    document.addEventListener('contextmenu',()=>{
      node.context();
    })
  `);
  if (link === '') {
    return;
  }

  try {
    bv[current].webContents.loadURL(link);
    setTitleUrl(bv[current].webContents.getURL());
    /* const title = bv[current].webContents.executeJavaScript(`
      return document.title;
    `);
    const description = bv[current].webContents.executeJavaScript(`
     return document.getElementsByName('description')[0].content;
    `);
    const url = bv[current].webContents.executeJavaScript(`
      return location.href;
    `);
    const icon = bv[current].webContents.executeJavaScript(`
    for (let i = 0; i < document.head.getElementsByTagName('link').length; i++) {
      if (document.head.getElementsByTagName('link')[i].getAttribute('rel') === "shortcut icon") {
        let favicon_url = document.head.getElementsByTagName('link')[i].getAttribute('href');
        break;
      } else {
        let favicon_url = '';
        return favicon_url;
      }
    };
    return favicon_url;
    `);
    const writeObj = {
      pageTitle: title,
      pageDescription: description,
      pageUrl: url,
      pageIcon: icon
    };
    const history = JSON.parse(
      fs.readFileSync(
        `${directory}/data/history.mndata`,
        'utf-8'
      )
    );
    history.unshift(writeObj);
    fs.writeFileSync(
      `${directory}/data/history.mndata`,
      JSON.stringify(history)
    );*/
  } catch (e) {
    bv[current].webContents.loadURL(
      `file://${directory}/browser/server-notfound.html`
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
    `file://${directory}/browser/blank.html`
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
  const file = fs.readFileSync(`${app.getPath('userData')}/engines.mncfg`, 'utf-8');
  const obj = JSON.parse(file);
  const engineURL = obj.values[obj.engine];
  bv[index].webContents.loadURL(`${directory}/browser/home.html`);
  bv[index].webContents.on('did-stop-loading', () => {
    bv[index].webContents.executeJavaScript(`
      url = '${engineURL}';
    `);
  });
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
  win.webContents.executeJavaScript(`
    document.getElementsByTagName('title')[0].innerText = '${bv[i].webContents.getTitle()} - Monot';
  `);
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
ipcMain.handle('setting.searchEngine', (e, engine) => {
  const text = fs.readFileSync(
    `${app.getPath('userData')}/engines.mncfg`,
    'utf-8'
  );
  const obj = JSON.parse(text);
  obj.engine = engine;
  fs.writeFileSync(
    `${app.getPath('userData')}/engines.mncfg`,
    JSON.stringify(obj)
  );
});
ipcMain.handle('setting.changeExperimental', (e, change, to) => {
  const obj = JSON.parse(
    fs.readFileSync(
      `${app.getPath('userData')}/config.mncfg`,
      'utf-8'
    )
  );
  // { "experiments": { ${change}: ${to} } }
  obj.experiments[change] = to;
  fs.writeFileSync(
    `${app.getPath('userData')}/config.mncfg`,
    JSON.stringify(obj)
  );
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
