// require
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  BrowserView,
  MenuItem,
  webContents
} = require('electron');

const {
  TabManager,
  ViewY
} = require('./tab');

// letiables
let win, windowSize, context;
const isMac = process.platform === 'darwin';
const directory = `${__dirname}/..`;
const {History} = require(`${directory}/proprietary/lib/history`);
const history = new History();
const tabs = new TabManager();
const viewY = new ViewY();

const aboutContent = {
  type: 'info',
  icon: isMac ? './src/image/logo-mac.png' : './src/image/logo.png',
  title: 'Monotについて',
  message: 'Monotについて',
  detail: `Monot by monochrome. v.1.1.0 (Build 8)
バージョン: 1.1.0
ビルド番号: 8
開発元: monochrome Project.

リポジトリ: https://github.com/mncrp/monot
公式サイト: https://mncrp.github.io/project/monot/

Copyright ©︎ 2021-2022 monochrome Project.`
};

// config setting
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const bookmark = new LowLevelConfig(
  'bookmark.mndata'
).copyFileIfNeeded(
  `${directory}/default/data/bookmark.mndata`
);
const monotConfig = new LowLevelConfig(
  'config.mncfg'
).copyFileIfNeeded(
  `${directory}/default/config/config.mncfg`
);
const enginesConfig = new LowLevelConfig(
  'engines.mncfg'
).copyFileIfNeeded(
  `${directory}/default/config/engines.mncfg`
);

// コンテキストメニューのやつマジでどうしてもSorakimeさんの環境だと動かないのでなくなく作ったのがこの関数
function newtab() {
  tabs.newTab(win);
  tabs.get().entity.webContents.on('context-menu', (e, params) => {
    const selection = params.selectionText;
    if (selection !== '') {
      context.closePopup();
      enginesConfig.update();
      context.insert(0, new MenuItem({
        label: `${selection}を調べる`,
        id: 'search',
        click: () => {
          const selectEngine = enginesConfig.get('engine');
          const engineURL = enginesConfig.get(`values.${selectEngine}`, true);
          tabs.get().load(`${engineURL}${selection}`);
        }
      }));
    }
    if (params.mediaType === 'image' && params.srcURL !== '') {
      context.closePopup();
      context.insert(0, new MenuItem({
        label: `選択した画像を開く`,
        id: 'openImage',
        click: () => {
          tabs.get().load(params.srcURL);
        }
      }));
      context.insert(0, new MenuItem({
        label: `選択した画像をコピー`,
        id: 'saveImage',
        click: () => {
          webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
        }
      }));
    }
    console.dirxml(params);
    context.popup();
    context = Menu.buildFromTemplate(contextTemplate);
  });
}

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
    monotConfig.update();
    if (monotConfig.get('cssTheme') !== '') {
      const style = monotConfig.get('cssTheme');
      win.webContents.executeJavaScript(`
      document.head.innerHTML += '<link rel="stylesheet" href="${style}">'
    `);
    }
  });
  win.on('ready-to-show', () => {
    win.show();
  });
  if (monotConfig.update().get('ui') === 'thin') {
    win.webContents.executeJavaScript(`
      document.body.classList.add('thin');
    `);
  }
  win.webContents.insertCSS(`
  :root {
    --wallpaper: url('file://${monotConfig.get('wallpaper')}')!important;
  }
`);

  // create tab
  newtab();
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
    frame: false,
    webPreferences: {
      preload: `${directory}/preload/option.js`,
      nodeIntegrationInSubFrames: true
    }
  });
  optionView.webContents.loadURL(`file://${directory}/renderer/menu/index.html`);
  monotConfig.update();
  if (monotConfig.get('cssTheme') != null) {
    const style = monotConfig.get('cssTheme');
    optionView.webContents.insertCSS(style);
  }

  const suggest = new BrowserView({
    transparent: true,
    frame: false,
    webPreferences: {
      preload: `${directory}/preload/suggest.js`
    }
  });
  suggest.webContents.loadURL(`file://${directory}/renderer/suggest/index.html`);

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
    win.isFullScreen() ? win.fullScreen = false : win.fullScreen = true;
  });
  ipcMain.handle('moveViewBlank', (e, index) => {
    tabs.get(index).load(
      `file://${directory}/browser/blank.html`
    );
  });
  ipcMain.handle('reloadBrowser', (e, index) => {
    tabs.get(index).reload();
  });
  ipcMain.handle('browserBack', (e, index) => {
    tabs.get(index).goBack();
  });
  ipcMain.handle('browserGoes', (e, index) => {
    tabs.get(index).goForward();
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
    newtab();
  });
  ipcMain.handle('tabSwitch', (e, index) => {
    tabs.setCurrent(win, index);
  });
  ipcMain.handle('tabMove', (e, target, destination) => {
    tabs.move(win, target, destination);
  });
  ipcMain.handle('removeTab', (e, index) => {
    try {
      tabs.removeTab(win, index);
    } catch (e) {
      if (tabs.length() === 0) {
        windowClose();
      }
    }
  });
  ipcMain.handle('popupNavigationMenu', () => {
    navigationContextMenu.popup();
  });
  ipcMain.handle('setting.searchEngine', (e, engine) => {
    enginesConfig.update()
      .set('engine', engine)
      .save();
    win.webContents.executeJavaScript(`
      engine = '${enginesConfig.get(`values.${engine}`, true)}';
    `);
    tabs.get().entity.webContents.executeJavaScript(`
      url = '${enginesConfig.get(`values.${engine}`, true)}';
    `);
  });
  ipcMain.handle('setting.changeExperimental', (e, change, to) => {
    // { "experiments": { ${change}: ${to} } }
    monotConfig.update()
      .set(`experiments.${change}`, to, true)
      .save();
  });
  ipcMain.handle('setting.deleteHistory', () => {
    history.deleteAll();
  });
  ipcMain.handle('setting.resetTheme', () => {
    monotConfig.update()
      .set('cssTheme', '')
      .save();
  });
  ipcMain.handle('setting.changeUI', (e, ui) => {
    monotConfig.update()
      .set('ui', ui)
      .save();

    switch (ui) {
    case 'default':
      viewY.toDefault();
      tabs.get().replace();
      tabs.tabs.forEach((i) => {
        i.replace();
      });
      break;
    case 'thin':
      viewY.toThin();
      tabs.get().replace();
      tabs.tabs.forEach((i) => {
        i.replace();
      });
    }
  });
  ipcMain.handle('addHistory', (e, data) => {
    const fileURL = new URL(`file://${directory}/browser/home.html`);
    if (data.pageUrl !== fileURL.href) history.set(data);
  });
  ipcMain.handle('settings.view', () => {
    showSetting();
  });
  ipcMain.handle('viewHistory', () => {
    showHistory();
  });
  ipcMain.handle('updateHistory', () => {
    const histories = history.getAll();
    let html = '';
    // eslint-disable-next-line
    for (const [key, value] of Object.entries(histories)) {
      html = `
        ${html}
        <div onclick="node.open('${value.pageUrl}');">
          <div class="history-favicon" style="background-image: url('${value.pageIcon}');"></div>
          <div class="history-details">
            <p>${value.pageTitle}</p>
          </div>
        </div>
      `;
    }
    optionView.webContents.send('updatedHistory', html);
  });
  ipcMain.handle('openPage', (e, url) => {
    try {
      tabs.get().load(url);
    } catch (e) {
      console.log('ウィンドウやタブがないため開けませんでした');
    }
  });
  ipcMain.handle('addABookmark', () => {
    tabs.get().entity.webContents.send('addBookmark');
  });
  ipcMain.handle('addBookmark', (e, data) => {
    bookmark.update();
    // eslint-disable-next-line
    for (const [key, value] of Object.entries(bookmark.data)) {
      if (value.pageUrl === data.pageUrl) return;
    }
    bookmark.data.unshift(data);
    bookmark.save();
  });
  ipcMain.handle('updateBookmark', () => {
    bookmark.update();
    const bookmarks = bookmark.data;
    let html = '';
    // eslint-disable-next-line
    for (const [key, value] of Object.entries(bookmarks)) {
      html = `
        ${html}
        <div onclick="node.open('${value.pageUrl}');">
          <div class="bookmark-favicon" style="background-image: url('${value.pageIcon}');"></div>
          <div class="bookmark-details">
            <p id="title">${value.pageTitle}</p>
            <p id="remove"><a href="#" onclick="node.removeBookmark(${key});">削除</a></p>
          </div>
        </div>
      `;
    }
    optionView.webContents.send('updatedBookmark', html);
  });
  ipcMain.handle('viewBookmark', () => {
    showBookmark();
  });
  ipcMain.handle('removeBookmark', (e, key) => {
    bookmark.update();
    bookmark.data[key] = null;
    bookmark.data.splice(key, 1);
    bookmark.save();
  });
  ipcMain.handle('zoom', () => {
    tabs.get().entity.webContents.send('zoom');
  });
  ipcMain.handle('shrink', () => {
    tabs.get().entity.webContents.send('shrink');
  });
  ipcMain.handle('actual', () => {
    tabs.get().entity.webContents.send('actual');
  });
  ipcMain.handle('fullscreen', () => {
    if (isMac)
      win.isFullScreen() ? win.fullScreen = false : win.fullScreen = true;
    else
      win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.handle('hide', () => {
    win.hide();
  });
  ipcMain.handle('about', () => {
    dialog.showMessageBox(null, aboutContent);
  });
  ipcMain.handle('devTools', () => {
    tabs.get().entity.webContents.toggleDevTools();
  });
  ipcMain.handle('suggest.send', (e, word) => {
    try {
      const url = new URL(`http://api.bing.com/qsonhs.aspx?mkt=ja-JP&q=${word}`);
      const req = require('https').request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
      }, res => {
        let data = '';
        res.on('data', (d) => {
          try {
            data = JSON.parse(d.toString());
          } catch (e) {
            console.error(e);
          }
        });
        console.log(word);
        res.on('end', () => {
          let html = ``;
          try {
            try {
              Object.entries(data.AS.Results)[1][1].Suggests.forEach((data) => {
                html += `
                  <div onclick="node.moveBrowser('${data.Txt}');">${data.Txt}</div>
                `;
              });
            } catch (e) {
              Object.entries(data.AS.Results)[0][1].Suggests.forEach((data) => {
                html += `
                  <div onclick="node.moveBrowser('${data.Txt}');">${data.Txt}</div>
                `;
              });
            }

            win.addBrowserView(suggest);
            win.setTopBrowserView(suggest);

            suggest.webContents.executeJavaScript(`
              document.getElementsByTagName('main')[0].innerHTML = \`${html}\`;
            `);
          } catch (e) {
            win.removeBrowserView(suggest);
            console.error(e);
          }
        });
      });
      req.on('error', err => {
        console.log(err);
      });
      req.end();
    } catch (e) {
      console.error(e);
    }
    win.addBrowserView(suggest);
    suggest.setBounds({
      x: 150,
      y: 70,
      width: win.getSize()[0] - 300,
      height: 400
    });
    suggest.setAutoResize({
      x: true,
      y: true,
      width: true,
      height: true
    });
  });
  ipcMain.handle('suggest.searchBrowser', (e, txt) => {
    enginesConfig.update();
    const engine = enginesConfig.get(`values.${enginesConfig.get('engine')}`, true);
    tabs.get().load(`${engine}${txt}`);
    win.removeBrowserView(suggest);
  });
  ipcMain.handle('suggest.close', () => {
    win.removeBrowserView(suggest);
  });
  ipcMain.handle('suggest.down', () => {
    suggest.webContents.executeJavaScript(`
      select(1);
    `);
  });
  ipcMain.handle('suggest.up', () => {
    suggest.webContents.toggleDevTools();
    suggest.webContents.executeJavaScript(`
      select(-1);
    `);
  });
  ipcMain.handle('suggest.select', () => {
    suggest.webContents.executeJavaScript(`
      document.getElementById('selected').click();
    `);
  });

  nw();
  ipcMain.handle('options', () => {
    if (BrowserWindow.fromBrowserView(optionView)) {
      win.removeBrowserView(optionView);
    } else {
      win.addBrowserView(optionView);
      optionView.setBounds({
        x: win.getSize()[0] - 260,
        y: 30,
        width: 250,
        height: 450
      });
      win.on('resize', () => {
        optionView.setBounds({
          x: win.getSize()[0] - 260,
          y: 30,
          width: 250,
          height: 450
        });
      });
      optionView.webContents.executeJavaScript(`
        document.head.innerHTML += '<link rel="stylesheet" href="${monotConfig.get('cssTheme')}">';
      `);
      win.setTopBrowserView(optionView);
    }
  });
  ipcMain.handle('setting.resetWallpaper', () => {
    monotConfig.update()
      .set('wallpaper', '')
      .save();
    win.webContents.insertCSS(`
      :root {
        --wallpaper: none!important;
      }
    `);
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

  // Apply of changes
  const experiments = monotConfig.get('experiments');

  setting.webContents.executeJavaScript(`
    document.getElementsByTagName('select')[0].value = '${enginesConfig.get('engine')}';
    ui('${monotConfig.get('ui')}');
    document.head.innerHTML += '<link rel="stylesheet" href="${monotConfig.get('cssTheme')}">';;
  `);

  if (monotConfig.get('wallpaper') !== '') {
    setting.webContents.send('updateWallpaper', (monotConfig.get('wallpaper')));
  }

  if (monotConfig.get('cssTheme') !== '') {
    setting.webContents.send('updateTheme', (monotConfig.get('cssTheme')));
  }

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

  ipcMain.removeHandler('setting.openThemeDialog');
  ipcMain.handle('setting.openThemeDialog', () => {
    const fileDialog = dialog.showOpenDialog(
      setting,
      {
        title: 'CSSテーマを選択',
        properties: [
          'openFile'
        ],
        filters: [
          {
            name: 'CSS',
            extensions: ['css']
          }
        ]
      }
    );
    fileDialog.then((path) => {
      monotConfig.update()
        .set('cssTheme', path.filePaths[0])
        .save();
      if (path.filePaths[0] !== '')
        setting.webContents.send('updateTheme', (monotConfig.get('cssTheme')));
    });
  });
  ipcMain.removeHandler('setting.openWallpaperDialog');
  ipcMain.handle('setting.openWallpaperDialog', () => {
    const fileDialog = dialog.showOpenDialog(
      setting,
      {
        title: '壁紙を選択',
        properties: [
          'openFile'
        ],
        filters: [
          {
            name: '画像',
            extensions: ['png', 'jpg', 'jpeg']
          }
        ]
      }
    );
    fileDialog.then((path) => {
      monotConfig.update()
        .set('wallpaper', path.filePaths[0])
        .save();
      if (path.filePaths[0] !== '') {
        setting.webContents.send('updateWallpaper', (monotConfig.get('wallpaper')));
        win.webContents.insertCSS(`
          :root {
            --wallpaper: url('file://${monotConfig.get('wallpaper')}')!important;
          }
        `);
      }
    });
  });
}
function showHistory() {
  const historyWin = new BrowserWindow({
    width: 760,
    height: 480,
    minWidth: 300,
    minHeight: 270,
    icon: `${directory}/image/logo.ico`,
    webPreferences: {
      preload: `${directory}/preload/history.js`,
      scrollBounce: true
    }
  });
  historyWin.webContents.loadFile(`${directory}/renderer/history/index.html`);
  // objectからHTMLに変換
  const histories = history.getAll();
  let html = '';
  // eslint-disable-next-line
  for (const [key, value] of Object.entries(histories)) {
    html = `
      ${html}
      <div onclick="node.open('${value.pageUrl}');">
        <div class="history-favicon" style="background-image: url('${value.pageIcon}');"></div>
        <div class="history-details">
          <p>${value.pageTitle}</p>
        </div>
      </div>
    `;
  }
  historyWin.webContents.executeJavaScript(`
    document.getElementById('histories').innerHTML = \`${html}\`;
    document.head.innerHTML += '<link rel="stylesheet" href="${monotConfig.get('cssTheme')}">';;
  `);
}
function showBookmark() {
  const bookmarkWin = new BrowserWindow({
    width: 760,
    height: 480,
    minWidth: 300,
    minHeight: 270,
    icon: `${directory}/image/logo.ico`,
    webPreferences: {
      preload: `${directory}/preload/bookmark.js`,
      scrollBounce: true
    }
  });
  bookmarkWin.webContents.loadFile(`${directory}/renderer/bookmark/index.html`);
  bookmark.update();
  // objectからHTMLに変換
  const bookmarks = bookmark.data;
  let html = '';
  // eslint-disable-next-line
  for (const [key, value] of Object.entries(bookmarks)) {
    html = `
      ${html}
      <div onclick="node.open('${value.pageUrl}');">
        <div class="bookmark-favicon" style="background-image: url('${value.pageIcon}');"></div>
        <div class="bookmark-details">
          <p>${value.pageTitle}</p>
          <p><a href="javascript:node.removeBookmark(${key});">削除</a></p>
        </div>
      </div>
    `;
  }
  bookmarkWin.webContents.executeJavaScript(`
    document.getElementById('bookmarks').innerHTML = \`${html}\`;
    document.head.innerHTML += '<link rel="stylesheet" href="${monotConfig.get('cssTheme')}">';;
  `);
}

// menu
// navigation-bar context menu
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
    type: 'separator'
  },
  {
    label: '新規タブ',
    click: () => {
      newtab();
    }
  },
  {
    type: 'separator'
  },
  {
    label: '設定',
    click: () => {
      showSetting();
    }
  },
  {
    label: '履歴',
    click: () => {
      showHistory();
    }
  },
  {
    label: 'ブックマーク',
    click: () => {
      showBookmark();
    }
  }
]);
// Menu
const menuTemplate = [
  {
    label: 'Monot',
    submenu: [
      {
        label: 'Monotについて',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: () => {
          dialog.showMessageBox(null, aboutContent);
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
          try {
            newtab();
          } catch (e) {
            nw();
          }
        }
      },
      {
        label: '設定',
        accelerator: 'CmdOrCtrl+,',
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
        accelerator: 'CmdOrCtrl+Option+I',
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
            tabs.get().load('https://mncrp.github.io/project/monot/');
          }
        }
      },
      {
        label: 'ドキュメント',
        click: () => {
          if (tabs.get() !== null) {
            tabs.get().load('https://mncrp.github.io/document/monot/');
          }
        }
      }
    ]
  }
];
// context
const contextTemplate = [
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
    label: '再読み込み',
    click: () => {
      tabs.get().reload();
    }
  },
  {
    type: 'separator'
  },
  {
    label: '縮小',
    click: () => {
      tabs.get().entity.webContents.setZoomLevel(
        tabs.get().entity.webContents.getZoomLevel() - 1
      );
    }
  },
  {
    label: '実際のサイズ',
    click: () => {
      tabs.get().entity.webContents.setZoomLevel(
        1
      );
    }
  },
  {
    label: '拡大',
    click: () => {
      tabs.get().entity.webContents.setZoomLevel(
        tabs.get().entity.webContents.getZoomLevel() + 1
      );
    }
  },
  {
    type: 'separator'
  },
  {
    label: '開発者向けツール',
    click: () => {
      tabs.get().entity.webContents.toggleDevTools();
    }
  },
  {
    label: 'ソースコードを表示',
    click: () => {
      tabs.get().load(`view-source:${tabs.get().entity.webContents.getURL()}`);
    }
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
context = Menu.buildFromTemplate(contextTemplate);

Menu.setApplicationMenu(menu);
