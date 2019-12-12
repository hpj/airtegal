import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from '../flcss.js';

import * as colors from '../colors.js';

import { locale } from '../i18n.js';

const Warning = ({ storageKey, style, text, button }) =>
{
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
    // because the warning starts hidden
    // we need to check if the user didn't accept the warning already
    // if they didn't then we assume it's the first time they open the page and show them the warning
    if (!localStorage[storageKey])
      changeVisibility(true);
  }, [ window.location ]);

  // if the waring is visible
  if (visible)
    return (
      <div style={ style } className={ styles.wrapper }>
        <div className={ styles.container }>
          {text}
          <div className={ styles.button } onClick={ onClick }>
            {button}
          </div>
        </div>
      </div>
    );
  else
    return <div/>;
};

Warning.propTypes = {
  storageKey: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 5,
    position: 'fixed',
    backgroundColor: colors.warningBackground,

    top: 0,
    width: '90vw',

    userSelect: 'none',
    padding: '20px 5vw'
  },

  container: {
    color: colors.whiteText,

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    direction: locale.direction,
    maxWidth: '850px',

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
      backgroundColor: 'rgba(0, 0, 0, 0.25)'
    }
  }
});

export default Warning;