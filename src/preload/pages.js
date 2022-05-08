const {webFrame, contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;

webFrame.setZoomFactor(1);

webFrame.executeJavaScript(`
  // context menu
  document.addEventListener('contextmenu', () => {
    node.context();
  });
`);

console.log(webFrame);
if (webFrame.parent === null) {
  webFrame.executeJavaScript(`
    // history
    window.onload = () => {
      const description = function(){
        let description = '';
        try {
          description = document.querySelector('meta[name="description" i]').content;
        } catch(e) {
          try {
            description = document.querySelector('meta[property="og:description" i]').content;
          } catch(e) {}
        }
        return description;
      }();
      const favicon = function(){
        let favicon = '';
        try {
          favicon = document.querySelector('link[rel="shortcut icon" i]').href;
        } catch(e) {
          try {
            favicon = document.querySelector('meta[property="og:image" i]').content;
          } catch(e) {}
        }
        return favicon;
      }();
      
      node.addHistory(
        ${webFrame.routingId},
        document.head.getElementsByTagName('title')[0].innerText,
        description,
        location.href,
        favicon
      );
    }
  `);
}

webFrame.insertCSS(
  fs.readFileSync(
    `${directory}/proprietary/style/ua.css`,
    'utf-8'
  )
);

// 拡大
ipcRenderer.on('zoom', () => {
  webFrame.setZoomFactor(
    webFrame.getZoomFactor() + 0.05
  );
});
// 縮小
ipcRenderer.on('shrink', () => {
  webFrame.setZoomFactor(
    webFrame.getZoomFactor() - 0.05
  );
});
// 等倍
ipcRenderer.on('actual', () => {
  webFrame.setZoomFactor(1);
});

contextBridge.exposeInMainWorld('node', {
  context: (text) => {
    ipcRenderer.invoke('context', text);
  },
  addHistory: (routingId, title, description, url, icon) => {
    if (routingId === webFrame.routingId) {
      // 最高
      ipcRenderer.invoke('addHistory', {
        pageTitle: title,
        pageDescription: description,
        pageUrl: url,
        pageIcon: icon
      });
    }
  }
});
