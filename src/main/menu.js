const {
  Menu,
  dialog,
  app,
} = require('electron');

const global = require('./global');

const isMac = process.platform === 'darwin';

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

Copyright ©︎ 2021 monochrome Project.`
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
        label: 'ほかを非表示'
      },
      {
        role: 'hide',
        label: 'Monot を非表示'
      },
      {
        type: 'separator'
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
      {
        label: 'ウィンドウを閉じる',
        accelerator: 'CmdOrCtrl+Shift+W',
        click: () => {
          global.windowClose();
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
        role: 'pasteAndMatchStyle',
        label: 'ペーストしてスタイルを合わせる'
      },
      {
        label: '削除',
        role: 'delete'
      },
      {
        label: '全て選択',
        role: 'selectAll'
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
      },
      {
        role: 'toggleFullScreen',
        label: 'フルスクリーンを切り替える'
      },
      {
        type: 'separator'
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
            label: 'ページのソースを表示',
            accelerator: 'CmdOrCtrl+Alt+U',
            click: () => {
              global.tabs.newTab(true, `view-source:${global.tabs.get().entity.webContents.getURL()}`);
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
      }
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {
        label: 'しまう',
        role: 'minimize'
      },
      {
        label: '拡大/縮小',
        click: () => {
          if (isMac)
            global.win.isFullScreen() ? global.win.fullScreen = false : global.win.fullScreen = true;
          else
            global.win.isMaximized() ? global.win.unmaximize() : global.win.maximize();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'タブの固定/解除',
        accelerator: 'CmdOrCtrl+Shift+F',
        click: () => {
          if (global.win !== null) {
            global.win.webContents.executeJavaScript(`
              document.getElementsByTagName('span')[${global.tabs.current}].classList.toggle('fixed');
            `);
          }
        }
      },
      {
        label: '1タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+1',
        click: () => {
          global.tabs.setCurrent(0);
        }
      },
      {
        label: '2タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+2',
        click: () => {
          try {
            global.tabs.setCurrent(1);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '3タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+3',
        click: () => {
          try {
            global.tabs.setCurrent(2);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '4タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+4',
        click: () => {
          try {
            global.tabs.setCurrent(3);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '5タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+5',
        click: () => {
          try {
            global.tabs.setCurrent(4);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '6タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+6',
        click: () => {
          try {
            global.tabs.setCurrent(5);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '7タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+7',
        click: () => {
          try {
            global.tabs.setCurrent(6);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '8タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+8',
        click: () => {
          try {
            global.tabs.setCurrent(7);
          } catch (e) {
            return;
          }
        }
      },
      {
        label: '9タブ',
        visible: false,
        accelerator: 'CmdOrCtrl+9',
        click: () => {
          try {
            global.tabs.setCurrent(8);
          } catch (e) {
            return;
          }
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
  menu,
  menuTemplate,
  contextTemplate,
  navigationContextMenuTemplate
};
