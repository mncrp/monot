const {app, contextBridge} = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('node', {
  changeSearchEngine: (engine) => {
    const text = fs.readFileSync(
      `${__dirname}/../config/engines.mncfg`,
      'utf-8'
    );
    const obj = JSON.parse(text);
    obj.engine = engine;
    fs.writeFileSync(
      `${app.getPath('userData')}/engines.mncfg`,
      JSON.stringify(obj)
    );
  },
  changeExperimentalFunctions: (change, to) => {
    const obj = JSON.parse(
      fs.readFileSync(
        `${app.getPath('userData')}/config.mncfg`,
        'utf-8'
      )
    );
    // { "experiments": { ${change}: ${to} } }
    obj.experiments[change] = to;
    fs.writeFileSync(
      `${app.getPath('userData')}/config.mncfg`,
      JSON.stringify(obj)
    );
  }
});
