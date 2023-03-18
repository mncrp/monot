const directory = `${__dirname}/../..`;
const {app} = require('electron');
const {LowLevelConfig} = require('./config');
const fs = require('fs');
// available languages
const langs = [
  'en',
  'ja'
];
const monotConfig = new LowLevelConfig(
  'config.mncfg'
).copyFileIfNeeded(
  `${directory}/default/config/config.mncfg`
);

app.whenReady().then(initLang);

function translation() {
  function get() {
    return JSON.parse(
      fs.readFileSync(
        `${
          directory
        }/default/language/${
          monotConfig.update().get('lang') || 'ja'
        }.json`,
        'utf-8'
      )
    ).translations;
  }
  try {
    return get();
  } catch (e) {
    initLang();
    return get();
  }
}

function initLang(lang = undefined) {
  const locale = app.getLocale().substring(0, 2);
  if (lang === undefined &&
    monotConfig.update().get('lang') === undefined)
    lang = langs.some(v => v === locale) ?
      locale :
      'en';

  console.log(lang);

  if (lang !== undefined)
    monotConfig.update().set('lang', lang).save();
}

module.exports = {
  sysLang: () => {
    return app.getLocale();
  },
  setLang: (lang) => {
    initLang(lang);
  },
  getAbout: (inEn) => {
    return translation().about[inEn];
  },
  get: (inEn) => {
    return translation()[inEn];
  }
};
