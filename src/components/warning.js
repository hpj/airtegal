import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import { useI18n } from '../i18n.js';

const colors = getTheme();

const Warning = ({ storageKey, text, button }) =>
{
  const { locale } = useI18n();

  // starts hidden, so it won't appear and disappear again if the user turned it off
  const [ visible, changeVisibility ] = useState(false);

  const onClick = () =>
  {
    // hide the warning from UI
    changeVisibility(false);

    // set it so the warning won't appear the next time the user opens the page
    localStorage.setItem(storageKey, false);
  };

  // on url change
  useEffect(() =>
  {
    const params = new URL(document.URL).searchParams;

    // the quiet param is used for testing
    // so we don't have to click on the warning each test
    if (process.env.NODE_ENV === 'test' && params?.has('quiet'))
      return;
    
    // because the warning starts hidden
    // we need to check if the user didn't accept the warning already
    // if they didn't then we assume it's the first time they open the page and show them the warning
    if (!localStorage.getItem(storageKey))
      changeVisibility(true);
  }, []);

  // if the waring is visible
  return visible ?
    <div className={ styles.wrapper }>
      <div className={ styles.container } style={ { direction: locale.direction } }>
        {text}
        <div id={ 'warning-button' } className={ styles.button } onClick={ onClick }>
          {button}
        </div>
      </div>
    </div>
    : <div/>;
};

Warning.propTypes = {
  storageKey: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 20,
    display: 'flex',
    position: 'fixed',

    userSelect: 'none',
    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    width: '100vw',
    height: '100vh'
  },

  container: {
    color: colors.blackText,

    maxWidth: '850px',
    height: 'min-content',
    margin: 'auto'
  },

  button: {
    width: 'min-content',

    cursor: 'pointer',
    textAlign: 'center',
    
    border: '3px solid',
    boxShadow: '4px 4px 0px -2px',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    borderColor: colors.blackText,

    padding: '2px 18px',
    margin: '10px 0 0 0',

    ':hover': {
      color: colors.whiteBackground,
      backgroundColor: colors.blackText,
      borderColor: colors.whiteBackground
    }
  }
});

export default Warning;