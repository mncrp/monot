const directory = `${__dirname}/../..`;
const {LowLevelConfig} = require(`${directory}/proprietary/lib/config.js`);

const history = new LowLevelConfig('history.mndata').copyFileIfNeeded(`${directory}/default/data/history.mndata`);

class History {
  // eslint-disable-next-line consistent-return
  get() {
    history.update();
    return history.slice();
  }

  get(arrayStart) {
    history.update();
    let data;
    if (arrayStart === 0) {
      data = history.slice();
    } else {
      try {
        data = history.slice(arrayStart);
      } catch (e) {
        console.error(`historyに${arrayStart}番目の要素はありません`);
        return -1;
      }
    }
    return data;
  }

  get(arrayStart, arrayEnd) {
    history.update();
    let data;
    try {
      data = history.slice(arrayStart, arrayEnd);
    } catch (e) {
      console.error(`historyに${arrayEnd}番目の要素はありません。\nhistoryの最後の要素は${history.length - 1}です。`);
      return -1;
    }
    return data;
  }

  set(data) {
    history.update();
    history.unshift(data);
    history.save();
  }
}

module.exports = {
  History
};
