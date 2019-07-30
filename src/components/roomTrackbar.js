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
    gridArea: 'side',

    marginLeft: '28px',
    border: '1px black solid'
  }
});

export default Trackbar;