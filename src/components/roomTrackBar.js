import React from 'react';

import PropTypes from 'prop-types';

import CheckIcon from 'mdi-react/CheckIcon';
import WaitingIcon from 'mdi-react/LoadingIcon';

import { StoreComponent } from '../store.js';

import { withTranslation } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

const colors = getTheme();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class RoomTrackBar extends StoreComponent
{
  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (changes?.roomData)
      return true;
  }

  render()
  {
    const { locale } = this.props;

    return <div className={ styles.wrapper }>
      <div className={ styles.container }>
        <div className={ styles.players }>
          {
            this.state.roomData?.players.map((playerId) =>
            {
              const match = this.state.roomData?.state === 'match';
              // eslint-disable-next-line security/detect-object-injection
              const player = this.state.roomData?.playerProperties[playerId];
              
              const turn = player?.state === 'judging' || player?.state === 'picking' || player?.state === 'writing';

              return <div key={ playerId } className={ styles.player } style={ { direction: locale.direction } }>
                {
                  turn ? <WaitingIcon className={ styles.waiting } style={ { display: !match ? 'none' : undefined } }/> :
                    <CheckIcon className={ styles.played } style={ { display: !match ? 'none' : undefined } }/>
                }
                <div className={ styles.name }>{ player?.username }</div>
              </div>;
            })
          }
        </div>
      </div>
    </div>;
  }
}

const waitingAnimation = createAnimation({
  duration: '1s',
  timingFunction: 'ease',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  }
});

RoomTrackBar.propTypes =
{
  t: PropTypes.func,
  locale: PropTypes.object
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'trackBar',

    backgroundColor: colors.trackBarBackground,
    
    overflow: 'hidden auto',
    
    margin: '0px 0px 0px 10px',

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.trackBarScrollbar}`
    },

    '@media screen and (max-width: 1080px)': {
      display: 'none'
    }
  },

  container: {
    position: 'relative',
    userSelect: 'none',
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    width: '100%',
    height: 'min-content'
  },

  players: {
    gridArea: 'players',
    
    height: 'min-content'
  },

  player: {
    display: 'flex',
    alignItems: 'center',
    color: colors.blackText,

    padding: '0 10px'
  },

  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    fontSize: 'calc(6px + 0.35vw + 0.35vh)',
    padding: '15px'
  },

  played: {
    width: 'calc(7px + 0.25vw + 0.25vh)',
    height: 'calc(7px + 0.25vw + 0.25vh)',
    
    color: colors.blackText
  },

  waiting: {
    extend: 'played',
    animation: waitingAnimation
  }
});

export default withTranslation(RoomTrackBar);