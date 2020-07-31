import React, { useEffect } from 'react';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

const Offline = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'You Are Offline';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div className={ styles.container }>
      <p>You Are Offline</p>
    </div>
  );
};

const styles = createStyle({
  container: {
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    width: '100vw',
    height: '100vh',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700
  }
});

export default Offline;