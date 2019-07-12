import React from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';

import kbfLogo from '../../build/kbf.svg';

import { createStyle } from '../flcss.js';

import * as colors from '../colors.js';

/** @param { { type: 'loading' | 'not-available' | 'maintenance' } } param0
*/
const Placeholder = ({ type }) =>
{
  let element;

  if (type === 'loading')
    element = <InlineSVG className={styles.kbf} src={kbfLogo}/>;

  return (
    <div className={styles.placeholder}>
      {element}
    </div>
  );
};

Placeholder.propTypes = { type: PropTypes.oneOf([
  'loading',
  'not-available',
  'maintenance'
]) };

const styles = createStyle({
  placeholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100vw',
    height: '100vh'
  },
  kbf: {
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

