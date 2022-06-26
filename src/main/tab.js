const {
  BrowserWindow,
  BrowserView,
  app,
  nativeTheme
} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;
let viewY = 66;
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);
const monotConfig = new LowLevelConfig('config.mncfg').copyFileIfNeeded(`${directory}/default/config/config.mncfg`);
const enginesConfig = new LowLevelConfig('engines.mncfg').copyFileIfNeeded(`${directory}/default/config/engines.mncfg`);
const bookmark = new LowLevelConfig('bookmark.mndata').copyFileIfNeeded(`${directory}/default/data/bookmark.mndata`);
let windowSize;
if (monotConfig.update().get('ui') === 'thin') viewY = 28;

class ViewY {
  constructor() {
    this.type = monotConfig.update().get('ui');
  }

  get() {
    return viewY;
  }

  getHtmlClass() {
    let value;
    switch (this.type) {
    case 'thin': value = 'thin'; break;
    case 'default': value = ''; break;
    }
    return value;
  }

  toThin() {
    viewY = 28;
    monotConfig
      .update()
      .set('ui', 'thin')
      .save();
    this.type = 'thin';
    return 28;
  }

  toDefault() {
    viewY = 66;
    monotConfig
      .update()
      .set('ui', 'default')
      .save();
    this.type = 'default';
    return 66;
  }
}

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
    this.tabs[index].setWindowTitle();
    this.current = index;
    this.tabs[index].setTitleUrl();
    this.tabs[index].replace();
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

  newTab(win, context, shouldMoveCurrent = true, url) {
    const tab = new Tab(win, context, url);
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

    win.webContents.executeJavaScript(`
      document.getElementsByTagName('div')[0].innerHTML += '<span><p>Home</p><p></p></span>';
      each();
    `);

    // events
    // did-fail-load
    browserView.webContents.on('did-fail-load', (e, errCode) => {
      if (errCode !== -105) return;
      this.load(
        `file://${directory}/browser/server-notfound.html`
      );
      browserView.webContents.executeJavaScript(`
        document.getElementsByTagName('span')[0].innerText='${browserView.webContents.getURL().toLowerCase()}';
      `);
    });
    // dom-ready
    browserView.webContents.on('dom-ready', () => {
      win.webContents.executeJavaScript(`
      document.getElementsByTagName('yomikomi-bar')[0].setAttribute(
        'id',
        'loaded'
      );
    `);

      browserView.webContents.setVisualZoomLevelLimits(1, 20);
      browserView.webContents.setZoomFactor(1);

      this.url = new URL(browserView.webContents.getURL());
      // 新タブと同じURLなのかどうか
      const fileURL = new URL(`file://${directory}/browser/home.html`);

      if (this.url.href === fileURL.href) {
        enginesConfig.update();
        const selectEngine = enginesConfig.get('engine');
        const engineURL = enginesConfig.get(`values.${selectEngine}`, true);
        const bookmarks = bookmark.update().data;
        let html = '';
        let i = 0;
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(bookmarks)) {
          if (i < 7)
            i += 1;
          else
            return;

          html = `
            ${html}
            <div class="one-bookmark" onclick="location.href = '${value.pageUrl}';">
              <div class="one-image" style="background-image: url('${value.pageIcon}');"></div>
              <p class="one-title">${value.pageTitle}</p>
            </div>
          `;
        }
        browserView.webContents.executeJavaScript(`
          url = '${engineURL}';
          document.getElementById('bookmarks-content').innerHTML = \`${html}\`;
        `);
      }

      // オプション機能系
      monotConfig.update();
      if (monotConfig.get('cssTheme') !== '') {
        const style = monotConfig.get('cssTheme');
        browserView.webContents.executeJavaScript(`
          document.head.innerHTML += '<link rel="stylesheet" href="${style}">'
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
            font-family: '${experiments.changedfont}','Noto Sans JP'!important;
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
      if (!nativeTheme.shouldUseDarkColors) {
        browserView.setBackgroundColor('#efefef');
      } else {
        browserView.setBackgroundColor('#222');
      }
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
    win.on('resize', () => {
      windowSize = win.getSize();
      browserView.setBounds({
        x: 0,
        y: viewY,
        width: windowSize[0],
        height: windowSize[1] - viewY
      });
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
    const srcPath = new URL(`file://${__dirname}/../browser/`);

    switch (`${url.protocol}//${url.pathname}`) {
    case `${srcPath}home.html`:
      return win.webContents.executeJavaScript(`
        document.getElementsByTagName('input')[0].value = '';
      `);
    case `${srcPath}server-notfound.html`:
    case `${srcPath}blank.html`:
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
      document.getElementsByTagName('span')[${win.getBrowserViews().indexOf(this.entity)}]
        .getElementsByTagName('p')[0]
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
    this.entity.webContents.stop();
    this.entity.webContents.goBack();
  }

  goForward() {
    this.entity.webContents.goForward();
  }

  reload() {
    if (this.entity.webContents.isLoading() === true) return;
    this.entity.webContents.reload();
  }

  replace() {
    const win = BrowserWindow.fromBrowserView(this.entity);
    const windowSize = win.getSize();
    this.entity.setBounds({
      x: 0,
      y: viewY,
      width: windowSize[0],
      height: windowSize[1] - viewY
    });
    win.webContents.executeJavaScript(`
      if (document.body.classList.contains('mac'))
        document.body.className = 'mac ${new ViewY().getHtmlClass()}';
      else
        document.body.className = '${new ViewY().getHtmlClass()}';
    `);
  }
}

module.exports = {
  Tab,
  TabManager,
  ViewY
};
