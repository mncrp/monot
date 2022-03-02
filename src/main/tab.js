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
  }

  setTop() {
    const win = BrowserWindow.fromBrowserView(this.entity);
    win.setTopBrowserView(this.entity);
    this.entity.setBackgroundColor('#efefef');
  }

  goBack() {
    this.entity.webContents.goBack();
    this.href = this.entity.webContents.getURL();
  }

  goForward() {
    this.entity.webContents.goForward();
    this.href = this.entity.webContents.getURL();
  }

  reload() {
    this.entity.reload();
  }
}

module.exports = {
  Tab
};
