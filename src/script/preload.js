const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("node", {
  winClose: () => {
    ipcRenderer.send("windowClose");
  },
  winMinimize: () => {
    ipcRenderer.send("windowMinimize");
  },
  winMaximize: () => {
    ipcRenderer.send("windowMaximize");
  },
  winUnmaximize: () => {
    ipcRenderer.send("windowUnmaximize");
  },
  maxMin: () => {
    ipcRenderer.send("windowMaxMin");
  },
  moveBrowser: (word) => {
    let file = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, "utf-8");
    let obj = JSON.parse(file);
    let engine = obj.values[obj.engine];
    if (
      word.toLowerCase().substring(0, 6) == "http:/" ||
      word.toLowerCase().substring(0, 7) == "https:/"
    ) {
      // for like "https://example.com" and "http://example.com"
      if (word.indexOf(" ") == -1) {
        //if it's url
        ipcRenderer.send("moveView", word);
      } else {
        //if it's not url
        ipcRenderer.send("moveView", engine + word);
      }
    } else if (word.indexOf(" ") == -1 && word.indexOf(".") != -1) {
      //for like "example.com" and "example.com/example/"
      ipcRenderer.send("moveView", `http://${word}`);
    } else {
      //LAST
      ipcRenderer.send("moveView", engine + word);
    }
  },
  moveToNewTab: () => {
    ipcRenderer.send("moveView", `file://${__dirname}/../resource/index.html`);
  },
  reloadBrowser: () => {
    ipcRenderer.send("reloadBrowser");
  },
  backBrowser: () => {
    ipcRenderer.send("browserBack");
  },
  goBrowser: () => {
    ipcRenderer.send("browserGoes");
  },
  dirName: () => {
    return __dirname;
  },
  optionsWindow: () => {
    ipcRenderer.send("options");
  },
  dark: () => {
    ipcRenderer.send("dark");
  },
});
