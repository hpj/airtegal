import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import InlineSVG from 'svg-inline-react';
import Select from 'react-select';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import gameLogo from '../../build/kbf.svg';
import hpjLogo from '../../build/hpj-logo-ar.svg';

import Warning from '../components/warning.js';
import CardShowcase from '../components/cardShowcase.js';

import i18n from '../i18n/eg-AR.json';

const countries = [
  { value: 'egypt', label: 'مصر' }
];

const Homepage = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div>
      <Warning
        style={{ padding: '12vh 5vw' }}
        storageKey='kbf-adults-warning'
        text={ i18n['kbf-adults-warning'] }
        button={ i18n['ok'] }
      />

      <div className={headerStyles.wrapper}>

        <div className={headerStyles.regionalOptions}>
          <Select
            className={headerStyles.select}
            classNamePrefix='react-select'
            defaultValue={countries[0]}
            isRtl={true}
            isSearchable={true}
            options={countries}
            theme={theme => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#ffffff'
              }
            })}
          />
        </div>

        <div className={headerStyles.container}>
          <CardShowcase/>

          <div className={headerStyles.title}>

            <a className={headerStyles.hpj} href='https://herpproject.com'>
              <InlineSVG src={hpjLogo}></InlineSVG>
            </a>

            <InlineSVG className={headerStyles.kbf} src={gameLogo}></InlineSVG>
          
          </div>
        </div>
      </div>

      <div className={qaStyles.wrapper}>
        <div className={qaStyles.container}>
          <p className={qaStyles.question}>
            { i18n['what-is-kbf'] }
          </p>

          <p className={qaStyles.answer}>
            { i18n['this-is-kbf'] }
          </p>

          <p className={qaStyles.question}>
            { i18n['who-is-hpj'] }
          </p>

          <p className={qaStyles.answer}>
            { i18n['this-is-hpj'] }
          </p>

          <p className={qaStyles.question}>
            { i18n['why-is-game-raciest'] }
          </p>

          <p className={qaStyles.answer}>

            { i18n['freedom-of-speech-1'] }
            <br/>

            { i18n['freedom-of-speech-2'] }
            <br/>

            { i18n['freedom-of-speech-3'] }
          </p>

          <p className={qaStyles.question}>
            { i18n['how-to-suggest-cards'] }
          </p>

          <p className={qaStyles.answer}>
            { i18n['suggesting-cards'] }
          </p>

        </div>
      </div>
    
      <div className={playStyles.wrapper}>
        <div className={playStyles.container}>
          <Link className={playStyles.title} to='/play'> { i18n['play'] } </Link>
        </div>
      </div>

      <div className={footerStyles.wrapper}>
        <div className={footerStyles.container}>
          <a className={footerStyles.hpj} href='https://herpproject.com'>
            <InlineSVG src={hpjLogo}></InlineSVG>
          </a>
          <div className={footerStyles.sitemap}>
            <Link className={footerStyles.use} to='/terms'> { i18n['terms-and-conditions'] } </Link>
            _
            <Link className={footerStyles.privacy} to='/privacy'> { i18n['privacy-policy'] } </Link>
          </div>
          <p className={footerStyles.copyright}>
            { i18n['copyright-notice'] }
          </p>
        </div>
      </div>
    </div>
  );
};

const headerStyles = createStyle({
  wrapper: {
    background: 'linear-gradient( 135deg, #F05F57 10%, #360940 100%);',

    padding: '0 5vw'
  },

  container: {
    display: 'flex'
  },

  regionalOptions: {
    width: 'auto',
    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '10px 0 0 0'
  },

  select: {
    ':focus': {
      outline: colors.whiteText
    },

    ' .react-select__option': {
      cursor: 'pointer'
    },

    ' .react-select__option--is-selected': {
      backgroundColor: '#3B5FFF',

      ':active': {
        backgroundColor: '#3B5FFF'
      }
    },
    ' .react-select__input': {
      color: colors.whiteText
    },

    ' .react-select__control': {
      cursor: 'pointer',

      background: 'none',
      border: 'none'
    },

    ' .react-select__control--is-focused': {
      outline: colors.whiteText
    },

    ' .react-select__single-value': {
      color: colors.whiteText
    },

    ' .react-select__indicator-separator': {
      display: 'none'
    },

    ' .react-select__indicator': {
      color: colors.whiteText
    },

    ' .react-select__indicator:hover': {
      color: colors.whiteText
    }
  },

  title: {
    display: 'grid',

    overflow: 'hidden',
    
    padding: '5vh 0',
    margin: 'auto'
  },

  hpj: {
    minWidth: '95px',
    maxWidth: '140px',

    margin: 'auto',

    '> i > svg': {
      width: '100%',
      height: '100%',
      
      fill: colors.whiteText,

      cursor: 'pointer'
    },

    ':hover > i > svg': { fill: colors.accentColor }
  },

  kbf: {
    minWidth: '95px',
    maxWidth: '140px',

    margin: 'auto',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    }
  }
});

const qaStyles = createStyle({
  wrapper: {
    backgroundColor: colors.whiteBackground
  },

  container: {
    maxWidth: '850px',

    color: colors.blackText,

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    direction: 'rtl',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  question: {
    fontWeight: 700,

    margin: '0 0 3px 0'
  },

  answer: {
    margin: 0,

    '+ p': {
      margin: '20px 0 3px 0'
    }
  }
});

const playStyles = createStyle({
  wrapper: {
    background: 'linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%)'
  },

  container: {
    display: 'flex',
    justifyContent: 'center',
    
    maxWidth: '850px',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  title: {
    color: colors.whiteText,
    cursor: 'pointer',
    
    border: '3px solid',
    borderColor: colors.whiteText,

    pointerEvents: 'none',
    userSelect: 'none',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(12px + 0.65vw + 0.65vh)',

    textDecoration: 'none',

    padding: '5% 12%',

    '[href]': {
      pointerEvents: 'all'
    },

    ':hover': {
      background: 'linear-gradient(to right, #009fff, #ec2f4b)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',

      borderImage: 'linear-gradient(to right, #009fff, #ec2f4b)',
      borderImageSlice: 1
    },

    ':active': {
      transform: 'scale(0.9)'
    }
  }
});

const footerStyles = createStyle({
  wrapper: { backgroundColor: colors.blackBackground },

  container: {
    display: 'grid',

    gridTemplateColumns: '50% 50%',
    gridTemplateAreas: '"patreon hpj" "sitemap sitemap" "copyright copyright"',
  
    gridRowGap: '10px',
    
    maxWidth: '850px',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontWeight: 700,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',

    cursor: 'pointer',

    minWidth: '100px',
    maxWidth: '132px',
    width: '35%',
    height: '100%',
    
    margin: '0 0 0 auto',

    '> i > svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    },

    ':hover > i > svg': { fill: colors.accentColor }
  },

  patreon: {
    gridArea: 'patreon',

    display: 'flex',
    alignItems: 'center',
    
    color: colors.whiteText,
    width: 'fit-content',
    
    userSelect: 'none',
    cursor: 'pointer',
    
    direction: 'ltr',
    textDecoration: 'none',

    margin: '0 auto 0 0',

    ':hover': { color: colors.accentColor },

    '> svg': { padding: '0 5px 0 0' }
  },

  sitemap: {
    gridArea: 'sitemap',
    display: 'flex',

    margin: '0 0 0 auto',

    userSelect: 'none',
    color: colors.whiteText
  },

  privacy: {
    cursor: 'pointer',
    padding: '0 5px',

    color: colors.whiteText,
    textDecoration: 'none',

    ':hover': { color: colors.accentColor }
  },

  use: { extend: 'privacy' },

  copyright: {
    gridArea: 'copyright',
    
    color: colors.greyText,

    userSelect: 'none',
    direction: 'rtl',
    
    margin: 0
  }
});

export default Homepage;