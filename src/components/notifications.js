import React from 'react';

import PropTypes from 'prop-types';

import { useTransition, animated } from 'react-spring';

import { createStyle } from '../flcss.js';

import { locale } from '../i18n.js';

import * as colors from '../colors.js';

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
        const additionalStyles = { zIndex: key };
        
        return <animated.div
          key={ key }
          style={ { ...props, ...additionalStyles } }
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
    zIndex: 99,
    position: 'absolute',

    direction: locale.direction,
    userSelect: 'none',

    pointerEvents: 'none',

    top: 0,
    maxWidth: '100%',
    maxHeight: '100%',

    margin: '0 0 0 calc(15vw + 18px)',

    width: 'calc(100% - (15vw + 18px))',
    height: 'auto',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      display: 'grid',

      gridTemplateColumns: '100vw',
      gridTemplateRows: '100vh',
      gridTemplateAreas: '"notification"',

      width: '100vw',
      height: '100vh',
      
      margin: '0'
    }
  },

  notification: {
    gridArea: 'notification',

    backgroundColor: colors.whiteBackground,
    color: colors.blackText,

    overflow: 'hidden',
    pointerEvents: 'auto',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    maxWidth: '350px',
    height: 'min-content',

    boxShadow: `4px 4px 0 0 ${colors.blackText}`,
    border: `1px solid ${colors.blackText}`,
    borderRadius: '5px',

    padding: '10px',
    margin: '15px auto',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      display: 'flex',
      
      justifyContent: 'center',
      alignItems: 'center',

      maxWidth: '35vw',
      width: '35vw',
      height: '15vh',

      margin: 'auto'
    }
  }
});

export default Notifications;