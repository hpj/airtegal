import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

/** @param { { utils: {}, children: [] } } param0
*/
const RoomContent = ({ utils, children }) =>
{
  return (
    <div className={styles.container}>

      {children}

    </div>
  );
};

RoomContent.propTypes = {
  utils: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

const styles = createStyle({
  container: {
    gridArea: 'content'
  }
});

export default RoomContent;