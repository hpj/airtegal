import React from 'react';

import PropTypes from 'prop-types';

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
    if (roomData.counter)
    {
      // clear the pervious countdown
      if (this.countdownInterval)
        clearInterval(this.countdownInterval);

      // if counter is number
      // then it's a countdown
      if (typeof roomData.counter === 'number')
      {
        this.countdown = Date.now() + roomData.counter;

        // set a 1s interval
        this.countdownInterval = setInterval(() =>
        {
          const remaining = this.countdown - Date.now();

          if (remaining >= 0)
          {
            this.setState({ counter: this.formatMs(remaining) });
          }
          else
          {
            this.setState({ counter: this.formatMs(0) });

            clearInterval(this.countdownInterval);
          }
        }, 1000);

        // update the counter immediately since the first interval won't execute immediately
        this.setState({ counter: this.formatMs(roomData.counter) });
      }
      // if not display it as is
      else
      {
        this.setState({ counter: roomData.counter });
      }
    }

    this.setState({
      roomState: roomData.state,
      maxPlayers: roomData.options.match.maxPlayers,
      players: roomData.players,
      playerProperties: roomData.playerProperties,
      masterId: roomData.master
    });
  }

  formatMs(milliseconds)
  {
    const minutes = Math.floor(milliseconds / 60000);

    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);

    return `${minutes}:${(seconds < 10) ? '0' : ''}${seconds}`;
  }

  render()
  {
    if (!this.state.players)
      return (<div></div>);

    const isMatch = this.state.roomState === 'match';

    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>

          <div className={ styles.status }>{ this.state.counter }</div>

          <div className={ styles.players }>
            {
              this.state.players.map((playerId) =>
              {
                const isMaster = playerId === this.state.masterId;
                const isClient = playerId === socket.id;
                const isTurn = this.state.playerProperties[playerId].state === 'judging' || this.state.playerProperties[playerId].state === 'playing';

                return <div className={ styles.player } key={ playerId }>

                  <div className={ styles.led } match={ isMatch.toString() } client={ isClient.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }></div>

                  <div className={ styles.name }>{ this.state.playerProperties[playerId].username }</div>

                  <div>{ this.state.playerProperties[playerId].score }</div>

                </div>;
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

Trackbar.propTypes = {
  sendMessage: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'side',

    backgroundColor: colors.trackBarBackground,

    width: '100%',

    borderRadius: '0 15px 15px 0',
    padding: '10px 10px 20px 20px',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '0',
      borderRadius: '0 0 15px 15px'
    }
  },

  container: {
    display: 'grid',
    position: 'relative',

    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"status" "players"',

    userSelect: 'none',

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    width: '100%',
    height: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '0 15px',
      width: 'calc(100% - 30px)',

      maxHeight: '30vh'
    }
  },

  status: {
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    margin: '0 0 0 auto',
    padding: '0 0 15px 0',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '10px 0 10px 0'
    }
  },

  players: {
    width: '100%',
    height: '100%',

    overflowX: 'hidden',
    overflowY: 'scroll',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      display: 'flex',
      flexWrap: 'wrap'
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

    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto',
    
    padding: '0 10px',

    '@media screen and (max-width: 980px)': {
      flexBasis: '100%'
    }
  },

  led: {
    position: 'relative',

    width: '10px',
    height: '10px',

    overflow: 'hidden',
    
    borderRadius: '10px',

    '[client="true"]': {
      background: colors.client
    },

    '[match="false"][master="true"]': {
      background: colors.master
    },

    '[match="false"][client="true"][master="true"]': {
      background: `linear-gradient(90deg, ${colors.client} 50%, rgba(0,0,0,0) 50%, ${colors.master} 50%)`
    },

    '[match="true"][turn="true"]': {
      background: colors.turn
    },

    '[match="true"][client="true"][turn="true"]': {
      background: `linear-gradient(90deg, ${colors.client} 50%, rgba(0,0,0,0) 50%, ${colors.turn} 50%)`
    }
  },

  name: {
    padding: '5px',
    margin: '0 auto',

    wordBreak: 'break-all',
    fontSize: 'calc(6px + 0.35vw + 0.35vh)'
  }
});

export default Trackbar;