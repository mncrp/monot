// require
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  BrowserView,
} = require('electron');

const {
  Tab,
  TabManager
} = require('./tab');

// letiables
let win, windowSize, menu, context;
const isMac = process.platform === 'darwin';
const directory = `${__dirname}/..`;
const tabs = new TabManager();
const viewY = 66;
const navigationContextMenu = Menu.buildFromTemplate([
  {
    label: '戻る',
    click: () => {
      tabs.get().goBack();
    }
  },
  {
    label: '進む',
    click: () => {
      tabs.get().goForward();
    }
  },
  {
    label: '設定',
    click: () => {
      showSetting();
    }
  }
]);

// config setting
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const monotConfig = new LowLevelConfig('config.mncfg').copyFileIfNeeded(`${directory}/default/config/config.mncfg`);
const enginesConfig = new LowLevelConfig('engines.mncfg').copyFileIfNeeded(`${directory}/default/config/engines.mncfg`);

function nw() {
  // create window
  monotConfig.update();
  win = new BrowserWindow({
    width: monotConfig.get('width'),
    height: monotConfig.get('height'),
    minWidth: 400,
    minHeight: 400,
    show: false,
    frame: false,
    transparent: false,
    backgroundColor: '#efefef',
    title: 'Monot by monochrome.',
    icon: isMac ? `${directory}/image/logo.icns` : `${directory}/image/logo.png`,
    webPreferences: {
      preload: `${directory}/preload/navigation.js`
    }
  });
  win.webContents.openDevTools();
  win.setBackgroundColor('#efefef');
  win.loadFile(
    process.platform === 'darwin' ?
      `${directory}/renderer/navigation/navigation-mac.html` :
      `${directory}/renderer/navigation/navigation.html`
  );

  function getEngine() {
    enginesConfig.update();
    const selectEngine = enginesConfig.get('engine');
    return enginesConfig.get(`values.${selectEngine}`, true);
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
  win.on('ready-to-show', () => {
    win.show();
  });

  // create tab
  tabs.newTab(win);
}

function windowClose() {
  windowSize = win.getSize();
  monotConfig.update()
    .set('width', windowSize[0])
    .set('height', windowSize[1])
    .save();
  win.close();
}

app.on('ready', () => {
  const optionView = new BrowserView({
    transparent: true,
    frame: false
  });
  optionView.webContents.loadURL(`file://${directory}/renderer/menu/index.html`);

  // ipc channels
  ipcMain.handle('moveView', (e, link, index) => {
    tabs.get(index).load(link);
  });
  ipcMain.handle('windowClose', () => {
    windowClose();
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
    tabs.get(index).load(
      `file://${directory}/browser/blank.html`
    );
  });
  ipcMain.handle('reloadBrowser', (e, index) => {
    tabs.get(index).entity.webContents.reload();
  });
  ipcMain.handle('browserBack', (e, index) => {
    tabs.get(index).entity.webContents.goBack();
  });
  ipcMain.handle('browserGoes', (e, index) => {
    tabs.get(index).entity.webContents.goForward();
  });
  ipcMain.handle('getBrowserUrl', (e, index) => {
    return tabs.get(index).entity.webContents.getURL();
  });
  ipcMain.handle('moveToNewTab', (e, index) => {
    tabs.get(index).load(`file://${directory}/browser/home.html`);
  });
  ipcMain.handle('context', () => {
    context.popup();
  });
  ipcMain.handle('newtab', () => {
    tabs.newTab(win);
  });
  ipcMain.handle('tabMove', (e, index) => {
    tabs.setCurrent(win, index);
  });
  ipcMain.handle('removeTab', (e, index) => {
    tabs.removeTab(win, index);
  });
  ipcMain.handle('popupNavigationMenu', () => {
    navigationContextMenu.popup();
  });
  ipcMain.handle('setting.searchEngine', (e, engine) => {
    enginesConfig.update()
      .set('engine', engine)
      .save();
    win.webContents.executeJavaScript(`
      engine = ${enginesConfig.get(`values.${engine}`, true)};
    `);
  });
  ipcMain.handle('setting.changeExperimental', (e, change, to) => {
    // { "experiments": { ${change}: ${to} } }
    monotConfig.update()
      .set(`experiments.${change}`, to, true)
      .save();
  });

  nw();

  ipcMain.handle('options', () => {
    if (BrowserWindow.fromBrowserView(optionView)) {
      win.removeBrowserView(optionView);
    } else {
      win.addBrowserView(optionView);
      optionView.setBounds({
        x: win.getSize()[0] - 320,
        y: viewY - 35,
        width: 300,
        height: 500
      });
      win.on('resize', () => {
        optionView.setBounds({
          x: win.getSize()[0] - 320,
          y: viewY - 35,
          width: 300,
          height: 500
        });
      });
      win.setTopBrowserView(optionView);
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
app.on('activate', () => {
  if (win === null) nw();
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
    document.querySelector('option[value="${enginesConfig.get('engine')}"]');
  `);

  // Apply of changes
  const experiments = monotConfig.get('experiments');

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
          windowClose();
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
          tabs.get().reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          tabs.get().goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          tabs.get().goForward();
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
          tabs.get().entity.webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false,
        click: () => {
          tabs.get().entity.webContents.toggleDevTools();
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
        label: 'Monotについて',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: () => {
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo-mac.png',
            title: 'Monotについて',
            message: 'Monotについて',
            detail: `Monot by monochrome. v.1.0.0 Official Version (Build 7)
バージョン: 1.0.0 Official Version
ビルド番号: 7
開発元: monochrome Project.

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot/

Copyright 2021-2022 monochrome Project.`
          });
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
        label: '終了',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          windowClose();
          app.quit();
        }
      }
    ]
  },
  {
    label: '表示',
    id: 'view',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          tabs.get().reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          tabs.get().goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          tabs.get().goForward();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '拡大',
        accelerator: 'CmdOrCtrl+^',
        click: () => {
          tabs.get().entity.webContents.send('zoom');
        }
      },
      {
        label: '縮小',
        accelerator: 'CmdOrCtrl+-',
        click: () => {
          tabs.get().entity.webContents.send('shrink');
        }
      },
      {
        label: '等倍',
        accelerator: 'CmdOrCtrl+0',
        click: () => {
          tabs.get().entity.webContents.send('actual');
        }
      },
      {
        label: '拡大',
        accelerator: 'CmdOrCtrl+Shift+Plus',
        visible: false,
        click: () => {
          tabs.get().entity.webContents.send('zoom');
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
          win.webContents.executeJavaScript(`
            newtab('Home')
          `);
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
          tabs.get().entity.webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false,
        click: () => {
          tabs.get().entity.webContents.toggleDevTools();
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
          if (tabs.get() !== null) {
            tabs.get().load('https://sorakime.github.io/mncr/project/monot');
          }
        }
      }
    ]
  }
];

if (isMac) {
  menu = Menu.buildFromTemplate(menuTemplateMac);
} else {
  menu = Menu.buildFromTemplate(menuTemplate);
  context = menu;
}

Menu.setApplicationMenu(menu);
