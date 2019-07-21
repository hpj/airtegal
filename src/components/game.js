import React, { useEffect } from 'react';

import RefreshIcon from 'mdi-react/RefreshIcon';
import InlineSVG from 'svg-inline-react';

import { createStyle } from '../flcss.js';

import gameLogo from '../../build/kbf.svg';

import * as colors from '../colors.js';

const Game = () =>
{
  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';
    
    window.scrollTo(0, 0);
  }, [ window.location ]);

  return (
    <div className={wStyles.wrapper}>

      <div  className={rStyles.container}>
        
        <RefreshIcon className={rStyles.refresh}/>
        <p className={rStyles.title}>الغرف المتاحة</p>

      </div>

      <div className={sStyles.container}>

        <p className={sStyles.welcome}>,اهلا</p>
        <p className={sStyles.username}>.طيز السمكة</p>

      </div>
    </div>
  );
};

const wStyles = createStyle({
  wrapper: {
    display: 'flex',

    backgroundColor: colors.whiteBackground,
    color: colors.blackText,

    width: '100vw',
    height: '100vh',

    fontFamily: '"Noto Arabic", sans-serif'
  }
});

const rStyles = createStyle({
  container: {
    display: 'flex',
    flexGrow: 1,

    padding: '3vh 3vw 0 3vw'
  },

  title: {
    fontWeight: '700',
    
    width: 'fit-content',
    height: 'fit-content',

    margin: '0 0 0 auto'
  },

  refresh: {

  }
});

const sStyles = createStyle({
  container: {
    display: 'grid',
    gridTemplateAreas: '"welcome" "username" "."',
    gridTemplateRows: 'auto auto 1fr',

    width: '30%',

    fontWeight: '700',
    padding: '3vh 3vw 0 0'
  },

  welcome: {
    gridArea: 'welcome',
    margin: '0 0 0 auto'
  },

  username: {
    gridArea: 'username',
    margin: '0 0 0 auto'
  }
});

export default Game;