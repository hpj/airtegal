export const locales = [
  {
    value: 'egypt',
    label: 'مصر',
    language: 'ar',
    locale: 'ar-EG',
    direction: 'rtl',
    blank: /[^\u0621-\u064A0-9 /!؟_\-.]/g,
    // eslint-disable-next-line no-undef
    json: require('./i18n/ar-EG.jsonc').default
  }
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
  const find = locales.find(e => e.value === country?.toLowerCase());

  if (find)
    locale = find;
}

function getDefault()
{
  const browserLocale = navigator.language || navigator.userLanguage || navigator.languages[0];

  return locales.find(e => e.locale === browserLocale) ?? locales[0];
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

  if (!value)
    return key;

  // handle plurals
  if (value.includes('~'))
  {
    const split = value.split('~');

    if (args[0] === 1 || (locale.language === 'ar' && args[0] > 10))
      return args[1] ? `${args[0]} ${split[1]}` : split[1];
    
    return args[1] ? `${args[0]} ${split[0]}` : split[0];
  }
  // replace with args
  else
  {
    args.forEach((s, i) => value = value.replace(`%${i}`, s));
  }

  return value;
}
