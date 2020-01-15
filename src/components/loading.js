import React from 'react';

import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

const Loading = ({ splash }) =>
{
  return (
    <div className={ styles.container }>
      {
        (splash) ?
          <div className={ styles.splash }><div/></div> :
          <div className={ styles.loading }>{ i18n('kuruit-bedan-fash5') }</div>
      }
    </div>
  );
};

Loading.propTypes = {
  splash: PropTypes.bool
};

const styles = createStyle({
  container: {
    zIndex: 30,
    position: 'absolute',
    display: 'flex',

    userSelect: 'none',

    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    direction: locale.direction,

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

  loading: {
    fontWeight: '700',
    fontSize: 'calc(18px + 0.8vw + 0.8vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    lineHeight: '135%',

    color: colors.accentColor,
    width: 'min-content'
  }
});

export default Loading;

