import React from 'react';

import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const Trackbar = ({ startGame }) =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        <div onClick={startGame}>Ready</div>

      </div>
    </div>
  );
};

Trackbar.propTypes = {
  startGame: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    zIndex: 2,
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