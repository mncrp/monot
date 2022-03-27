const {webFrame, contextBridge, ipcRenderer} = require('electron');
const fs = require('fs');
const directory = `${__dirname}/..`;

webFrame.executeJavaScript(`
  document.addEventListener('contextmenu', () => {
    node.context();
  });
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
  }
});
