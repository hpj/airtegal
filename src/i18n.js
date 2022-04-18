import React, { useState, useEffect } from 'react';

// import enUS from './i18n/en-US.jsonc';
import arEG from './i18n/ar-EG.jsonc';

const locales = [
  // {
  //   value: 'united states',
  //   label: 'United States',
  //   language: 'en',
  //   locale: 'en-US',
  //   direction: 'ltr',
  //   data: enUS
  // },
  {
    value: 'egypt',
    label: 'مصر',
    language: 'ar',
    locale: 'ar-EG',
    direction: 'rtl',
    data: arEG
  }
];

const event = new EventTarget();

/**
* @type { { value: string, label: string, locale: string, direction: string, blank: RegExp } }
*/
let __locale = getDefault();

function getDefault()
{
  const browserLocale = navigator.language || navigator.languages[0];

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
  
  __locale = match;

  event.dispatchEvent(new Event('update'));
}

export function useTranslation()
{
  const [ state, setState ] = useState(locale());

  useEffect(() =>
  {
    const handleStatusChange = () => setState(locale());

    event.addEventListener('update', handleStatusChange);

    return () => event.removeEventListener('update', handleStatusChange);
  });

  return { translation, locale: state };
}

/**
* @template T
* @param { T } Component
* @returns { React.ElementRef<T> }
*/
export function withTranslation(Component)
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
      this.ref.current?.onLocaleChange?.(translation, __locale);
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

      return <Component ref={ this.ref } translation={ translation } locale={ locale() } { ...rest }/>;
    }
  };

  Wrapper.propTypes = Component.propTypes;

  delete Wrapper.propTypes?.translation;
  delete Wrapper.propTypes?.locale;

  return React.forwardRef((props, ref) => <Wrapper { ...props } forwardedRef={ ref }/>);
}

export const locale = () => __locale;

/**
* @param { string } key
* @param { string[] } args
* @returns { string }
*/
export function translation(key, ...args)
{
  args = args || [];

  /**
  * @type { string }
  */
  let value = __locale.data[key];

  if (!value)
    return key;

  // handle plurals
  if (value.includes('~'))
  {
    const split = value.split('~');

    if (args[0] === 1 || (__locale.language === 'ar' && args[0] > 10))
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
