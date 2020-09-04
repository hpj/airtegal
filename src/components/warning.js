import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

const colors = getTheme();

const Warning = ({ fullScreen, storageKey, text, button }) =>
{
  // starts hidden, so it won't appear and disappear again if the user turned it off
  const [ visible, changeVisibility ] = useState(false);

  fullScreen = fullScreen || false;

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
  if (visible)
    return (
      <div fullscreen={ fullScreen.toString() } className={ styles.wrapper }>
        <div className={ styles.container }>
          {text}
          <div id={ 'warning-button' } className={ styles.button } onClick={ onClick }>
            {button}
          </div>
        </div>
      </div>
    );
  else
    return <div/>;
};

Warning.propTypes = {
  fullScreen: PropTypes.bool,
  storageKey: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 20,
    position: 'fixed',
    backgroundColor: colors.pinnedBackground,

    userSelect: 'none',

    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    top: 0,
    width: '90vw',
    padding: '12vh 5vw',

    '[fullscreen="true"]': {
      backgroundColor: colors.whiteBackground,

      display: 'flex',
      height: '76vh'
    },

    '[fullscreen="true"] > div': {
      color: colors.blackText
    },

    '[fullscreen="true"] > div > div': {
      borderColor: colors.blackText
    },

    '[fullscreen="true"] > div > div:hover': {
      color: colors.whiteBackground,
      backgroundColor: colors.blackText
    }
  },

  container: {
    color: colors.whiteText,

    direction: locale.direction,
    maxWidth: '850px',
    height: 'min-content',

    margin: 'auto'
  },

  button: {
    width: 'min-content',

    cursor: 'pointer',
    
    border: '2px solid',
    borderColor: colors.whiteText,

    margin: '10px 0 0 0',
    padding: '2px 18px',

    ':hover': {
      color: colors.pinnedBackground,
      backgroundColor: colors.whiteText
    }
  }
});

export default Warning;