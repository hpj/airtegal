import React, { useState, useEffect, createRef } from 'react';

import RefreshIcon from 'mdi-react/RefreshIcon';

import autoSizeInput from 'autosize-input';

// eslint-disable-next-line no-unused-vars
import io, { Socket } from 'socket.io-client';

import { API_URI, holdLoadingScreen, errorScreen, hideLoadingScreen } from '../index.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import stupidName from '../stupidName.js';

import RoomOverlay from '../components/roomOverlay.js';

/** @type { Socket }
*/
export let socket;

const inputRef = createRef();
const overlayRef = createRef();

/** connect the socket.io client to the socket.io server
*/
export function connect()
{
  return new Promise((resolve, reject) =>
  {
    socket = io.connect(API_URI + '/io');

    socket.on('connect', resolve).on('error', reject);
  });
}

const Game = () =>
{
  // safe to be called multiple times
  // only works on app start if the loading screen wasn't hidden already
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

    // TODO how to get query parameters

    // const query = new URLSearchParams(window.location.href.match(/(?=\?).+/)[0]);
    // console.log(query.get('q'));

    // disable back button

    window.history.pushState(undefined, document.title, window.location.href);
    
    window.addEventListener('popstate', () => window.history.pushState(undefined, document.title,  window.location.href));

    window.scrollTo(0, 0);

    // auto-size the username input-box
    autoSizeInput(inputRef.current);

    // auto-size the username input-box on resize
    window.addEventListener('resize', () =>
    {
      autoSizeInput(inputRef.current);
    });
    
    if (API_URI)
    {
      // connect to the socket.io server
      connect()
        .then(hideLoadingScreen)
        .catch((err) =>
        {
          errorScreen('السيرفر خارج الخدمة');

          console.error(err);
        });
    }
    else
    {
      errorScreen('السيرفر خارج الخدمة');
    }
  }, [ window.location ]);
  
  return (
    <div className={mainStyles.wrapper}>
      <div className={mainStyles.container}>

        <div className={optionsStyles.container}>

          <input ref={inputRef} className={optionsStyles.username} required placeholder='حط اسمك هنا' value={username} onBlur={usernameBlurEvent} onChange={usernameChangeEvent} type='text' maxLength='18'/>
          <p className={optionsStyles.welcome}>اهلا</p>

        </div>

        <div className={headerStyles.container}>

          <div className={headerStyles.button} onClick={() => overlayRef.current.joinRoom()}>غرفة عشؤئية</div>
          <div className={headerStyles.button} onClick={() => overlayRef.current.createRoom()}>اصنع غرفتك</div>

        </div>

        <div className={roomsStyles.container}>

          <RefreshIcon className={roomsStyles.refresh}/>
          <p className={roomsStyles.title}>الغرف المتاحة</p>
          
        </div>
      </div>
      
      <RoomOverlay ref={overlayRef}/>
    
    </div>
  );
};

const mainStyles = createStyle({
  wrapper: {
    width: '100vw',
    height: '100vh'
  },
  
  container: {
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    maxWidth: '850px',

    userSelect: 'none',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: 'auto'
  }
});

const optionsStyles = createStyle({
  container: {
    display: 'flex',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',

    padding: '3vh 3vw 5px 3vw'
  },

  welcome: {
    margin: '0'
  },

  username: {
    margin: '0 5px -2px auto',
    direction: 'rtl',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
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

const headerStyles = createStyle({
  container: {
    display: 'grid',

    gridTemplateAreas: '". ."',
    gridColumnGap: '5%',
    
    fontWeight: '700',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',

    padding: '0 3vw'
  },

  button: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    borderRadius: '5px',
    border: `1px ${colors.blackText} solid`,

    cursor: 'pointer',
    padding: '5px 0',
    margin: '5% 0',

    transform: 'scale(1)',
    transition: 'transform 0.15s, background-color 0.25s, color 0.25s',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

const roomsStyles = createStyle({
  container: {
    display: 'flex',
    flexGrow: 1,

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',

    padding: '3vh 3vw'
  },

  title: {
    fontWeight: '700',
    
    width: 'fit-content',
    height: 'fit-content',

    margin: '0 0 0 auto'
  },

  refresh: {
    width: 'calc(12px + 0.55vw + 0.55vh)',
    height: 'calc(12px + 0.55vw + 0.55vh)',

    fill: colors.blackText,
    backgroundColor: colors.whiteBackground,

    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',

    transform: 'rotateZ(0deg) scale(1)',
    transition: 'transform 0.25s, background-color 0.25s, fill 0.25s',

    ':hover': {
      fill: colors.whiteText,
      backgroundColor: colors.blackBackground,

      transform: 'rotateZ(22deg)'
    },

    ':active': {
      transform: 'scale(0.95) rotateZ(22deg)'
    }
  }
});

export default Game;