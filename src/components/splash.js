import React from 'react';

import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import { useTranslation } from '../i18n.js';

import { Light, Dark } from '../icons/airtegal.js';

const colors = getTheme();

const SplashScreen = ({ onlyText }) =>
{
  const { translation } = useTranslation();

  return <div className={ styles.container }>
    {
      onlyText ?
        <div className={ styles.text }>{ translation('airtegal') }</div> :
        <div className={ styles.splash }>
          { colors.theme === 'dark' ? <Dark/> : <Light/> }
        </div>
    }
  </div>;
};

SplashScreen.propTypes = {
  onlyText: PropTypes.bool
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

    alignItems: 'center',
    justifyContent: 'center',

    width: '100vw',
    height: '100vh',

    '> :nth-child(1)': {
      width: '128px',
      height: '128px'
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

