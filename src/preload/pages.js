const {webFrame, contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;

webFrame.executeJavaScript(`
  // context menu
  document.addEventListener('contextmenu', () => {
    node.context();
  });

  // history
  window.onload = () => {
    const getFavicon = function(){
      let favicon = '';
      try {
        favicon = document.querySelector('link[rel="shortcut icon"]').href;
      } catch(e) {
        favicon = document.querySelector('meta[property="og:image"]').content;
      }
      return favicon;
    }();
    
    node.addHistory(
      document.head.getElementsByTagName('title')[0].innerText,
      location.href,
      getFavicon
    );
  }
`);

webFrame.setZoomFactor(1);

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
  addHistory: (title, url, icon) => {
    console.log(title);
    console.log(url);
    console.log(icon);
  }
});
