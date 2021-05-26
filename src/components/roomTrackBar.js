import React from 'react';

import { StoreComponent } from '../store.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

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
    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>
          <div className={ styles.players }>
            {
              this.state.roomData?.players.map((playerId) =>
              {
                const match = this.state.roomData?.state === 'match';
                // eslint-disable-next-line security/detect-object-injection
                const player = this.state.roomData?.playerProperties[playerId];
                
                const turn = player?.state === 'judging' || player?.state === 'picking';

                return <div className={ styles.player } key={ playerId }>
                  <div className={ styles.state } style={ { display: !match ? 'none' : undefined } } turn={ turn.toString() }/>
                  <div className={ styles.name }>{ player?.username }</div>
                </div>;
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'trackBar',

    overflow: 'hidden',
    backgroundColor: colors.trackBarBackground,
    
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
    height: '100%'
  },

  players: {
    gridArea: 'players',

    maxHeight: '100%',
    width: '100%',
    height: 'min-content',

    overflowX: 'hidden',
    overflowY: 'auto',

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.trackBarScrollbar}`
    }
  },

  player: {
    display: 'flex',
    alignItems: 'center',
    direction: locale.direction,

    color: colors.blackText,

    padding: '0 10px 0 10px'
  },

  state: {
    width: '22px',
    height: '6px',
    margin: '0 0 0 12px',
    
    '[turn="true"]': {
      backgroundColor: colors.blackText
    }
  },

  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 'calc(6px + 0.35vw + 0.35vh)',
    padding: '5px 0'
  }
});

export default RoomTrackBar;