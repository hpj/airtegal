import React from 'react';
import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

/** @param { { error: string } } param0
*/
const Error = ({ error }) =>
{
  return (
    <div className={styles.container}>
      <p className={styles.error}>{error}</p>
    </div>
  );
};

Error.propTypes = {
  error: PropTypes.string
};

const styles = createStyle({
  container: {
    zIndex: 999,
    position: 'absolute',
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    direction: 'ltr',

    minWidth: '100vw',
    minHeight: '100vh'
  },
  error: {
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(8px + 0.35vw + 0.35vh)',
    fontWeight: 700
  }
});

export default Error;
