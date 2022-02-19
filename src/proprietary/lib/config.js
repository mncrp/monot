const fs = require('fs');
const path = require('path');
const {app} = require('electron');

class Config {
  constructor(filepath = 'config.mncfg') {
    this.path = path.join(app.getPath('userData'), filepath);
  }

  // Get all config data.
  loadFile() {
    const data = fs.readFileSync(this.path, 'utf-8');
    return JSON.parse(data);
  }

  // Set all config data.
  saveFile(obj) {
    const data = JSON.stringify(obj);
    fs.writeFileSync(this.path, data, 'utf-8');
  }

  #getObjWithDots(obj, keyPath) {
    const paths = keyPath.split('.');
    while (paths.length) {
      obj = obj[paths.shift()];
    }
    return obj;
  }

  #setObjWithDots(obj, keyPath, value) {
    const paths = keyPath.split('.');
    while (paths.length > 1) {
      obj = obj[paths.shift()];
    }
    obj[paths[0]] = value;
  }

  // Get config data.
  get(key, shouldUseDots = false) {
    const config = this.loadFile();
    const result = shouldUseDots ?
      this.#getObjWithDots(config, key) :
      config[key];
    return result;
  }

  // Set config data.
  set(key, value, shouldUseDots = false) {
    const config = this.loadFile();
    if (shouldUseDots) {
      this.#setObjWithDots(config, key, value);
    } else {
      config[key] = value;
    }
    this.saveFile(config);
  }
}

module.exports = Config;
