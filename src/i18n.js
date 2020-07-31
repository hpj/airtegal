export const locales = [
  { value: 'egypt', label: 'مصر', locale: 'ar-EG', direction: 'rtl', blank: /[^\u0621-\u064A0-9 /؟_\-.]/g, json: require('./i18n/ar-EG.jsonc').default }
];

/**
* @type { { value: string, label: string, locale: string, direction: string, blank: RegExp, json: {} } }
*/
export let locale = getDefault();

/**
* @param { string } country
*/
export function setLocale(country)
{
  if (!country)
    return;

  const find = locales.find((e) => e.value === country.toLowerCase());

  if (find)
    locale = find;
}

function getDefault()
{
  const browserLocale = navigator.language || navigator.userLanguage || navigator.languages[0];

  const find = locales.find((e) => e.locale === browserLocale);

  return (find) ? find : locales[0];
}

/**
* @param { string } key
* @param { string[] } args
* @returns { string }
*/
export default function i18n(key, ...args)
{
  args = args || [];

  if (!locale)
    return undefined;

  /**
  * @type { string }
  */
  // eslint-disable-next-line security/detect-object-injection
  let value = locale.json[key];

  args.forEach((s, i) => value = value.replace(`%${i}`, s));

  return value;
}
