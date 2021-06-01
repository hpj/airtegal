import React from 'react';

import PropTypes from 'prop-types';

import { createStyle, createAnimation } from 'flcss';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

const colors = getTheme();

const Notifications = ({ notifications }) =>
{
  return <div className={ styles.notifications }>
    {
      notifications?.map((item, i) =>
      {
        return <div
          key={ i }
          className={ `${styles.notification } game-notification` }
          onClick={ item.remove }
        >
          { item.content }
        </div>;
      })
    }
  </div>;
};

Notifications.propTypes = {
  notifications: PropTypes.array.isRequired
};

const enterAnimation = createAnimation({
  keyframes: {
    from: {
      opacity: '0.35'
    },
    to: {
      opacity: '1'
    }
  },
  duration: '0.25s',
  timingFunction: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
  iterationCount: '1'
});

const styles = createStyle({
  notifications: {
    zIndex: 10,
    position: 'absolute',

    direction: locale.direction,

    userSelect: 'none',
    pointerEvents: 'none',

    top: 0,
    maxWidth: '100%',
    maxHeight: '100%',

    width: 'calc(100% - 15vw)',
    height: 'auto',
    
    margin: '0 0 0 15vw',
    
    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      width: '100%',
      margin: 0
    }
  },

  notification: {
    backgroundColor: colors.whiteBackground,
    color: colors.blackText,

    animation: enterAnimation,

    overflow: 'hidden',
    pointerEvents: 'auto',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    maxWidth: '350px',
    height: 'min-content',

    boxShadow: `4px 4px 0 0 ${colors.blackText}`,
    border: `1px solid ${colors.blackText}`,
    borderRadius: '5px',

    padding: '10px',
    margin: '15px auto'
  }
});

export default Notifications;