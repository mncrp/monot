const {
  BrowserWindow,
  BrowserView,
  app
} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;
const viewY = 66;
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const monotConfig = new LowLevelConfig('config.mncfg').copyFileIfNeeded(`${directory}/default/config/config.mncfg`);
const enginesConfig = new LowLevelConfig('engines.mncfg').copyFileIfNeeded(`${directory}/default/config/engines.mncfg`);
let windowSize;

class TabManager {
  constructor() {
    this.tabs = [];
    this.current = 0;
  }

  setCurrent(win, index) {
    win.webContents.executeJavaScript(`
      document.getElementById('opened')?.removeAttribute('id');
      document.querySelectorAll('div>span')[${index}].setAttribute('id', 'opened');
    `);

    win.setTopBrowserView(this.tabs[index].entity);
    this.tabs[index].entity.setBackgroundColor('#efefef');
    this.tabs[index].setWindowTitle();
    this.current = index;
  }

  push(win, data) {
    this.tabs.push(data);
  }

  length() {
    return this.tabs.length;
  }

  get(index = this.current) {
    return this.tabs[index];
  }

  removeTab(win, index = this.current) {
    win.removeBrowserView(this.tabs[index].entity);
    this.tabs[index].entity.webContents.destroy();
    this.tabs[index] = null;
    this.tabs.splice(index, 1);

    if (index >= this.tabs.length) {
      index -= 1;
    }

    this.setCurrent(win, index);
  }

  newTab(win, shouldMoveCurrent = true, url) {
    const tab = new Tab(win, url);
    this.push(win, tab);
    if (shouldMoveCurrent) {
      this.setCurrent(win, this.length() - 1);
    }
  }
}

class Tab {
  constructor(win, url = new URL(`file://${directory}/browser/home.html`)) {

    if (!(url instanceof URL)) {
      url = new URL(url);
    }
    this.url = url;
    this.faviconUrl;

    const browserView = new BrowserView({
      backgroundColor: '#efefef',
      webPreferences: {
        scrollBounce: true,
        nodeIntegrationInSubFrames: true,
        preload: `${directory}/preload/pages.js`
      }
    });
    browserView.webContents.session.setDownloadPath(app.getPath('downloads'));
    browserView.webContents.setVisualZoomLevelLimits(1, 5);

    // events
    // did-fail-load
    browserView.webContents.on('did-fail-load', () => {
      this.load(
        `file://${directory}/browser/server-notfound.html`
      );
      browserView.webContents.executeJavaScript(`
        document.getElementsByTagName('span')[0].innerText='${browserView.webContents.getURL().toLowerCase()}';
      `);
    });
    // dom-ready
    browserView.webContents.on('dom-ready', () => {
      browserView.webContents.setVisualZoomLevelLimits(1, 5);

      this.url = new URL(browserView.webContents.getURL());
      // 新タブと同じURLなのかどうか
      const fileURL = new URL(`file://${directory}/browser/home.html`);
      if (this.url.href === fileURL.href) {
        enginesConfig.update();
        const selectEngine = enginesConfig.get('engine');
        const engineURL = enginesConfig.get(`values.${selectEngine}`, true);
        browserView.webContents.executeJavaScript(`
          url = '${engineURL}';
        `);
      }
      const experiments = monotConfig.update().get('experiments');
      // Force-Dark
      if (experiments.forceDark === true) {
        browserView.webContents.insertCSS(
          fs.readFileSync(
            `${directory}/proprietary/style/forcedark.css`,
            'utf-8'
          )
        );
      }
      // fontChange
      if (experiments.fontChange === true) {
        browserView.webContents.insertCSS(`
          body, body > *, * {
            font-family: ${experiments.changedfont},'Noto Sans JP'!important;
          }
        `);
      }
    });
    // did-start-loading
    // こいつらはタイミング指定しているのでpreloadにしない
    browserView.webContents.on('did-start-loading', () => {
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0].setAttribute(
          'id',
          'loading'
        );
      `);
    });
    // did-finish-load
    browserView.webContents.on('did-finish-load', () => {
      browserView.setBackgroundColor('#efefef');
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0].setAttribute(
          'id',
          'loaded'
        );
      `);
      this.setTabTitle();
      this.setWindowTitle();
    });
    // did-stop-loading
    browserView.webContents.on('did-stop-loading', () => {
      // changes the progress
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('yomikomi-bar')[0]
          .removeAttribute('id');
      `);
      this.setTitleUrl();
    });
    // when the page title is updated (update the window title and tab title) config.mncfg
    browserView.webContents.on('page-title-updated', () => {
      this.setTabTitle();
      this.setWindowTitle();
    });
    // resize
    win.on('resize', () => {
      windowSize = win.getContentSize();
      browserView.setBounds({
        x: 0,
        y: viewY,
        width: windowSize[0],
        height: windowSize[1] - viewY
      });
    });

    // last init
    win.addBrowserView(browserView);
    browserView.webContents.setZoomLevel(1);

    windowSize = win.getSize();
    browserView.setBounds({
      x: 0,
      y: viewY,
      width: windowSize[0],
      height: windowSize[1] - viewY
    });
    browserView.setAutoResize({
      width: true,
      height: true
    });

    this.entity = browserView;
    this.load(url.href);
  }

  load(url = new URL(`file://${directory}/browser/home.html`)) {
    if (!(url instanceof URL)) {
      url = new URL(url);
    }
    this.entity.webContents.loadURL(url.href);
  }

  // This function sets URL to the URL bar of the title bar.
  setTitleUrl() {
    const url = this.url;
    // If the URL is Monot build-in HTML, the URL is not set in the URL bar.
    // It gets win variable from myself not to make bugs.
    const win = BrowserWindow.fromBrowserView(this.entity);
    const srcPath = new URL(`file://${__dirname}/../`);

    switch (url.href) {
    case `${srcPath}browser/home.html`:
      return win.webContents.executeJavaScript(`
        document.getElementsByTagName('input')[0].value = '';
      `);
    case `${srcPath}browser/server-notfound.html`:
    case `${srcPath}browser/blank.html`:
      return Promise.resolve();
    }

    // Set URL in the URL bar.
    return win.webContents.executeJavaScript(`
      document.getElementsByTagName('input')[0].value =
        '${url.host}${url.pathname}${url.search}${url.hash}';
    `);
  }

  // set tab's title.
  setTabTitle() {
    const win = BrowserWindow.fromBrowserView(this.entity);
    win.webContents.executeJavaScript(`
      document.getElementById('opened')
        .getElementsByTagName('a')[0]
        .innerText='${this.entity.webContents.getTitle()}';
    `);
  }

  // set window's title.
  setWindowTitle() {
    const win = BrowserWindow.fromBrowserView(this.entity);
    const srcPath = new URL(`file://${__dirname}/../`);
    if (this.url.href === `${srcPath}browser/home.html`) {
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText = 'Monot by monochrome.';
      `);
    } else {
      win.webContents.executeJavaScript(`
        document.getElementsByTagName('title')[0].innerText = '${this.entity.webContents.getTitle()} - Monot';
      `);
    }
  }

  goBack() {
    this.entity.webContents.goBack();
  }

  goForward() {
    this.entity.webContents.goForward();
  }

  reload() {
    this.entity.webContents.reload();
  }
}

module.exports = {
  Tab,
  TabManager
};
