export const locales = [
  { value: 'egypt', label: 'مصر', locale: 'ar-EG', direction: 'rtl', json: require('./i18n/ar-EG.json') }
];

/**
* @type { { value: string, label: string, locale: string, direction: string, json: {} } }
*/
export let locale = getDefault();

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
}

function getDefault()
{
  const browserLocale = navigator.language || navigator.userLanguage || navigator.languages[0];

  const find = locales.find((e) => e.locale === browserLocale);

  if (find)
    return find;
  else
    return locales[0];
}

/**
* @param { string } key
* @param { string[] } args
* @returns { string }
*/
export default function i18n(key, ...args)
{
  args = args || [];

  if (locale)
  {
    /**
    * @type { string }
    */
    // eslint-disable-next-line security/detect-object-injection
    let value = locale.json[key];

    args.forEach((s, i) => value = value.replace(`%${i}`, s));

    return value;
  }
}