const {
  Menu,
  dialog,
  app,
} = require('electron');

const global = require('./global');

const aboutContent = {
  type: 'info',
  icon: process.platform === 'darwin' ? './src/image/logo-mac.png' : './src/image/logo.png',
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

const navigationContextMenuTemplate = [
  {
    label: '戻る',
    click: () => {
      global.tabs.get().goBack();
    }
  },
  {
    label: '進む',
    click: () => {
      global.tabs.get().goForward();
    }
  },
  {
    type: 'separator'
  },
  {
    label: '新規タブ',
    click: () => {
      global.tabs.newTab();
    }
  },
  {
    type: 'separator'
  },
  {
    label: '設定',
    click: () => {
      global.showSetting();
    }
  },
  {
    label: '履歴',
    click: () => {
      global.showHistory();
    }
  },
  {
    label: 'ブックマーク',
    click: () => {
      global.showBookmark();
    }
  }
];
global.navigationContextMenu = Menu.buildFromTemplate(navigationContextMenuTemplate);
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
        label: '設定',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          global.showSetting();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'hideothers',
        label: '他を隠す'
      },
      {
        label: 'Monot を終了',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          global.windowClose();
          app.quit();
        }
      }
    ]
  },
  {
    label: 'ファイル',
    submenu: [
      {
        label: '新しいタブ',
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          global.tabs.newTab();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'タブを閉じる',
        accelerator: 'CmdOrCtrl+W',
        click: () => {
          global.tabs.removeTab();
        }
      },
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
          global.tabs.get().reload();
        }
      },
      {
        label: '戻る',
        accelerator: 'Alt+Left',
        click: () => {
          global.tabs.get().goBack();
        }
      },
      {
        label: '進む',
        accelerator: 'Alt+Right',
        click: () => {
          global.tabs.get().goForward();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '拡大',
        accelerator: 'CmdOrCtrl+^',
        click: () => {
          global.tabs.get().entity.webContents.send('zoom');
        }
      },
      {
        label: '縮小',
        accelerator: 'CmdOrCtrl+-',
        click: () => {
          global.tabs.get().entity.webContents.send('shrink');
        }
      },
      {
        label: '等倍',
        accelerator: 'CmdOrCtrl+0',
        click: () => {
          global.tabs.get().entity.webContents.send('actual');
        }
      },
      {
        label: '拡大',
        accelerator: 'CmdOrCtrl+Shift+Plus',
        visible: false,
        click: () => {
          global.tabs.get().entity.webContents.send('zoom');
        }
      }
    ]
  },
  {
    label: '編集',
    submenu: [
      {
        label: '取り消す',
        role: 'redo'
      },
      {
        label: 'やり直す',
        role: 'undo'
      },
      {
        type: 'separator'
      },
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
        label: '削除',
        role: 'delete'
      },
      {
        type: 'separator'
      },
      {
        label: '全て選択',
        role: 'selectAll'
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
          global.tabs.get().entity.webContents.toggleDevTools();
        }
      },
      {
        label: '開発者向けツール',
        accelerator: 'CmdOrCtrl+Option+I',
        visible: false,
        click: () => {
          global.tabs.get().entity.webContents.toggleDevTools();
        }
      }
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {
        role: 'hide',
        label: '隠す'
      },
      {
        role: 'togglefullscreen',
        accelerator: 'F11',
        label: '全画面表示'
      }
    ]
  },
  {
    label: 'ヘルプ',
    submenu: [
      {
        label: '公式サイト',
        click: () => {
          if (global.tabs.get() !== null) {
            global.tabs.get().load('https://mncrp.github.io/project/monot/');
          }
        }
      },
      {
        label: 'ドキュメント',
        click: () => {
          if (global.tabs.get() !== null) {
            global.tabs.get().load('https://mncrp.github.io/document/monot/');
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
      global.tabs.get().goBack();
    }
  },
  {
    label: '進む',
    click: () => {
      global.tabs.get().goForward();
    }
  },
  {
    label: '再読み込み',
    click: () => {
      global.tabs.get().reload();
    }
  },
  {
    type: 'separator'
  },
  {
    label: '縮小',
    click: () => {
      global.tabs.get().entity.webContents.setZoomLevel(
        global.tabs.get().entity.webContents.getZoomLevel() - 1
      );
    }
  },
  {
    label: '実際のサイズ',
    click: () => {
      global.tabs.get().entity.webContents.setZoomLevel(
        1
      );
    }
  },
  {
    label: '拡大',
    click: () => {
      global.tabs.get().entity.webContents.setZoomLevel(
        global.tabs.get().entity.webContents.getZoomLevel() + 1
      );
    }
  },
  {
    type: 'separator'
  },
  {
    label: '開発者向けツール',
    click: () => {
      global.tabs.get().entity.webContents.toggleDevTools();
    }
  },
  {
    label: 'ソースコードを表示',
    click: () => {
      global.tabs.newTab(true, `view-source:${global.tabs.get().entity.webContents.getURL()}`);
    }
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
global.context = Menu.buildFromTemplate(contextTemplate);

Menu.setApplicationMenu(menu);

module.exports = {
  aboutContent,
  contextTemplate,
  navigationContextMenuTemplate
};
