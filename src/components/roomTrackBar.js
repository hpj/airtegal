import React from 'react';

import PropTypes from 'prop-types';

import { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

const colors = getTheme();

class RoomTrackBar extends React.Component
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
    
    const isContained = (this.props.contained !== undefined);
    const isEnabled = this.props.enabled;

    const isMatch = this.state.roomState === 'match';

    return (
      <div className={ styles.wrapper } contained={ isContained.toString() } enabled={ isEnabled }>
        <div className={ styles.container }>
          <div className={ styles.players } contained={ isContained.toString() }>
            {
              this.state.players.map((playerId) =>
              {
                const isMaster = playerId === this.state.masterId;
                const isClient = playerId === socket.id;

                // eslint-disable-next-line security/detect-object-injection
                const player = this.state.playerProperties[playerId];
                
                const isTurn = player.state === 'judging' || player.state === 'playing';

                return <div className={ styles.player } key={ playerId }>

                  <div className={ styles.score } enabled={ (isMatch && typeof player.score === 'number').toString() }>{ player.score }</div>

                  <div className={ styles.name }>{ player.username }</div>

                  <div className={ styles.clientLed } client={ isClient.toString() } match={ isMatch.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }/>
                  <div className={ styles.stateLed } client={ isClient.toString() } match={ isMatch.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }/>

                </div>;
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

RoomTrackBar.propTypes = {
  contained: PropTypes.bool,
  enabled: PropTypes.string
};

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
    },

    '[enabled="false"]': {
      display: 'none'
    },

    '[contained="true"]': {
      height: '100%'
    }
  },

  container: {
    position: 'relative',
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

    maxHeight: '100%',
    width: '100%',
    height: 'min-content',

    overflowX: 'hidden',
    overflowY: 'auto',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      display: 'flex',
      flexWrap: 'wrap',

      '[contained="false"]': {
        maxHeight: '15vh'
      }
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
    gridGap: '5px',

    alignItems: 'center',
    
    gridTemplateColumns: 'auto auto 1fr auto',
    gridTemplateAreas: '"clientLed stateLed username score"',

    direction: locale.direction,
    
    padding: '0 10px 0 10px',

    '@media screen and (max-width: 1080px)': {
      flexBasis: '100%',
      padding: 0
    }
  },

  stateLed: {
    gridArea: 'stateLed',

    width: '10px',
    height: '10px',
    borderRadius: '10px',

    '[match="false"][master="true"][client="true"]': {
      backgroundColor: colors.master
    },

    '[match="true"][turn="true"][client="true"]': {
      background: colors.turn
    }
  },

  clientLed: {
    gridArea: 'clientLed',
    
    width: '10px',
    height: '10px',
    borderRadius: '10px',

    '[client="true"]': {
      backgroundColor: colors.client
    },

    '[match="false"][master="true"][client="false"]': {
      backgroundColor: colors.master
    },

    '[match="true"][turn="true"][client="false"]': {
      background: colors.turn
    }
  },

  name: {
    gridArea: 'username',
    textAlign: 'center',

    width: 'calc(100% - 10px)',
    
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    padding: '5px 0',
    
    fontSize: 'calc(6px + 0.35vw + 0.35vh)'
  },

  score: {
    gridArea: 'score',

    '[enabled="false"]': {
      display: 'none'
    }
  }
});

export default RoomTrackBar;