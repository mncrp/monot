const {webFrame, contextBridge, ipcRenderer} = require('electron');

webFrame.setZoomFactor(1);

contextBridge.exposeInMainWorld('node', {
  context: (text) => {
    ipcRenderer.invoke('context', text);
  }
});

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
