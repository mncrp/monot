const {BrowserView, BrowserWindow} = require('electron');
const directory = `${__dirname}/..`;

class Tab {
  constructor(
    url = new URL(`file://${directory}/browser/index.html`)
  ) {

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
    // BrowserWindow.fromBrowserView(this.entity));
  }
}

module.exports = {
  Tab
};
