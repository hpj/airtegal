import React from 'react';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { useTranslation } from '../i18n.js';

import getTheme from '../colors.js';

const colors = getTheme();

/**
* @param { { notifications: { content: string, timestamp: number, remove: () => void }[] } } param0
*/
const Notifications = ({ notifications }) =>
{
  const { locale } = useTranslation();

  return <TransitionGroup className={ styles.notifications } style={ { direction: locale.direction } }>
    {
      notifications?.map(item => <CSSTransition key={ item.timestamp } timeout={ 350 }>
        <div
          className={ `${styles.notification } game-notification` }
          onClick={ item.remove }
        >
          { item.content }
        </div>
      </CSSTransition>)
    }
  </TransitionGroup>;
};

Notifications.propTypes = {
  notifications: PropTypes.array.isRequired
};

const styles = createStyle({
  notifications: {
    zIndex: 30,
    position: 'absolute',

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
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    maxWidth: '350px',
    height: 'min-content',

    boxShadow: `4px 4px 0 0 ${colors.blackText}`,
    border: `1px solid ${colors.blackText}`,
    borderRadius: '5px',

    padding: '10px',
    margin: '15px auto',

    '.enter': {
      opacity: 0
    },
    
    '.enter-active': {
      opacity: 1,
      transition: 'opacity 0.35s'
    },

    '.exit': {
      opacity: 1
    },

    '.exit-active': {
      opacity: 0,
      transition: 'opacity 0.35s'
    }
  }
});

export default Notifications;