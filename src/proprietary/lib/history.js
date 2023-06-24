const directory = `${__dirname}/../..`;
const {
  LowLevelConfig
} = require(`${directory}/proprietary/lib/config`);
const history = new LowLevelConfig(
  'history.mndata'
).copyFileIfNeeded(
  `${directory}/default/data/history.mndata`,
);

class History {
  constructor() {
    this.history = [];
  }

  getAll() {
    return history.update().data;
  }

  get(arrayStart, arrayBegin) {
    let data;
    history.update();
    try {
      data = history.data.slice(arrayStart, arrayBegin);
    } catch (e) {
      data = history.data;
    }
    return data;
  }

  set(data) {
    history.update();
    history.data.unshift(data);
    history.save();
  }

  deleteAll() {
    history.update();
    history.data = [];
    history.save();
  }
}

module.exports = {
  History
};
