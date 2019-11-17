import React, { useState, createRef } from 'react';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

class RoomOptions extends React.Component
{
  render()
  {
    return (
      <div className={styles.container}>
  
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.red,

    width: '100%',
    height: '100%'
  }
});

export default RoomOptions;