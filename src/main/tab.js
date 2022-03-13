const {
  BrowserWindow,
  BrowserView,
  Menu
} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;
const viewY = 66;
const adBlockCode = fs.readFileSync(
  `${directory}/proprietary/experimental/adBlock.js`,
  'utf-8'
);
const isMac = process.platform === 'darwin';
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const monotConfig = new LowLevelConfig('config.mncfg').copyFileIfNeeded(`${directory}/default/config/config.mncfg`);
const enginesConfig = new LowLevelConfig('engines.mncfg').copyFileIfNeeded(`${directory}/default/config/engines.mncfg`);
let windowSize;

class Tab {
  constructor(
    url = new URL(`file://${directory}/browser/index.html`)
  ) {
    this.href = url;

    if (!(url instanceof URL)) {
      url = new URL(url);
    }
    const browserview = new BrowserView({
      backgroundColor: '#efefef',
      webPreferences: {
        scrollBounce: true,
        preload: `${directory}/preload/pages.js`
      }
    });
    browserview.webContents.setVisualZoomLevelLimits(1, 1);
    browserview.webContents.setZoomLevel(1);

    console.log(browserview.webContents.getZoomFactor());

    // events
    browserview.webContents.on('did-fail-load', () => {
      this.load(
        `file://${directory}/browser/server-notfound.html`
      );
      browserview.webContents.executeJavaScript(`
        document.getElementsByTagName('span')[0].innerText='${browserview.webContents.getURL().toLowerCase()}';
      `);
    });

    if (isMac) {
      const {ipcMain} = require('electron');
      const contextMenu = [
        {
          label: '戻る',
          click: () => {
            this.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            this.goForward();
          }
        },
        {
          label: '再読み込み',
          click: () => {
            this.reload();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '縮小',
          click: () => {
            this.entity.webContents.setZoomLevel(
              this.entity.webContents.getZoomLevel() - 1
            );
          }
        },
        {
          label: '実際のサイズ',
          click: () => {
            this.entity.webContents.setZoomLevel(
              1
            );
          }
        },
        {
          label: '拡大',
          click: () => {
            this.entity.webContents.setZoomLevel(
              this.entity.webContents.getZoomLevel() + 1
            );
          }
        },
        {
          label: '開発者向けツール',
          click: () => {
            this.entity.webContents.toggleDevTools();
          }
        }
      ];

      const context = Menu.buildFromTemplate(contextMenu);
      ipcMain.removeHandler('context');
      ipcMain.handle('context', () => {
        context.popup();
      });
      browserview.webContents.on('context-menu', (e, params) => {
        console.log(e);
      });
    }

    this.entity = browserview;
  }

  load(url = `file://${directory}/browser/index.html`) {
    this.entity.webContents.loadURL(url);
    this.href = url;
    const win = BrowserWindow.fromBrowserView(this.entity);

    this.entity.webContents.on('dom-ready', () => {
      this.entity.webContents.setVisualZoomLevelLimits(1, 5);
      // proprietary stylesheet
      this.entity.webContents.insertCSS(
        fs.readFileSync(
          `${directory}/proprietary/style/ua.css`,
          'utf-8'
        )
      );
      const browserURL = new URL(this.href);
      const fileURL = new URL(`file://${directory}/browser/home.html`);
      this.href = this.entity.webContents.getURL();
      if (browserURL.href === fileURL.href) {
        enginesConfig.update();
        const selectEngine = enginesConfig.get('engine');
        const engineURL = enginesConfig.get(`values.${selectEngine}`, true);
        this.entity.webContents.executeJavaScript(`
          url = '${engineURL}';
        `);
      }
      const experiments = monotConfig.update().get('experiments');
      // Force-Dark
      if (experiments.forceDark === true) {
        this.entity.webContents.insertCSS(
          fs.readFileSync(
            `${directory}/proprietary/style/forcedark.css`,
            'utf-8'
          )
        );
      }
      // fontChange
      if (experiments.fontChange === true) {
        this.entity.webContents.insertCSS(`
          body,body>*, *{
            font-family: ${experiments.changedfont},'Noto Sans JP'!important;
          }
        `);
      }
      // AD Block
      if (experiments.adBlock === true) {
        this.entity.webContents.executeJavaScript(adBlockCode);
      }
    });
    this.entity.webContents.on('did-start-loading', () => {
      this.entity.webContents.executeJavaScript(`
        document.addEventListener('contextmenu',()=>{
          node.context();
        })
      `);
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0]
          .setAttribute('id','loading');
      `);
    });
    this.entity.webContents.on('did-finish-load', () => {
      this.entity.setBackgroundColor('#efefef');
      this.entity.webContents.executeJavaScript(`
        document.addEventListener('contextmenu',()=>{
          node.context();
        })
      `);
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loaded')
        document.getElementsByTagName('title')[0].innerText='${this.entity.webContents.getTitle()} - Monot';
        document.getElementById('opened')
          .getElementsByTagName('a')[0]
          .innerText='${this.entity.webContents.getTitle()}';
      `);
    });
    this.entity.webContents.on('did-stop-loading', () => {
      // changes the progress
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0]
          .removeAttribute('id');
      `);
      this.setTitleUrl();
    });
    // when the page title is updated (update the window title and tab title) config.mncfg
    this.entity.webContents.on('page-title-updated', (e, t) => {
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText='${t} - Monot';
        document.getElementsByTagName('span')[getCurrent()].getElementsByTagName('a')[0].innerText='${t}';
      `);
    });
    win.on('resize', () => {
      windowSize = win.getContentSize();
      this.entity.setBounds({
        x: 0,
        y: viewY,
        width: windowSize[0],
        height: windowSize[1] - viewY
      });
    });

    // BrowserWindow.fromBrowserView(this.entity));
    this.setTitleUrl();
  }

  // This function sets URL to the URL bar of the title bar.
  setTitleUrl() {
    const url = new URL(this.href);
    // If the URL is Monot build-in HTML, the URL is not set in the URL bar.
    const win = BrowserWindow.fromBrowserView(this.entity);
    const resourceIndex = new URL(`file://${__dirname}/`);
    const partOfUrl = url.href.substring(0, resourceIndex.href.length - 5);
    const partOfResourceIndex = resourceIndex.href.substring(0, resourceIndex.href.length - 5);
    const isSame = partOfUrl === partOfResourceIndex;
    if (url.href === `${partOfResourceIndex}browser/home.html`) {
      return win.webContents.executeJavaScript(`
        document.getElementsByTagName('input')[0].value='';
      `);
    } else if (isSame) {
      return Promise.resolve();
    }

    // Set URL in the URL bar.
    return win.webContents.executeJavaScript(`
      document.getElementsByTagName('input')[0].value='${url.host}${url.pathname}${url.search}${url.hash}';
    `);
  }

  setTop() {
    const win = BrowserWindow.fromBrowserView(this.entity);
    win.setTopBrowserView(this.entity);
    this.entity.setBackgroundColor('#efefef');
  }

  goBack() {
    this.entity.webContents.goBack();
    this.href = this.entity.webContents.getURL();
    this.setTitleUrl();
  }

  goForward() {
    this.entity.webContents.goForward();
    this.href = this.entity.webContents.getURL();
    this.setTitleUrl();
  }

  reload() {
    this.entity.webContents.reload();
  }
}

module.exports = {
  Tab
};
