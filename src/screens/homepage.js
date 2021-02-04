import React from 'react';

import { Link } from 'react-router-dom';

import { createStyle } from 'flcss';

import Select from '../components/select.js';

import getTheme from '../colors.js';

import Warning from '../components/warning.js';
import CardShowcase from '../components/cardShowcase.js';

import i18n, { locales, locale, setLocale } from '../i18n.js';

const colors = getTheme();

class Homepage extends React.Component
{
  constructor()
  {
    super();
    
    window.scrollTo(0, 0);
  }

  render()
  {
    return (
      <div id={ 'homepage' }>
        <Warning
          storageKey={ 'airtegal-adults-warning' }
          text={ i18n('airtegal-adults-warning') }
          button={ i18n('ok') }
        />
  
        <div className={ headerStyles.wrapper }>
  
          <div className={ headerStyles.regionalOptions }>
            <Select
              className={ headerStyles.select }
              menuClassName={ headerStyles.selectMenu }
          
              defaultValue={ locales.indexOf(locale) }
              options={ locales }

              onChange={ (locale) => setLocale(locale.value) }
            />
          </div>
  
          <div className={ headerStyles.container }>
            
            {/* TODO: Showcase is disabled to lower the server bandwidth */}
            {/* And to simplify homepage design */}
            {/* <CardShowcase/> */}
  
            <div className={ headerStyles.title }>
  
              <a className={ headerStyles.hpj } href={ 'https://herpproject.com' }>
                { i18n('hpj') }
              </a>
  
              <div className={ headerStyles.airtegal }>{ i18n('this-is-airtegal') }
                <div className={ headerStyles.beta }>({ i18n('beta') })</div>
              </div>
            
            </div>
          </div>
        </div>
  
        <div className={ qaStyles.wrapper }>
          <div className={ qaStyles.container }>
            <p className={ qaStyles.question }>
              { i18n('what-is-airtegal') }
            </p>
  
            <p className={ qaStyles.answer }>
              { i18n('that-is-airtegal') }
            </p>
  
            <p className={ qaStyles.question }>
              { i18n('who-is-hpj') }
            </p>
  
            <p className={ qaStyles.answer }>
              { i18n('this-is-hpj') }
            </p>
  
            <p className={ qaStyles.question }>
              { i18n('why-is-game-raciest') }
            </p>
  
            <p className={ qaStyles.answer }>
  
              { i18n('freedom-of-speech-1') }
              <br/>
  
              { i18n('freedom-of-speech-2') }
            </p>
  
            <p className={ qaStyles.question }>
              { i18n('how-to-suggest-cards') }
            </p>
  
            <p className={ qaStyles.answer }>
              { i18n('suggesting-cards') }
            </p>
  
          </div>
        </div>

        <div className={ playStyles.wrapper }>
          <div className={ playStyles.container }>
            <Link className={ playStyles.title } to={ '/play' }> { i18n('play') } </Link>
          </div>
        </div>
  
        <div className={ footerStyles.wrapper }>
          <div className={ footerStyles.container }>
            <a className={ footerStyles.hpj } href={ 'https://herpproject.com' }>
              { i18n('herp-project') }
            </a>
            <div className={ footerStyles.sitemap }>
              <a className={ footerStyles.privacy } href={ 'https://herpproject.com/airtegal/privacy' }>{ i18n('privacy-policy') }</a>
              _
              <a className={ footerStyles.terms } href={ 'https://herpproject.com/airtegal/terms' }>{ i18n('terms-and-conditions') }</a>
            </div>
            <p className={ footerStyles.copyright }>
              { i18n('copyright-notice') }
            </p>
          </div>
        </div>
      </div>
    );
  }
}

const headerStyles = createStyle({
  wrapper: {
    background: `linear-gradient( 135deg, ${colors.headerGradient[0]} 10%, ${colors.headerGradient[1]} 100%);`,
    padding: '0 5vw'
  },

  container: {
    display: 'flex',
    minHeight: '450px',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  regionalOptions: {
    width: 'auto',

    fontWeight: 700,
    fontFamily: 'Noto Arabic',
    fontSize: 'calc(12px + 0.2vw + 0.2vh)',

    padding: '10px 0 0 0'
  },

  select: {
    direction: locale.direction,

    color: colors.whiteText,
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,

    '[shown="true"]': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground
    }
  },

  selectMenu: {
    borderColor: colors.greyText
  },

  title: {
    display: 'grid',

    direction: locale.direction,
    userSelect: 'none',

    minWidth: 'fit-content',
    overflow: 'hidden',
    
    padding: '5vh 0',
    margin: 'auto'
  },

  hpj: {
    cursor: 'pointer',
    margin: 'auto',
    
    fontSize: 'calc(12px + 0.5vw + 0.5vh)',

    color: colors.whiteText,
    textDecoration: 'none',

    ':hover': { color: colors.accentColor }
  },

  airtegal: {
    margin: 'auto',
    fontSize: 'calc(35px + 1.5vw + 1.5vh)',

    lineHeight: '135%',
    color: colors.whiteText,

    padding: '10px 0'
  },

  beta: {
    margin: ' 15px 0 0 auto',
    fontSize: '12px',

    color: colors.whiteText,
    lineHeight: '100%'
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
    direction: locale.direction,
  
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
    background: `linear-gradient(0deg, ${colors.playBackgroundGradient[0]} 0%, ${colors.playBackgroundGradient[1]} 100%)`
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',

    justifyContent: 'center',
    
    maxWidth: '850px',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
  
    padding: '2vh 5vw 5vh 5vw',
    margin: 'auto'
  },

  title: {
    color: colors.whiteText,
    cursor: 'pointer',
    
    border: `3px solid ${ colors.whiteText }`,

    userSelect: 'none',

    fontSize: 'calc(12px + 0.65vw + 0.65vh)',

    textDecoration: 'none',

    padding: '5% 12%',
    margin: '2vh 0',

    ':hover': {
      background: `linear-gradient(to right, ${colors.playButtonGradient[0]}, ${colors.playButtonGradient[1]})`,
      
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',

      borderImage: `linear-gradient(to right, ${colors.playButtonGradient[0]}, ${colors.playButtonGradient[1]})`,
      borderImageSlice: 1
    },

    ':active': {
      transform: 'scale(0.9)'
    }
  }
});

const footerStyles = createStyle({
  wrapper: {
    backgroundColor: colors.blackBackground
  },

  container: {
    display: 'grid',

    gridTemplateAreas: '"hpj" "sitemap" "copyright"',
  
    gridRowGap: '10px',
    
    maxWidth: '850px',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontWeight: 700,
  
    direction: locale.direction,
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',
    cursor: 'pointer',
    
    width: 'fit-content',
    padding: '0 5px',

    userSelect: 'none',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    color: colors.whiteText,
    textDecoration: 'none',

    ':hover': { color: colors.accentColor }
  },

  sitemap: {
    gridArea: 'sitemap',
    display: 'flex',

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

  terms: { extend: 'privacy' },

  copyright: {
    gridArea: 'copyright',
    
    margin: '0',
    padding: '0 5px',

    color: colors.greyText,
    userSelect: 'none'
  }
});

export default Homepage;