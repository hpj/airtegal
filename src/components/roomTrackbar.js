import React, { useState, createRef } from 'react';

import * as game from '../game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const Trackbar = () =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        <div onClick={game.startGame}>Ready</div>

      </div>
    </div>
  );
};

const styles = createStyle({
  wrapper: {
    zIndex: 1,
    gridArea: 'side',

    backgroundColor: colors.whiteBackground,

    width: 'calc(100% + 15px)',
    height: '100%',

    borderRadius: '0 15px 15px 0',

    '@media screen and (max-width: 980px)': {
      width: '100%',
      height: 'calc(100% + 15px)',

      borderRadius: '0 0 15px 15px'
    }
  },

  container: {
    display: 'flex',
    
    width: '100%',
    height: '100%',
    
    '@media screen and (max-width: 980px)': {
      alignItems: 'center'
    }
  }
});

export default Trackbar;