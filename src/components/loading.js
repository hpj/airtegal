import React from 'react';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n from '../i18n/eg-AR.json';

const Loading = () =>
{
  return (
    <div className={ styles.container }>

      <div className={ styles.loading }>{ i18n['kuruit-bedan-fash5'] }</div>

    </div>
  );
};

const styles = createStyle({
  container: {
    zIndex: 999,
    position: 'absolute',
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    direction: 'ltr',

    minWidth: '100vw',
    minHeight: '100vh'
  },

  // TODO on an installed PWA, it has a splash screen that we
  // should match its style

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

