import React from 'react';

import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

// TODO on an installed PWA, it has a splash screen that we
// should match its style

// FIX the splash loading screen don't have the fonts loaded
// so the kbf logo is renderer incorrectly

const Loading = ({ splash }) =>
{
  return (
    <div className={ styles.container }>

      <div className={ styles.loading }>{ i18n('kuruit-bedan-fash5') }</div>

    </div>
  );
};

Loading.propTypes = {
  splash: PropTypes.bool
};

const styles = createStyle({
  container: {
    zIndex: 999,
    position: 'absolute',
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    direction: locale.direction,

    minWidth: '100vw',
    minHeight: '100vh'
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

