import React from 'react';

import InlineSVG from 'svg-inline-react';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import kbfLogo from '../../build/kbf.svg';

const Loading = () =>
{
  return (
    <div className={styles.container}>
      <InlineSVG className={styles.loading} src={kbfLogo}/>
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
  // on an installed PWA, it has a splash screen that we
  // should match its style
  loading: {
    width: '80px',
    height: '100%',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: colors.accentColor
    }
  }
});

export default Loading;

