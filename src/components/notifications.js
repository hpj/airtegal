import React from 'react';

import PropTypes from 'prop-types';

import { animated, useTransition } from 'react-spring';

import { createStyle } from '../flcss.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

const colors = getTheme();

const Notifications = ({ notifications }) =>
{
  const transitions = useTransition(notifications, (item) => item.key, {
    from: { opacity: 0 },
    enter: { opacity: 1, delay: 250 },
    leave: { opacity: 0 },
    config: { duration: 250 }
  });

  return <div className={ styles.notifications }>
    {
      transitions.map(({ item, key, props }) =>
      {
        return <animated.div
          key={ key }
          style={ props }
          className={ styles.notification }
          onClick={ item.remove }
        >
          { item.content }
        </animated.div>;
      })
    }
  </div>;
};

Notifications.propTypes = {
  notifications: PropTypes.array.isRequired
};

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