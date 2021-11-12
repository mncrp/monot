const {
  app,
  BrowserWindow,
  BrowserView,
  dialog,
  ipcMain,
  ipcRenderer,
  screen,
  Menu,
} = require("electron");
const contextMenu = require("electron-context-menu");
const fs = require("fs");
const path = require("path");
let win, setting;
var options;
var bv = [];
let viewY = 38;
var nowTab = 0;

contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: "戻る",
      click: () => {
        bv[0].webContents.goBack();
      },
    },
    {
      label: "進む",
      click: () => {
        bv[0].webContents.goForward();
      },
    },
    {
      label: "設定",
      click: () => {
        setting = new BrowserWindow({
          width: 760,
          height: 480,
          minWidth: 300,
          minHeight: 270,
          webPreferences: {
            preload: `${__dirname}/src/setting/preload.js`,
            scrollBounce: true,
          },
        });
        setting.loadFile(`${__dirname}/src/setting/index.html`);
      },
    },
  ],
});

/**
 *
 */
function nw() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: "#ffffff",
    title: "Monot by monochrome.",
    icon: `${__dirname}/src/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/src/script/preload.js`,
    },
  });
  win.loadFile(`${__dirname}/src/index.html`);
  bv[0] = new BrowserView({
    webPreferences: {
      scrollBounce: true,
      preload: `${__dirname}/src/script/preload-browserview.js`,
    },
  });
  let winSize = win.getSize();
  win.setBrowserView(bv[0]);
  bv[0].setBounds({
    x: 0,
    y: viewY,
    width: winSize[0],
    height: winSize[1] - viewY,
  });
  bv[0].setAutoResize({ width: true, height: true });
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/index.html`);
  bv[0].webContents
    .executeJavaScript(`document.addEventListener('contextmenu',()=>{
    node.context();
  })`);

  win.on("closed", () => {
    win = null;
  });
  win.on("maximize", () => {
    winSize = win.getContentSize();
    bv[0].setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 3,
    });
  });
  win.on("unmaximize", () => {
    winSize = win.getContentSize();
    bv[0].setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY,
    });
  });
  win.on("enter-full-screen", () => {
    winSize = win.getContentSize();
    bv[0].setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 1,
    });
  });

  bv[0].webContents.on("did-start-loading", () => {
    win.webContents.executeJavaScript(
      "document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loading')"
    );
    bv[0].webContents
      .executeJavaScript(`document.addEventListener('contextmenu',()=>{
      node.context();
    })`);
  });
  bv[0].webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(
      "document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loaded')"
    );
    if (
      bv[0].webContents
        .getURL()
        .substring(
          bv[0].webContents.getURL().indexOf("/") + 2,
          bv[0].webContents.getURL().length
        )
        .slice(0, 1) != "/"
    ) {
      win.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].value='${bv[0].webContents
          .getURL()
          .substring(
            bv[0].webContents.getURL().indexOf("/") + 2,
            bv[0].webContents.getURL().length
          )}'`
      );
    }
  });
  bv[0].webContents.on("did-stop-loading", () => {
    win.webContents.executeJavaScript(
      "document.getElementsByTagName('yomikomi-bar')[0].removeAttribute('id')"
    );

    //ifの条件が糞長いのが気になる。これはただただアドレスバーにURL出力してるだけ。
    if (
      bv[0].webContents
        .getURL()
        .substring(
          bv[0].webContents.getURL().indexOf("/") + 2,
          bv[0].webContents.getURL().length
        )
        .slice(0, 1) != "/"
    ) {
      win.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].value='${bv[0].webContents
          .getURL()
          .substring(
            bv[0].webContents.getURL().indexOf("/") + 2,
            bv[0].webContents.getURL().length
          )}'`
      );
    }

    //強制ダークモード(Force-Dark)
    if (
      JSON.parse(
        fs.readFileSync(`${__dirname}/src/config/config.mncfg`, "utf-8")
      ).experiments.forceDark == true
    ) {
      bv[0].webContents.insertCSS(`
        body,body>*{
          background-color: #202020!important;
        }
        *{
          color: #bbb!important;
        }
        a{
          color: #7aa7cd!important;
        }`);
    }
  });

  bv[0].webContents.on("page-title-updated", (e, t) => {
    win.webContents.executeJavaScript(`
      document.getElementsByTagName('title')[0].innerText='${t} - Monot';
    `);
  });
}

app.on("ready", nw);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (win === null) nw();
});

//ipc channels
ipcMain.on("moveView", (e, link) => {
  bv[0].webContents
    .executeJavaScript(`document.addEventListener('contextmenu',()=>{
    node.context();
  })`);
  bv[0].webContents.insertCSS("*{-webkit-app-region: none;}");
  if (link == "") {
    return true;
  } else {
    bv[0].webContents
      .loadURL(link)
      .then(() => {
        win.webContents.executeJavaScript(
          `document.getElementsByTagName('input')[0].value='${bv[0].webContents
            .getURL()
            .substring(
              bv[0].webContents.getURL().indexOf("/") + 2,
              bv[0].webContents.getURL().length
            )}'`
        );
      })
      .catch(() => {
        bv[0].webContents
          .loadURL(`file://${__dirname}/src/resource/server-notfound.html`)
          .then(() => {
            bv[0].webContents
              .executeJavaScript(`document.getElementsByTagName('span')[0].innerText='${link.toLowerCase()}';
          var requiredUrl='${link}';
        `);
          });
        console.log(
          "The previous error is normal. It redirected to a page where the server couldn't be found."
        );
      });
  }
});
ipcMain.on("windowClose", () => {
  win.close();
});
ipcMain.on("windowMaximize", () => {
  win.maximize();
});
ipcMain.on("windowMinimize", () => {
  win.minimize();
});
ipcMain.on("windowUnmaximize", () => {
  win.unmaximize();
});
ipcMain.on("windowMaxMin", () => {
  if (win.isMaximized() == true) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.on("moveViewBlank", () => {
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/blank.html`);
});
ipcMain.on("reloadBrowser", () => {
  bv[0].webContents.reload();
});
ipcMain.on("browserBack", () => {
  bv[0].webContents.goBack();
  if (
    bv[0].webContents
      .getURL()
      .substring(
        bv[0].webContents.getURL().indexOf("/") + 2,
        bv[0].webContents.getURL().length
      )
      .slice(0, 1) != "/"
  ) {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('input')[0].value='${bv[0].webContents
        .getURL()
        .substring(
          bv[0].webContents.getURL().indexOf("/") + 2,
          bv[0].webContents.getURL().length
        )}'`
    );
  }
});
ipcMain.on("browserGoes", () => {
  bv[0].webContents.goForward();
});
ipcMain.on("getBrowserUrl", () => {
  console.log(bv[0].webContents.getURL());
  return bv[0].webContents.getURL();
});
ipcMain.on("context", () => {
  menu.popup();
});
ipcMain.on("dark", () => {});
/*
ipcMain.on('options',()=>{
  if(options===null){
    options=new BrowserWindow({
      width: 400, height: 750,
      resizable: false,
      webPreferences: {
        preload: `${__dirname}/src/script/option.js`
      }
    })
    options.loadFile(`${__dirname}/src/options.html`);

    options.on('closed',()=>{
      options=null;
    })
  }
})
ipcMain.on('wallpaperFileOpen',()=>{
  let d=dialog.showOpenDialogSync(setting,{
    title: '壁紙を選択してください',
    filters: [
      {name: 'Images', extensions: ['png','jpeg','jpg','webp']}
    ]
  })
  let file=JSON.parse(fs.readFileSync(`${__dirname}/src/config/background.mncfg`));
  file.background=`url('${d}')`;
  fs.writeFileSync(`${__dirname}/src/config/background.mncfg`,JSON.stringify(file));
})*/

let menu = Menu.buildFromTemplate([
  {
    label: "表示",
    submenu: [
      {
        type: "separator",
      },
      {
        role: "togglefullscreen",
        accelerator: "F11",
        label: "全画面表示",
      },
      {
        role: "hide",
        label: "隠す",
      },
      {
        role: "hideothers",
        label: "他を隠す",
      },
      {
        role: "reload",
        label: "navの再表示",
        accelerator: "CmdOrCtrl+Alt+R",
      },
      {
        label: "終了",
        role: "quit",
        accelerator: "CmdOrCtrl+Q",
      },
    ],
  },
  {
    label: "移動",
    submenu: [
      {
        label: "再読み込み",
        accelerator: "CmdOrCtrl+R",
        click: () => {
          bv[0].webContents.reload();
        },
      },
      {
        label: "戻る",
        accelerator: "CmdOrCtrl+Alt+Z",
        click: () => {
          bv[0].webContents.goBack();
        },
      },
      {
        label: "進む",
        accelerator: "CmdOrCtrl+Alt+X",
        click: () => {
          bv[0].webContents.goForward();
        },
      },
    ],
  },
  {
    label: "編集",
    submenu: [
      {
        label: "カット",
        role: "cut",
      },
      {
        label: "コピー",
        role: "copy",
      },
      {
        label: "ペースト",
        role: "paste",
      },
    ],
  },
  {
    label: "ウィンドウ",
    submenu: [
      {
        label: "Monotについて",
        accelerator: "CmdOrCtrl+Alt+A",
        click: () => {
          dialog.showMessageBox(null, {
            type: "info",
            icon: "./src/image/logo.png",
            title: "Monotについて",
            message: "Monot 1.0.0 Beta 5について",
            detail: `Monot by monochrome. v.1.0.0 Beta 5 (Build 5)
バージョン: 1.0.0 Beta 5
ビルド番号: 5
開発者: Sorakime

リポジトリ: https://github.com/Sorakime/monot
公式サイト: https://sorakime.github.io/mncr/project/monot/

Copyright 2021 Sorakime.`,
          });
        },
      },
      {
        label: "設定",
        accelerator: "CmdOrCtrl+Alt+S",
        click: () => {
          setting = new BrowserWindow({
            width: 760,
            height: 480,
            minWidth: 300,
            minHeight: 270,
            webPreferences: {
              preload: `${__dirname}/src/setting/preload.js`,
              scrollBounce: true,
            },
          });
          setting.loadFile(`${__dirname}/src/setting/index.html`);
        },
      },
    ],
  },
  {
    label: "開発",
    submenu: [
      {
        label: "開発者向けツール",
        accelerator: "F12",
        click: () => {
          bv[0].webContents.toggleDevTools();
        },
      },
      {
        label: "Monotの開発者向けツール",
        accelerator: "Alt+F12",
        click: () => {
          win.webContents.toggleDevTools();
        },
      },
    ],
  },
]);
Menu.setApplicationMenu(menu);
