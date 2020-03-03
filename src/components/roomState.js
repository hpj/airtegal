import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import { requestRoomData, room } from './roomOverlay.js';

const colors = getTheme();

class RoomState extends React.Component
{
  constructor()
  {
    super();

    this.state = {};

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);

    this.shareRoomURL = this.shareRoomURL.bind(this);
    this.copyRoomURL = this.copyRoomURL.bind(this);

    requestRoomData().then((roomData) => this.onRoomData(roomData));
  }

  componentDidMount()
  {
    room.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    if (this.countdownInterval)
      clearInterval(this.countdownInterval);

    room.off('roomData', this.onRoomData);
  }

  onRoomData(roomData)
  {
    if (!roomData)
      return;

    if (roomData.counter !== undefined)
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

    // if lobby clear match state
    if (roomData.state === 'lobby')
    {
      this.setState({
        matchState: undefined
      });
    }
    
    let matchState = this.state.matchState;

    if (roomData.options.gameMode === 'king' && roomData.reason.message === 'black-card')
    {
      if (roomData.judge === socket.id)
        matchState = i18n('picking-phase');
      else
        matchState = i18n('wait-until-judge-picks', roomData.playerProperties[roomData.judge].username);
    }
    else if (roomData.reason.message === 'picking-phase')
    {
      if (roomData.judge === socket.id)
        matchState = i18n('you-are-the-judge-wait');
      else
        matchState = i18n('picking-phase');
    }
    else if (roomData.reason.message === 'judging-phase')
    {
      if (roomData.judge === socket.id)
        matchState = i18n('judging-phase');
      else
        matchState = i18n('wait-until-judge-judges', roomData.playerProperties[roomData.judge].username);
    }
    else if (roomData.reason.message === 'voting-phase')
    {
      matchState = i18n('voting-phase');
    }
    else if (roomData.reason.message === 'round-ended' && typeof roomData.reason.details === 'number')
    {
      const winnerEntry = roomData.field[roomData.reason.details];

      if (winnerEntry.id === socket.id)
        matchState = i18n('you-won-the-round');
      else
        matchState = i18n('won-this-round', roomData.playerProperties[winnerEntry.id].username);
    }
    else if (roomData.reason.message === 'round-ended')
    {
      matchState = i18n('round-canceled');
    }

    this.setState({
      roomId: roomData.id,
      roomState: roomData.state,
      matchState
    });
  }

  shareRoomURL()
  {
    navigator.share({
      title: 'Share Room URL',
      text: i18n('join-me'),
      url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomId}`
    }).catch(() =>
    {
      //
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
    if (!this.state.roomId)
      return <div/>;

    const isMatch = this.state.roomState === 'match';

    return (
      <div className={ styles.wrapper }>
        {
          (isMatch) ?
            <div match='true' className={ styles.container }>
              <div match='true' className={ styles.state }>{ this.state.matchState }</div>

              <div className={ styles.counter }>{ this.state.counter }</div>
            </div>
            :
            <div match='false' className={ styles.container }>
              <div match='false' className={ styles.state }>{ this.state.counter }</div>

              {
              // share the room
                (navigator.share) ? <ShareIcon icon='true' className={ styles.id } onClick={ this.shareRoomURL }/> :
                // copy the room's id
                  (navigator.clipboard) ? <CopyIcon icon='true' className={ styles.id } onClick={ this.copyRoomURL }/> :
                  // just show the room's id
                    <div className={ styles.id }>{ this.state.roomId }</div>
              }
            </div>
        }
      </div>
    );
  }
}

RoomState.propTypes = {
  addNotification: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'state',

    backgroundColor: colors.trackBarBackground,

    padding: '10px',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '10px 15px'
    }
  },

  container: {
    display: 'grid',
    gridTemplateAreas: '"counter" "state"',
    gridRowGap: '10px',

    userSelect: 'none',

    direction: locale.direction,

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[match="false"]': {
      gridAutoColumns: '1fr auto',
      gridTemplateAreas: '"state counter"',
      gridColumnGap: '10px'
    },

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridAutoColumns: '1fr auto',
      gridTemplateAreas: '"state counter"',
      gridColumnGap: '10px'
    }
  },

  id: {
    cursor: 'text',
    userSelect: 'all',

    textTransform: 'uppercase',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    margin: 'auto 0',

    '[icon="true"]': {
      cursor: 'pointer',
      fill: colors.blackText,

      width: 'calc(14px + 0.4vw + 0.4vh)',
      height: 'calc(14px + 0.4vw + 0.4vh)'
    }
  },

  counter: {
    gridArea: 'counter',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    margin: 'auto 0'
  },

  state: {
    gridArea: 'state',

    maxHeight: '150px',

    overflowX: 'hidden',
    overflowY: 'auto',
    
    '[match="false"]': {
      fontSize: 'calc(8px + 0.5vw + 0.5vh)'
    },
    
    '[match="true"]': {
      textAlign: 'center'
    },

    '@media screen and (max-width: 1080px)': {
      whiteSpace: 'nowrap',

      overflowY: 'hidden',
      textOverflow: 'ellipsis',

      '[match="true"]': {
        textAlign: 'unset'
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
  }
});

export default RoomState;