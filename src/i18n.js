import React, { useState, useEffect } from 'react';

import { setTag } from '@sentry/react';

const locales = [
  // {
  //   value: 'united states',
  //   label: 'United States',
  //   language: 'en',
  //   locale: 'en-US',
  //   direction: 'ltr',
  //   blank: /[^A-z0-9 /!؟_\-.]/g,
  //   // eslint-disable-next-line no-undef
  //   json: require('./i18n/en-US.jsonc').default
  // },
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

const event = new EventTarget();

/**
* @type { { value: string, label: string, locale: string, direction: string, blank: RegExp, json: {} } }
*/
let locale = getDefault();

function getDefault()
{
  const browserLocale = navigator.language || navigator.userLanguage || navigator.languages[0];

  return locales.find(e => e.locale === browserLocale) ?? locales[0];
}

/**
* @param { string } country
* @param { string } language
*/
export function setLocale(country, language)
{
  const match =
    locales.find(e => e.value === country?.toLowerCase()) ??
    locales.find(e => e.language === language);

  if (!match)
    return;
  
  locale = match;

  setTag('region', locale.value);
  setTag('locale', locale.locale);
  
  event.dispatchEvent(new Event('update'));
}

export function useI18n()
{
  const [ locale, setLocale ] = useState(getLocale());

  useEffect(() =>
  {
    const handleStatusChange = () => setLocale(getLocale());

    event.addEventListener('update', handleStatusChange);

    return () => event.removeEventListener('update', handleStatusChange);
  });

  return { locale, i18n: getI18n };
}

/**
* @template T
* @param { T } Component
* @returns { React.ElementRef<T> }
*/
export function withI18n(Component)
{
  const Wrapper = class extends React.Component
  {
    constructor(props)
    {
      super(props);

      this.ref = props.forwardedRef ?? React.createRef();

      this.onChange = this.onChange.bind(this);
    }

    onChange()
    {
      this.ref.current?.onI18nChange?.(getI18n, locale);
    }

    componentDidMount()
    {
      event.addEventListener('update', this.onChange);

      this.onChange();
    }

    componentWillUnmount()
    {
      event.removeEventListener('update', this.onChange);
    }

    render()
    {
      // eslint-disable-next-line no-unused-vars
      const { forwardedRef, ...rest } = this.props;

      return <Component ref={ this.ref } i18n={ getI18n } locale={ locale } { ...rest }/>;
    }
  };

  Wrapper.propTypes = Component.propTypes;

  delete Wrapper.propTypes?.i18n;
  delete Wrapper.propTypes?.locale;

  return React.forwardRef((props, ref) => <Wrapper { ...props } forwardedRef={ ref }/>);
}

export const getLocale = () => locale;

/**
* @param { string } key
* @param { string[] } args
* @returns { string }
*/
export function getI18n(key, ...args)
{
  args = args || [];

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
