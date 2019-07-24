import React, { useState, useEffect } from 'react';

import RefreshIcon from 'mdi-react/RefreshIcon';

import autoSizeInput from 'autosize-input';

import { holdLoadingScreen, hideLoadingScreen } from '../index.js';

import { createStyle } from '../flcss.js';

import * as colors from '../colors.js';

import stupidName from '../stupidName.js';

const Game = () =>
{
  holdLoadingScreen();

  const [ username, setUsername ] = useState(stupidName);

  const usernameChangeEvent = (event) =>
  {
    setUsername(event.target.value.replace(/\s+/g, ' '));
  };

  const usernameBlurEvent = (event) =>
  {
    setUsername(event.target.value.trim());
  };

  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';

    // auto-size the username input-box
    autoSizeInput(document.querySelector(`.${oStyles.username}`));

    hideLoadingScreen();
    
    window.scrollTo(0, 0);
  }, [ window.location ]);

  return (
    <div className={mStyles.wrapper}>

      <div className={mStyles.container}>
        
        <div className={oStyles.container}>

          <input className={oStyles.username} required placeholder='حط اسمك هنا' value={username} onBlur={usernameBlurEvent} onChange={usernameChangeEvent} type='text' maxLength='18'/>
          <p className={oStyles.welcome}>اهلا</p>
        </div>

        <div className={hStyles.container}>

          <div className={hStyles.button}>اصنع غرفتك</div>
          <div className={hStyles.button}>غرفة عشؤئية</div>

        </div>

        <div className={rStyles.container}>

          <RefreshIcon className={rStyles.refresh}/>
          <p className={rStyles.title}>الغرف المتاحة</p>
          
        </div>
      </div>
    </div>
  );
};

const mStyles = createStyle({
  wrapper: {

    backgroundColor: colors.whiteBackground,

    width: '100vw',
    height: '100vh'
  },
  
  container: {
    color: colors.blackText,
    
    maxWidth: '850px',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: 'auto'
  }
});

const oStyles = createStyle({
  container: {
    display: 'flex',

    fontWeight: '700',

    padding: '3vh 3vw 5px 3vw'
  },

  welcome: {
    margin: '0'
  },

  username: {
    margin: '0 5px -2px auto',
    direction: 'rtl',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    padding: 0,
    border: 0,
    borderBottom: `2px ${colors.blackText} solid`,

    '::placeholder': {
      color: colors.red
    },

    ':focus': {
      'outline': 'none'
    },

    ':not(:valid)':
    {
      borderColor: colors.red
    }
  }
});

const hStyles = createStyle({
  container: {
    display: 'grid',

    gridTemplateAreas: '". ."',
    gridColumnGap: '5%',

    fontWeight: '700',
    padding: '0 3vw'
  },

  button: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '5px',
    border: `1px ${colors.blackText} solid`,

    padding: '5px 0',
    margin: '5% 0'
  }
});

const rStyles = createStyle({
  container: {
    display: 'flex',
    flexGrow: 1,

    padding: '3vh 3vw'
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

export default Game;