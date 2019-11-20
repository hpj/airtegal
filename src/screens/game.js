import React, { useState, useEffect, createRef } from 'react';
import ReactDOM from 'react-dom';

import RefreshIcon from 'mdi-react/RefreshIcon';

import autoSizeInput from 'autosize-input';

// eslint-disable-next-line no-unused-vars
import io, { Socket } from 'socket.io-client';

import { API_ENDPOINT, holdLoadingScreen, hideLoadingScreen, remountLoadingScreen } from '../index.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import stupidNames from '../stupidNames.js';

import Error from '../components/error.js';
import Warning from '../components/warning.js';

import RoomOverlay from '../components/roomOverlay.js';

import i18n from '../i18n/eg-AR.json';

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

const inputRef = createRef();
const overlayRef = createRef();

/** @type { Socket }
*/
export let socket;

/** @param { string } error
*/
function errorScreen(error)
{
  ReactDOM.render(<Error error={error}/>, placeholder);
  
  ReactDOM.unmountComponentAtNode(app);
}

/** connect the socket.io client to the socket.io server
*/
export function connect()
{
  return new Promise((resolve, reject) =>
  {
    try
    {
      socket = io.connect(API_ENDPOINT + '/io');

      socket.once('connect', resolve).once('error', (e) =>
      {
        socket.close();
        
        reject(e);
      });

      socket.on('disconnect', () =>
      {
        socket.close();

        errorScreen(i18n['server-unavailable']);

        reject();
      });

      // connecting timeout
      setTimeout(() =>
      {
        if (!socket.connected)
        {
          socket.close();
          
          reject('Error: Connecting Timeout');
        }
      }, 3000);
    }
    catch (e)
    {
      socket.close();

      reject(e);
    }
  });
}

const Game = () =>
{
  // check if loading screen is visible
  // if true then hold it
  // if false then remount it
  if (!holdLoadingScreen())
    remountLoadingScreen();

  // TODO cache user preference
  const [ username, setUsername ] = useState(stupidNames);

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
    
    // connect to the socket.io server
    connect()
      // if app connected successfully
      // hide the loading screen
      .then(hideLoadingScreen)
      .catch((err) =>
      {
        errorScreen(i18n['server-unavailable']);

        console.error(err);
      });
  }, [ window.location ]);
  
  return (
    <div className={mainStyles.wrapper}>

      <Warning
        style={{ padding: '50vh 5vw' }}
        storageKey='kbf-adults-warning'
        text={ i18n['kbf-adults-warning'] }
        button={ i18n['ok'] }
      />
      
      <div className={mainStyles.container}>

        <div className={optionsStyles.container}>

          <input ref={inputRef} className={optionsStyles.username} required placeholder={ i18n['username-input'] } value={username} onBlur={usernameBlurEvent} onChange={usernameChangeEvent} type='text' maxLength='18'/>

          <p className={optionsStyles.welcome}> { i18n['welcome'] } </p>

        </div>

        <div className={headerStyles.container}>

          <div className={headerStyles.button} onClick={() => overlayRef.current.joinRoom()}> { i18n['random-room'] } </div>
          <div className={headerStyles.button} onClick={() => overlayRef.current.createRoom()}> { i18n['create-room'] } </div>

        </div>

        <div className={roomsStyles.container}>

          <RefreshIcon className={roomsStyles.refresh}/>
          <p className={roomsStyles.title}> { i18n['available-rooms'] } </p>
          
        </div>
      </div>
      
      <RoomOverlay ref={overlayRef} username={username}/>
    
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