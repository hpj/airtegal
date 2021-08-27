import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

const Warning = ({ storageKey, children }) =>
{
  const { locale, translation } = useTranslation();

  // starts hidden, so it won't appear and disappear again if the user turned it off
  const [ visible, setVisibility ] = useState(false);

  const onClick = () =>
  {
    // hide the warning from UI
    setVisibility(false);

    // set it so the warning won't appear the next time the user opens the page
    localStorage.setItem(storageKey, false);
  };

  // on url change
  useEffect(() =>
  {
    const params = new URL(document.URL)?.searchParams;

    // the quiet param is used for testing
    // so we don't have to click on the warning each test
    if (process.env.NODE_ENV === 'test' && params?.has('quiet'))
      return;
    
    // because the warning starts hidden
    // we need to check if the user didn't accept the warning already
    // if they didn't then we assume it's the first time they open the page and show them the warning
    if (!localStorage.getItem(storageKey))
      setVisibility(true);
  });

  // if the waring is visible
  return visible ?
    <div className={ styles.wrapper }>
      <div className={ styles.container } style={ { direction: locale.direction } }>
        { children }

        <div className={ styles.button } onClick={ onClick }>
          { translation('ok') }
        </div>
      </div>
    </div>
    : <div/>;
};

Warning.propTypes = {
  storageKey: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node ])
};

const styles = createStyle({
  wrapper: {
    zIndex: 20,
    display: 'flex',
    position: 'fixed',

    userSelect: 'none',
    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    textTransform: 'capitalize',

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
    
    whiteSpace: 'pre-wrap',
    margin: 'auto'
  },

  button: {
    cursor: 'pointer',
    width: 'min-content',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    
    border: '3px solid',
    borderColor: colors.blackText,

    padding: '5px 25px',
    margin: '15px 0 0',

    ':hover': {
      color: colors.whiteBackground,
      backgroundColor: colors.blackText,
      borderColor: colors.whiteBackground
    }
  }
});

export default Warning;