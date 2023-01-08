const directory = `${__dirname}/../..`;
const {app} = require('electron');
const {LowLevelConfig} = require('./config');
const fs = require('fs');
// available languages
const langs = [
  'en',
  'ja'
];
let translation;
const monotConfig = new LowLevelConfig(
  'config.mncfg'
).copyFileIfNeeded(
  `${directory}/default/config/config.mncfg`
);

app.whenReady().then(initLang);

function sysLocale() {
  return langs.some(v => v === app.getLocale()) ?
    app.getLocale() :
    'ja';
}

function initLang(lang) {
  const locale = app.getLocale().substring(0, 2);
  lang = langs.some(v => v === locale) &&
    lang === undefined ?
    locale :
    'ja';

  console.log(lang);

  // set language if "lang" matches "langs"
  // if (langs.some(v => v === lang))
  // monotConfig.update().set('lang', lang).save();

  // set language if not already set
  if (monotConfig.update().get('lang') === undefined)
    monotConfig.set('lang', lang).save();

  // load translations
  translation = JSON.parse(
    fs.readFileSync(
      `${
        directory
      }/default/language/${
        monotConfig.get('lang')
      }.json`,
      'utf-8'
    )
  ).translations;
}

module.exports = {
  sysLang: () => {
    return app.getLocale();
  },
  setLang: (lang) => {
    initLang();
  },
  getText: (lang, inEn) => {
    return translation;
  }
};
