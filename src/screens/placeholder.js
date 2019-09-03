import React from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import kbfLogo from '../../build/kbf.svg';

/** @param { { type: 'loading' | 'error' | 'not-available' } } param0
*/
const Placeholder = ({
  type, content
}) =>
{
  let element;

  if (type === 'loading')
    element = <InlineSVG className={styles.loading} src={kbfLogo}/>;

  if (type === 'error')
    element = <p className={styles.error}>{content}</p>;

  if (type === 'not-available')
    element = <p className={styles.notAvailable}>This app is not available in your country.</p>;

  return (
    <div className={styles.placeholder}>
      {element}
    </div>
  );
};

Placeholder.propTypes = {
  type: PropTypes.oneOf([
    'loading',
    'error',
    'not-available'
  ]).isRequired,
  content: PropTypes.string
};

const styles = createStyle({
  placeholder: {
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
  // on an installed PWA, it has a splash screen that we
  // should match its style
  loading: {
    width: '80px',
    height: '100%',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: colors.accentColor
    }
  }
});

export default Placeholder;

