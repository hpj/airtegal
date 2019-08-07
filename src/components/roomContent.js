import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

/** @param { { children: [] } } param0
*/
const RoomContent = ({ children }) =>
{
  return (
    <div className={styles.container}>

      {children}

    </div>
  );
};

RoomContent.propTypes = {
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