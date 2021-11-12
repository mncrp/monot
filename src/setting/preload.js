const { contextBridge, dialog, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("node", {
  changeSearchEngine: (engine) => {
    let text = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, "utf-8");
    let obj = JSON.parse(text);
    obj.engine = engine;
    fs.writeFileSync(
      `${__dirname}/../config/engines.mncfg`,
      JSON.stringify(obj)
    );
  },
  changeExperimentalFunctions: (change, to) => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, "utf-8")
    );
    /*{ "experiments": { ${change}: ${to} } }*/
    obj.experiments[change] = to;
    fs.writeFileSync(
      `${__dirname}/../config/config.mncfg`,
      JSON.stringify(obj)
    );
  },
});
