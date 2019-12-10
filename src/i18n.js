// import arEG from './i18n/eg-AR.json';

export const locales = [
  { value: 'egypt', label: 'مصري', locale: 'ar-EG', json: require('./i18n/eg-AR.json') }
];

export let locale;

/**
* @param { string } country
*/
export function setLocale(country)
{
  if (country)
  {
    const find = locales.find((e) => e.value === country.toLowerCase());

    if (find)
      locale = find;
  }

  if (!locale)
  {
    const browserLocale = getBrowsersLocal();

    const find = locales.find((e) => e.locale === browserLocale);

    if (find)
      locale = find;
    else
      locale = locales[0];
  }
}

function getBrowsersLocal()
{
  return navigator.language || navigator.userLanguage || navigator.languages[0];
}

// /** https://stackoverflow.com/a/19143254/10336604
// * @param { string } s
// */
// function isRTL(s)
// {
//   const rtlChars = '\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC';

//   const rtlDirCheck = new RegExp('^[^'+rtlChars+']*?['+rtlChars+']');

//   return rtlDirCheck.test(s);
// };

export default function i18n(key)
{
  if (locale)
    return locale.json[key];
}