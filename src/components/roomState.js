import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';

import { StoreComponent } from '../store.js';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

const colors = getTheme();

class RoomState extends StoreComponent
{
  constructor()
  {
    super();

    this.current = '';
    this.formatted = '';

    this.countdown = undefined;
    this.countdownInterval = undefined;

    // bind functions that are use as callbacks

    this.shareRoomURL = this.shareRoomURL.bind(this);
    this.copyRoomURL = this.copyRoomURL.bind(this);
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();
    
    if (this.countdownInterval)
      clearInterval(this.countdownInterval);
  }

  /**
  * @param { string[] } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData?.state ||
      changes?.roomData?.counter ||
      changes?.roomData?.judge ||
      changes?.roomData?.options?.gameMode ||
      changes?.roomData?.options?.match?.maxPlayers ||
      changes?.roomData?.players ||
      changes?.roomData?.playerProperties ||
      changes?.roomData?.reason?.message ||
      changes?.roomData?.reason?.details ||
      changes?.matchState)
      return true;
  }

  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;

    // if not display it as is
    if (roomData.state === 'lobby')
    {
      // clear the pervious countdown
      if (this.countdownInterval)
        clearInterval(this.countdownInterval);
      
      // set state as players count
      if (locale.direction === 'ltr')
        this.formatted = `${roomData.players.length}/${roomData.options.match.maxPlayers}`;
      else
        this.formatted = `${roomData.options.match.maxPlayers}/${roomData.players.length}`;

      // re-render to show correct counter
      this.forceUpdate();
    }
    else if (roomData.counter !== this.current)
    {
      this.current = roomData.counter;

      // clear the pervious countdown
      if (this.countdownInterval)
        clearInterval(this.countdownInterval);

      // if counter is number then it's a countdown
      if (typeof roomData.counter === 'number')
      {
        this.countdown = Date.now() + roomData.counter;

        // set a 1s interval
        this.countdownInterval = setInterval(() =>
        {
          const remaining = this.countdown - Date.now();

          if (remaining >= 0)
          {
            this.formatted = this.formatMs(remaining);
          }
          else
          {
            this.formatted = this.formatMs(0);

            clearInterval(this.countdownInterval);
          }

          // re-render to show correct counter
          this.forceUpdate();
        }, 1000);

        // update the counter immediately since the first interval won't execute immediately
        this.formatted = this.formatMs(roomData.counter);

        // re-render to show correct counter
        this.forceUpdate();
      }
    }

    // if lobby clear match state
    if (roomData.state === 'lobby')
    {
      state.matchState = undefined;
    }
    
    if (roomData.options.gameMode === 'king' && roomData.reason.message === 'black-card')
    {
      if (roomData.judge === socket.id)
        state.matchState = i18n('picking-phase');
      else
        state.matchState = i18n('wait-until-judge-picks', roomData.playerProperties[roomData.judge].username);
    }
    else if (roomData.reason.message === 'picking-phase')
    {
      if (roomData.judge === socket.id)
        state.matchState = i18n('you-are-the-judge-wait');
      else
        state.matchState = i18n('picking-phase');
    }
    else if (roomData.reason.message === 'judging-phase')
    {
      if (roomData.judge === socket.id)
        state.matchState = i18n('judging-phase');
      else
        state.matchState = i18n('wait-until-judge-judges', roomData.playerProperties[roomData.judge].username);
    }
    else if (roomData.reason.message === 'voting-phase')
    {
      state.matchState = i18n('voting-phase');
    }
    else if (roomData.reason.message === 'round-ended' && typeof roomData.reason.details === 'number')
    {
      const winnerEntry = roomData.field[roomData.reason.details];

      if (winnerEntry.id === socket.id)
        state.matchState = i18n('you-won-the-round');
      else
        state.matchState = i18n('won-this-round', roomData.playerProperties[winnerEntry.id].username);
    }
    else if (roomData.reason.message === 'round-ended')
    {
      state.matchState = i18n('round-canceled');
    }

    return state;
  }

  shareRoomURL()
  {
    navigator.share({
      title: 'Share Room URL',
      text: i18n('join-me'),
      url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`
    }).catch(() =>
    {
      //
    });
  }

  copyRoomURL()
  {
    const { addNotification } = this.props;

    navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`);

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
    const isMatch = this.state.roomData?.state === 'match';

    return (
      <div className={ styles.wrapper }>
        {
          (isMatch) ?
            <div match='true' className={ styles.container }>
              <div match='true' className={ styles.state }>{ this.state.matchState }</div>

              <div className={ styles.counter }>{ this.formatted }</div>
            </div>
            :
            <div match='false' className={ styles.container }>
              <div match='false' className={ styles.state }>{ this.formatted }</div>

              {
              // share the room
                (navigator.share) ? <ShareIcon icon='true' className={ styles.id } onClick={ this.shareRoomURL }/> :
                // copy the room's id
                  (navigator.clipboard) ? <CopyIcon icon='true' className={ styles.id } onClick={ this.copyRoomURL }/> :
                  // just show the room's id
                    <div className={ styles.id }>{ this.state.roomData?.id }</div>
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