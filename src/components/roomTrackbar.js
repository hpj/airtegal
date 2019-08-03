import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

/** @param { { utils: {} } } param0
*/
const Trackbar = ({ utils }) =>
{
  return (
    <div className={styles.container}>

      <p onClick={utils.startGame}>Ready</p>

    </div>
  );
};

Trackbar.propTypes = {
  utils: PropTypes.object
};

const styles = createStyle({
  container: {
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
  }
});

export default Trackbar;