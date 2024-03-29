import React from 'react';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

const SplashScreen = ({ onlyText }) =>
{
  const { translation } = useTranslation();

  return <div className={ styles.container }>
    {
      onlyText ?
        <div className={ styles.text }>{ translation('airtegal') }</div> :
        <div className={ styles.splash }><div/></div>
    }
  </div>;
};

const styles = createStyle({
  container: {
    zIndex: 99,
    position: 'absolute',
    display: 'flex',

    userSelect: 'none',

    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    minWidth: '100vw',
    minHeight: '100vh'
  },

  splash: {
    display: 'flex',

    width: '100vw',
    height: '100vh',

    '> :nth-child(1)': {
      width: '128px',
      height: '128px',
      
      background: `url(./assets/icon-${colors.theme}.svg)`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',

      margin: 'auto'
    }
  },

  text: {
    fontWeight: '700',
    fontSize: 'calc(18px + 0.8vw + 0.8vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    lineHeight: '135%',

    color: colors.accentColor,
    width: 'min-content'
  }
});

export default SplashScreen;

