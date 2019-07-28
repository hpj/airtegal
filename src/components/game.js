import React, { useState, useEffect, createRef } from 'react';
import { Value } from 'animated';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { withWindowSizeListener } from 'react-window-size-listener';

import RefreshIcon from 'mdi-react/RefreshIcon';

import autoSizeInput from 'autosize-input';

import { holdLoadingScreen, hideLoadingScreen } from '../index.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import stupidName from '../stupidName.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

/** @param { { windowSize: { windowWidth: number, windowHeight: number } } } param0
*/
const Game = ({ windowSize }) =>
{
  // safe to be called multiple times
  // only works on app start if the loading screen wasn't hidden already
  holdLoadingScreen();

  const [ username, setUsername ] = useState(stupidName);
  const [ overlayHolderOpacity, setOverlayHolderOpacity ] = useState(0);
  const [ overlayHidden, setOverlayHidden ] = useState(true);
  const [ overlayDrag, setOverlayDrag ] = useState(true);

  // TODO when user enter a game sett overlayDrag to false and snap overlay to index 0

  const usernameChangeEvent = (event) =>
  {
    setUsername(event.target.value.replace(/\s+/g, ' '));
  };

  const usernameBlurEvent = (event) =>
  {
    setUsername(event.target.value.trim());
  };

  const overlaySnap= (event) =>
  {
    // TODO on snap to 0 disable drag (if not working then we have to disable drag first then snap)
  };

  overlayAnimatedX.addListener(({ value }) =>
  {
    // (windowSize.windowWidth * 2) doubles the width to make the max number 0.5
    // instead of 1 because 1 is a complete black background

    // (0.5 - $) reverses the number to make far left 0 and far right 0.5

    setOverlayHolderOpacity(0.5 - (value / (windowSize.windowWidth * 2)));

    // hide the overlay and overlay holder when they are off-screen

    if (value >= windowSize.windowWidth)
      setOverlayHidden(true);
    else
      setOverlayHidden(false);
  });

  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';

    window.scrollTo(0, 0);

    hideLoadingScreen();
  }, [ window.location ]);

  // auto-size the username input-box
  // called every render so that it can resize properly
  if (document.querySelector(`.${optionsStyles.username}`))
    autoSizeInput(document.querySelector(`.${optionsStyles.username}`));

  return (
    <div className={mainStyles.wrapper}>

      <div className={mainStyles.container}>
        
        <div className={optionsStyles.container}>

          <input className={optionsStyles.username} required placeholder='حط اسمك هنا' value={username} onBlur={usernameBlurEvent} onChange={usernameChangeEvent} type='text' maxLength='18'/>
          <p className={optionsStyles.welcome}>اهلا</p>
        </div>

        <div className={headerStyles.container}>

          <div className={headerStyles.button}>اصنع غرفتك</div>
          <div className={headerStyles.button}>غرفة عشؤئية</div>

        </div>

        <div className={roomsStyles.container}>

          <RefreshIcon className={roomsStyles.refresh}/>
          <p className={roomsStyles.title}>الغرف المتاحة</p>
          
        </div>
      </div>

      <div style={{
        display: (overlayHidden) ? 'none' : '',
        opacity: overlayHolderOpacity
      }} className={overlayStyles.holder}/>
    
      <Interactable.View
        ref={overlayRef}

        style={{
          display: (overlayHidden) ? 'none' : '',
          position: 'fixed',

          backgroundColor: colors.whiteBackground,
          
          top: 0,
          width: '120vw' // workaround an animation issue
        }}

        animatedValueX={overlayAnimatedX}

        dragEnabled={overlayDrag}

        horizontalOnly={true}
        initialPosition={{ x: windowSize.windowWidth }}
        snapPoints={[ { x: -28 }, { x: 0 }, { x: windowSize.windowWidth } ]}
        boundaries={{
          left: (overlayDrag) ? 0 : -28,
          right: windowSize.windowWidth
        }}
      >

        <div className={overlayStyles.wrapper}>
          <div className={overlayStyles.handler}/>
          <div className={overlayStyles.container}/>
        </div>
        
      </Interactable.View>

    </div>
  );
};

Game.propTypes = {
  windowSize: PropTypes.object
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

const overlayStyles = createStyle({
  wrapper: {
    display: 'flex',

    width: '100vw',
    height: '100vh'
  },

  container: {
    marginLeft: '28px'
  },

  holder: {
    position: 'fixed',
    
    backgroundColor: colors.blackBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  handler: {
    backgroundColor: colors.handler,

    width: '8px',
    height: 'calc(5px + 5%)',

    margin: 'auto 10px',
    borderRadius: '8px'
  }
});

export default withWindowSizeListener(Game);