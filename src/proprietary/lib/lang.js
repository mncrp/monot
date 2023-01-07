const directory = `${__dirname}/../..`;
const {app} = require('electron');
const {LowLevelConfig} = require('./config');
const monotConfig = new LowLevelConfig(
  'config.mncfg'
).copyFileIfNeeded(
  `${directory}/default/config/config.mncfg`
);
if (!monotConfig.get('lang')) {
  monotConfig.update().set('lang', 'ja').save();
}

module.exports = {
  sysLang: () => {
    return app.getLocale();
  },
  setLang: (lang) => {
    monotConfig.update().set('lang', lang).save();
  },
  getText: (lang) => {
    return;
  }
};
