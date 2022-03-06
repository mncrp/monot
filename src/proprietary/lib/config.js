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

  // If Config's file is not exist, copy file of the defaultPath to Config's file.
  copyFileIfNeeded(defaultPath) {
    try {
      fs.copyFileSync(defaultPath, this.path, fs.constants.COPYFILE_EXCL);
    } catch (error) {
      if (error.code === 'EEXIST') {
        return this;
      }
      throw error;
    }
    return this;
  }

  // Update my config data.
  update() {
    const data = fs.readFileSync(this.path, 'utf-8');
    this.data = JSON.parse(data);
    return this;
  }

  // Save my config data.
  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data), 'utf-8');
    return this;
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
    return this;
  }

  // Get config data.
  get(key, shouldUseDots = false) {
    return shouldUseDots ?
      LowLevelConfig.#getObjWithDots(this.data, key) :
      this.data[key];
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
