const {BrowserView, BrowserWindow} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;

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

    // events
    browserview.webContents.on('did-fail-load', () => {
      browserview.webContents.loadURL(
        `file://${directory}/browser/server-notfound.html`
      );
      browserview.webContents.executeJavaScript(
        `document.getElementsByTagName('span')[0].innerText='${browserview.webContents.getURL().toLowerCase()}';`
      );
    });
    browserview.webContents.on('dom-ready', () => {

    });
    this.entity = browserview;
  }

  load(url = `file://${directory}/browser/index.html`) {
    this.entity.webContents.loadURL(url);
    this.href = url;

    // proprietary stylesheet
    this.entity.webContents.insertCSS(
      fs.readFileSync(
        `${directory}/proprietary/style/ua.css`,
        'utf-8'
      )
    );
    // BrowserWindow.fromBrowserView(this.entity));
    this.setTitleUrl(url);
  }

  // This function sets URL to the URL bar of the title bar.
  setTitleUrl(url = this.entity.webContents.getURL()) {
    url = new URL(url);
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
    this.entity.reload();
  }
}

module.exports = {
  Tab
};
