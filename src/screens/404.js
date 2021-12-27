import React, { useEffect } from 'react';

import { createStyle, createAnimation } from 'flcss';

import { hideSplashScreen } from '../index.js';

const NotFound = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = '4xx';
    window.scrollTo(0, 0);

    hideSplashScreen();
  });

  return (
    <div className={ styles.container }>
      <div className={ styles.noiseWrapper }>
        <div className={ styles.noise }/>
      </div>
    </div>
  );
};

const noiseAnimation = createAnimation({
  duration: '1s',
  fillMode: 'both',
  timingFunction: 'steps(8)',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    '0%': {
      transform: 'translateX(0px,0px)'
    },
    '10%': {
      transform: 'translate(-100px, 100px)'
    },
    '20%': {
      transform: 'translate(150px, -100px)'
    },
    '30%': {
      transform: 'translate(-100px, 100px)'
    },
    '40%': {
      transform: 'translate(100px, -150px)'
    },
    '50%': {
      transform: 'translate(-100px, 200px)'
    },
    '60%': {
      transform: 'translate(-200px, -100px)'
    },
    '70%': {
      transform: 'translateY(50px, 100px)'
    },
    '80%': {
      transform: 'translate(100px, -150px)'
    },
    '90%': {
      transform: 'translate(0px, 200px)'
    },
    '100%': {
      transform: 'translate(-100px, 100px)'
    }
  }
});

const styles = createStyle({
  container: {
    background: 'radial-gradient(ellipse at center, #29382c 0%, #0c100d 100%)',
    backgroundColor: '#2c2c2c',
    width: '100vw',
    height: '100vh'
  },

  noiseWrapper: {
    zIndex: 10,
    overflow: 'hidden',
    position: 'absolute',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    left: 0,
    top: 0,
    width: '100%',
    height: '100%',

    ':after': {
      content: '""',
      position: 'absolute',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%,rgba(0,0,0,0.75) 100%)',
      
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },

  noise: {
    position: 'absolute',
    background: 'transparent url(/assets/noise.png) 0 0',
    backgroundSize: '320px 320px',
    
    top: '-500px',
    right: '-500px',
    bottom: '-500px',
    left: '-500px',
    
    opacity: '0.35',
    animation: noiseAnimation
  }
});

export default NotFound;