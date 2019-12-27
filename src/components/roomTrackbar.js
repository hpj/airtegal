import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';

import i18n, { locale } from '../i18n.js';

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

    this.shareRoomURL = this.shareRoomURL.bind(this);
    this.copyRoomURL = this.copyRoomURL.bind(this);
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
      roomId: roomData.id,
      roomState: roomData.state,
      maxPlayers: roomData.options.match.maxPlayers,
      players: roomData.players,
      playerProperties: roomData.playerProperties,
      masterId: roomData.master
    });
  }

  shareRoomURL()
  {
    navigator.share({
      title: 'Kuruit bedan Fash5',
      text: i18n('join-me'),
      url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomId}`
    });
  }

  copyRoomURL()
  {
    const { addNotification } = this.props;

    navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomId}`);

    addNotification(i18n('room-copied-to-clipboard'));
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

          {
            // share the room
            (navigator.share) ? <ShareIcon icon='true' className={ styles.id } onClick={ this.shareRoomURL }/> :
              // copy the room's id
              (navigator.clipboard) ? <CopyIcon icon='true' className={ styles.id } onClick={ this.copyRoomURL }/> :
                // just show the room's id
                <div className={ styles.id }>{ this.state.roomId }</div>
          }

          <div className={ styles.status }>{ this.state.counter }</div>

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

                  <div className={ styles.led } match={ isMatch.toString() } client={ isClient.toString() } master={ isMaster.toString() } turn={ isTurn.toString() }></div>

                  <div className={ styles.name }>{ player.username }</div>

                  <div>{ player.score }</div>

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
  sendMessage: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired
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
    gridTemplateAreas: '"id status" "players players"',

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

  id: {
    gridArea: 'id',

    userSelect: 'all',
    textTransform: 'uppercase',

    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    padding: '0 0 15px 0',

    '[icon="true"]': {
      fill: colors.blackText,

      width: 'calc(16px + 0.4vw + 0.4vh)',
      height: 'calc(16px + 0.4vw + 0.4vh)'
    },

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '10px 0 10px 0'
    }
  },

  status: {
    gridArea: 'status',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    margin: 'auto 0 auto auto',
    padding: '0 0 15px 0',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '10px 0 10px 0'
    }
  },

  players: {
    gridArea: 'players',

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