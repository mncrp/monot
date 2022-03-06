// require
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
} = require('electron');

// letiables
let win, windowSize, menu, context;
let currentTab = 0;
const isMac = process.platform === 'darwin';
const directory = `${__dirname}/..`;
const bv = [];
const viewY = 67;

// config setting
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const monotConfig = new LowLevelConfig('config.mncfg').copyFileIfNeeded(`${directory}/default/config/config.mncfg`);
const enginesConfig = new LowLevelConfig('engines.mncfg').copyFileIfNeeded(`${directory}/default/config/engines.mncfg`);

// creating new tab function
function newtab() {
  // create new tab
  const {Tab} = require('./tab');
  const browserview = new Tab();
  currentTab = bv.length;
  windowSize = win.getSize();

  bv.push(browserview);
  win.addBrowserView(bv[bv.length - 1].entity);

  bv[bv.length - 1].entity.setBounds({
    x: 0,
    y: viewY,
    width: windowSize[0],
    height: windowSize[1] - viewY
  });
  bv[bv.length - 1].entity.setAutoResize({
    width: true,
    height: true
  });

  browserview.load(
    `file://${directory}/browser/home.html`
  );
}

function nw() {
  // create window
  monotConfig.update();
  win = new BrowserWindow({
    width: monotConfig.#get('width'),
    height: monotConfig.#get('height'),
    minWidth: 400,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#efefef',
    title: 'Monot by monochrome.',
    icon: `${directory}/image/logo.png`,
    webPreferences: {
      preload: `${directory}/preload/navigation.js`
    }
  });
  win.setBackgroundColor('#efefef');
  win.loadFile(
    process.platform === 'darwin' ?
      `${directory}/renderer/navigation/navigation-mac.html` :
      `${directory}/renderer/navigation/navigation.html`
  );

  const contextMenu = require('electron-context-menu');
  contextMenu({
    prepend: () => [
      {
        label: '戻る',
        click: () => {
          bv[currentTab].entity.webContents.goBack();
        }
      },
      {
        label: '進む',
        click: () => {
          bv[currentTab].entity.webContents.goForward();
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

  function getEngine() {
    enginesConfig.update();
    const selectEngine = enginesConfig.#get('engine');
    return enginesConfig.#get(`values.${selectEngine}`);
  }

  // window's behavior
  win.on('closed', () => {
    win = null;
  });
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      engine = '${getEngine()}';
    `);
  });

}

app.on('ready', () => {
  nw();
  // ipc channels
  ipcMain.handle('moveView', (e, link, ind) => {
    const current = ind;
    bv[current].entity.webContents.executeJavaScript(`
      document.addEventListener('contextmenu',()=>{
        node.context();
      })
    `);
    if (link === '') {
      return;
    }

    try {
      bv[current].load(link);
      /* const title = bv[current].webContent.getTitle();
      const description = bv[current].entity.webContents.executeJavaScript(`
      return document.getElementsByName('description')[0].content;
      `);
      const url = bv[current].entity.webContents.executeJavaScript(`
        return location.href;
      `);
      const icon = bv[current].entity.webContents.executeJavaScript(`
      for (let i = 0; i < document.head.getElementsByTagName('link').length; i++) {
        if (document.head.getElementsByTagName('link')[i].getAttribute('rel') === 'shortcut icon') {
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
      bv[current].load(
        `file://${directory}/browser/server-notfound.html`
      );
      bv[current].entity.webContents.executeJavaScript(`
        document.getElementsByTagName('span')[0].innerText='${link.toLowerCase()}';
      `);
    }
  });
  ipcMain.handle('windowClose', () => {
    windowSize = win.getSize();
    monotConfig.update()
      .set('width', windowSize[0])
      .set('height', windowSize[1])
      .save();
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
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.handle('windowMaxMinMac', () => {
    win.fullScreen ? win.fullScreen = false : win.fullScreen = true;
  });
  ipcMain.handle('moveViewBlank', (e, index) => {
    bv[index].load(
      `file://${directory}/browser/blank.html`
    );
  });
  ipcMain.handle('reloadBrowser', (e, index) => {
    bv[index].entity.webContents.reload();
  });
  ipcMain.handle('browserBack', (e, index) => {
    bv[index].entity.webContents.goBack();

  });
  ipcMain.handle('browserGoes', (e, index) => {
    bv[index].entity.webContents.goForward();
  });
  ipcMain.handle('getBrowserUrl', (e, index) => {
    return bv[index].entity.webContents.getURL();
  });
  ipcMain.handle('moveToNewTab', (e, index) => {
    enginesConfig.update();
    const selectEngine = enginesConfig.#get('engine');
    const engineURL = enginesConfig.#get(`values.${selectEngine}`);

    win.webContents.executeJavaScript(`
      document.getElementsByTagName('title')[0].innerText = 'Monot by monochrome.';
    `);

    bv[index].load(`file://${directory}/browser/home.html`);

    // search engine
    bv[index].entity.webContents.on('did-stop-loading', () => {
      bv[index].entity.webContents.executeJavaScript(`
        url = '${engineURL}';
      `);
    });
  });
  ipcMain.handle('context', () => {
    context.popup();
  });
  ipcMain.handle('newtab', () => {
    newtab();
  });
  ipcMain.handle('tabMove', (e, i) => {
    if (bv[i] === null) {
      newtab();
      return;
    }
    if (i < 0)
      i = 0;

    if (bv[i] !== undefined) {
      bv[i].setTop();
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText = '${bv[i].entity.webContents.getTitle()} - Monot';
      `);
    } else {
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText = 'Monot by monochrome.';
      `);
    }
    currentTab = i;
  });
  ipcMain.handle('removeTab', (e, i) => {
    // source: https://www.gesource.jp/weblog/?p=4112
    if (i < 0 || !(i instanceof Number))
      i = 0;
    win.removeBrowserView(bv[i].entity);
    bv[i].entity.webContents.destroy();
    bv[i] = null;
    bv.splice(i, 1);
    const {Tab} = require('./tab');
    if (bv[i] !== null && bv[i] instanceof Tab) {
      console.log(bv[i] instanceof Tab);
      bv[i].setTop();
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText = '${bv[i].entity.webContents.getTitle()} - Monot';
      `);
    }
  });
  ipcMain.handle('setting.searchEngine', (e, engine) => {
    enginesConfig.update()
      .set('engine', engine)
      .save();
    win.webContents.executeJavaScript(`
      engine = ${enginesConfig.#get(`values.${engine}`)};
    `);
  });
  ipcMain.handle('setting.changeExperimental', (e, change, to) => {
    // { "experiments": { ${change}: ${to} } }
    monotConfig.update()
      .set(`experiments.${change}`, to, true)
      .save();
  });

  // create tab
  newtab();

});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
app.on('activate', () => {
  if (win === null)
    nw();
});

function showSetting() {
  const setting = new BrowserWindow({
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
  monotConfig.update();
  enginesConfig.update();
  setting.loadFile(`${directory}/renderer/setting/index.html`);

  setting.webContents.executeJavaScript(`
    document.querySelector('option[value="${enginesConfig.#get('engine')}"]');
  `);

  // Apply of changes
  const experiments = monotConfig.#get('experiments');

  if (experiments.forceDark === true) {
    setting.webContents.executeJavaScript(`
      document.querySelectorAll('input[type="checkbox"]')[0]
        .checked = true;
    `);
  }
  if (experiments.fontChange === true) {
    setting.webContents.executeJavaScript(`
      document.querySelectorAll('input[type="checkbox"]')[1]
        .checked = true;
    `);
    if (experiments.changedfont !== '') {
      setting.webContents.executeJavaScript(`
        document.querySelectorAll('input[type="text"]')[0]
          .value = ${experiments.changedfont};
      `);
    }
  }
  if (experiments.adBlock === true) {
    setting.webContents.executeJavaScript(`
      document.querySelectorAll('input[type="checkbox"]')[2]
        .checked = true;
    `);
  }
}

// context menu
const menuTemplate = [
  {
    label: '表示',
    submenu: [
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
        label: '終了',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          monotConfig.update()
            .set('width', windowSize[0])
            .set('height', windowSize[1])
            .save();
          app.quit();
        }
      }
    ]
  },
  {
    label: '移動',
    id: 'move',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          bv[currentTab].reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          bv[currentTab].goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          bv[currentTab].goForward();
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
      },
      {
        label: '全て選択',
        role: 'selectAll'
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
            message: 'Monot 1.0.0 Official Versionについて',
            detail: `Monot by monochrome. v.1.0.0 Official Version (Build 7)
バージョン: 1.0.0 Official Version
ビルド番号: 7
開発者: monochrome Project.

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot/

Copyright 2021 monochrome Project.`
          });
        }
      },
      {
        label: '設定',
        accelerator: 'CmdOrCtrl+Alt+S',
        click: () => {
          showSetting();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '新しいタブ',
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          newtab();
          win.webContents.executeJavaScript(`
            newtab('Home')
          `);
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
          bv[currentTab].entity.webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false,
        click: () => {
          bv[currentTab].entity.webContents.toggleDevTools();
        }
      }
    ]
  }
];
const menuTemplateMac = [
  {
    label: 'Monot',
    submenu: [
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
        label: '終了',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          monotConfig.update()
            .set('width', windowSize[0])
            .set('height', windowSize[1])
            .save();
          app.quit();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Monotについて',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: () => {
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo.png',
            title: 'Monotについて',
            message: 'Monot 1.0.0 Official Versionについて',
            detail: `Monot by monochrome. v.1.0.0 Official Version (Build 7)
バージョン: 1.0.0 Official Version
ビルド番号: 7
開発者: monochrome Project.

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot/

Copyright 2021 monochrome Project.`
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
    label: '移動',
    id: 'move',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          bv[currentTab].reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          bv[currentTab].goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          bv[currentTab].goForward();
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
      },
      {
        label: '全て選択',
        role: 'selectAll'
      }
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {
        label: '新しいタブ',
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          newtab();
          win.webContents.executeJavaScript(`
            newtab('Home')
          `);
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
          bv[currentTab].entity.webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false,
        click: () => {
          bv[currentTab].entity.webContents.toggleDevTools();
        }
      }
    ]
  },
  {
    label: 'ヘルプ',
    submenu: [
      {
        label: '公式サイト',
        click: () => {
          if (bv[currentTab] !== null) {
            bv[currentTab].load('https://sorakime.github.io/mncr/project/monot');
          }
        }
      }
    ]
  }
];

if (!isMac) {
  menu = Menu.buildFromTemplate(menuTemplate);
  context = menu;
} else if (isMac) {
  menu = Menu.buildFromTemplate(menuTemplateMac);
}

Menu.setApplicationMenu(menu);
