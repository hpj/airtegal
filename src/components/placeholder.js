import React from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';

import kbfLogo from '../../build/kbf.svg';

import { createStyle } from '../flcss.js';

import * as colors from '../colors.js';

/** @param { { type: 'loading' | 'error' | 'not-available' | 'maintenance' } } param0
*/
const Placeholder = ({
  type, content
}) =>
{
  let element;

  if (type === 'loading')
    element = <InlineSVG className={styles.loading} src={kbfLogo}/>;

  if (type === 'error')
    element = <p className={styles.error}>{content}.</p>;

  if (type === 'not-available')
    element = <p className={styles.notAvailable}>Kuruit Bedan Fash5 is not available in your country.</p>;


  if (type === 'maintenance')
    element = <p className={styles.maintenance}>{'Game is currently under maintenance, We\'ll be back soon.'}</p>;

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
    'not-available',
    'maintenance'
  ]).isRequired,
  content: PropTypes.string
};

const styles = createStyle({
  placeholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    direction: 'ltr',

    width: '100vw',
    height: '100vh'
  },
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

