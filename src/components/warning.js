import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

const Warning = ({ id, storageKey, children }) =>
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
      <div id={ id } className={ styles.container } style={ { direction: locale.direction } }>
        { children }

        <div className={ styles.button } onClick={ onClick }>
          { translation('ok') }
        </div>
      </div>
    </div>
    : <div/>;
};

Warning.propTypes = {
  id: PropTypes.string,
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
    justifyContent: 'center',

    userSelect: 'none',
    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    textTransform: 'capitalize',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    width: '100vw',
    height: '100vh'
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    color: colors.blackText,
    
    maxWidth: '850px',
    whiteSpace: 'pre-wrap',

    margin: '0 5vw',
    overflow: 'auto',

    '::-webkit-scrollbar':
    {
      width: '6px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '6px',
      boxShadow: `inset 0 0 6px 6px ${colors.handScrollbar}`
    }
  },

  button: {
    cursor: 'pointer',
    width: 'min-content',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    
    border: '3px solid',
    borderColor: colors.blackText,

    padding: '5px 25px',
    margin: '15px 0 15px auto',

    ':hover': {
      color: colors.whiteBackground,
      backgroundColor: colors.blackText,
      borderColor: colors.whiteBackground
    }
  }
});

export default Warning;