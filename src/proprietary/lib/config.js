const fs = require('fs');
const path = require('path');
const {app} = require('electron');

class Config {
  constructor(filepath = 'config.mncfg') {
    this.config = new LowLevelConfig(filepath);
  }
  // Get config data.
  get(key, shouldUseDots = false) {
    this.config.update();
    return this.config.get(key, shouldUseDots);
  }

  // Set config data.
  set(key, value, shouldUseDots = false) {
    this.config.update();
    this.config.set(key, value, shouldUseDots);
    this.config.save();
  }
}

class LowLevelConfig {
  constructor(filepath = 'config.mncfg') {
    this.path = path.join(app.getPath('userData'), filepath);
    this.data = {};
  }

  // Update my config data.
  update() {
    const data = fs.readFileSync(this.path, 'utf-8');
    this.data = JSON.parse(data);
  }

  // Save my config data.
  save() {
    fs.writeFileSync(this.path, this.data, 'utf-8');
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
    const result = shouldUseDots ?
      this.#getObjWithDots(this.data, key) :
      this.data[key];
    return result;
  }

  // Set config data.
  set(key, value, shouldUseDots = false) {
    if (shouldUseDots) {
      this.#setObjWithDots(this.data, key, value);
    } else {
      this.data[key] = value;
    }
    return this;
  }
}

module.exports = {
  Config,
  LowLevelConfig
};
