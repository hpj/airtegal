import React from 'react';
import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

/** @param { { error: string } } param0
*/
const Error = ({ error }) =>
{
  const { locale } = useTranslation();

  return <div className={ styles.container } style={ { direction: locale.direction } }>
    <p className={ styles.error }>{ error }</p>
  </div>;
};

Error.propTypes = {
  error: PropTypes.string
};

const styles = createStyle({
  container: {
    zIndex: 50,
    position: 'absolute',
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    width: 'calc(100vw - 30px)',
    height: 'calc(100vh - 30px)',

    padding: '15px'
  },

  error: {
    maxWidth: '450px',
    
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(8px + 0.35vw + 0.35vh)',
    fontWeight: 700
  }
});

export default Error;

