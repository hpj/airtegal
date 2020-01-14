import React from 'react';

import { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

const colors = getTheme();

class Trackbar extends React.Component
{
  constructor()
  {
    super();

    this.state = {};

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);
  }

  onRoomData(roomData)
  {
    this.setState({
      roomState: roomData.state,
      players: roomData.players,
      playerProperties: roomData.playerProperties,
      masterId: roomData.master
    });
  }

  render()
  {
    if (!this.state.players)
      return <div/>;
    
    const isMatch = this.state.roomState === 'match';

    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>
          <div className={ styles.players }>
            {
              this.state.players.map((playerId) =>
              {
                const isMaster = playerId === this.state.masterId;
                const isClient = playerId === socket.id;

                // eslint-disable-next-line security/detect-object-injection
                const player = this.state.playerProperties[playerId];
                
                const isTurn = player.state === 'judging' || player.state === 'playing';

                return <div className={ styles.player } key={ playerId }>

                  <div className={ styles.score } match={ isMatch.toString() }>{ player.score }</div>

                  <div className={ styles.name }>{ player.username }</div>

                  {
                    (isClient) ? <div className={ styles.clientLed } client={ isClient.toString() } match={ isMatch.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }/> : <div/>
                  }

                  <div className={ styles.stateLed } match={ isMatch.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }/>

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

    backgroundColor: colors.trackBarBackground,

    width: '100%',

    padding: '10px 0',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '0'
    }
  },

  container: {
    // display: 'grid',
    position: 'relative',

    // gridTemplateRows: 'auto 1fr',
    // gridTemplateAreas: '"id status" "players players"',

    userSelect: 'none',

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    width: '100%',
    height: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '0 15px',
      width: 'calc(100% - 30px)'
    }
  },

  players: {
    gridArea: 'players',

    width: '100%',
    height: '100%',

    overflowX: 'hidden',
    overflowY: 'auto',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      display: 'flex',
      flexWrap: 'wrap',

      maxHeight: '15vh'
    },

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
    display: 'grid',

    direction: locale.direction,

    alignItems: 'center',

    gridTemplateColumns: 'auto auto 1fr auto',
    gridTemplateAreas: '"clientLed stateLed username score"',
    
    padding: '0 10px 0 10px',

    '@media screen and (max-width: 1080px)': {
      flexBasis: '100%',

      padding: '0 15px'
    }
  },

  led: {
    position: 'relative',

    width: 0,
    height: 0,

    overflow: 'hidden',
    
    borderRadius: '10px'
  },

  stateLed: {
    extend: 'led',
    gridArea: 'stateLed',

    '[match="false"][master="true"]': {
      background: colors.master,

      width: '10px',
      height: '10px'
    },

    '[match="true"][turn="true"]': {
      background: colors.turn,

      width: '10px',
      height: '10px'
    }
  },

  clientLed: {
    extend: 'led',
    gridArea: 'clientLed',
    
    
    '[client="true"]': {
      background: colors.client,

      width: '10px',
      height: '10px'
    },

    '[match="false"][master="true"]': {
      margin: (locale.direction === 'rtl') ? '0 0 0 5px' : '0 5px 0 0'
    },

    '[match="true"][turn="true"]': {
      margin: (locale.direction === 'rtl') ? '0 0 0 5px' : '0 5px 0 0'
    }
  },

  name: {
    gridArea: 'username',
    textAlign: 'center',

    width: 'calc(100% - 10px)',
    
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    padding: '5px',
    
    fontSize: 'calc(6px + 0.35vw + 0.35vh)'
  },

  score: {
    gridArea: 'score',

    '[match="false"]': {
      display: 'none'
    }
  }
});

export default Trackbar;