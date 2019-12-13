import React from 'react';

import PropTypes from 'prop-types';

import { useTransition, animated } from 'react-spring';

import { createStyle } from '../flcss.js';

import { locale } from '../i18n.js';

import * as colors from '../colors.js';

const Notifications = ({ notifications }) =>
{
  const transitions = useTransition(notifications, undefined, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 120, friction: 14 }
  });

  return <div className={ styles.notifications }>
    {
      transitions.map(({ item, key, props }) =>
      {
        return <animated.div
          key={ key }
          style={ props }
          className={ styles.notification }
          onMouseEnter={ item.remove }
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
    zIndex: 99,
    position: 'absolute',

    direction: locale.direction,
    userSelect: 'none',

    top: 0,
    width: '100%',
    height: 'auto'
  },

  notification: {
    backgroundColor: colors.whiteBackground,
    color: colors.blackText,

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    maxWidth: '350px',

    boxShadow: `4px 4px 0 0 ${colors.blackText}`,
    border: `1px solid ${colors.blackText}`,
    borderRadius: '5px',

    padding: '10px',
    margin: '15px auto'
  }
});

export default Notifications;