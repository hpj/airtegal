import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';

import { StoreComponent } from '../store.js';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme, { opacity } from '../colors.js';

import { createStyle } from 'flcss';

const colors = getTheme();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class RoomState extends StoreComponent
{
  constructor()
  {
    super();

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
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData ||
      changes?.clipboard ||
      changes?.displayMessage
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;

    if (roomData.state === 'lobby')
    {
      clearInterval(this.countdownInterval);

      // set state as players count
      if (locale.direction === 'ltr')
        this.formatted = `${roomData.players.length}/${roomData.options.match.maxPlayers}`;
      else
        this.formatted = `${roomData.options.match.maxPlayers}/${roomData.players.length}`;

      // re-render to show correct counter
      this.forceUpdate();
    }
    else if (this.state.roomData.phase !== roomData.phase)
    {
      clearInterval(this.countdownInterval);

      if (roomData.phase === 'black' || roomData.phase === 'picking' || roomData.phase === 'judging')
      {
        const time = roomData.options.round.maxTime;
  
        this.formatted = this.formatMs(time);
        
        this.countdown = Date.now() + time;
  
        // interval are disabled in end-to-end testing
        
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test')
        {
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
              clearInterval(this.countdownInterval);
              
              this.formatted = this.formatMs(0);
            }
  
            // re-render to show correct counter
            this.forceUpdate();
          }, 1000);
        }
  
        // re-render to show correct counter
        this.forceUpdate();
      }
      else
      {
        this.formatted = '';
      }
    }

    // if lobby clear match state
    if (roomData.state === 'lobby')
      state.displayMessage = undefined;
    
    if (roomData.phase === 'black')
    {
      if (roomData.playerProperties[socket.id]?.state === 'picking')
        state.displayMessage = i18n('picking-phase');
      else
        state.displayMessage = i18n('wait-until-judge-picks');
    }
    else if (roomData.phase === 'picking')
    {
      if (roomData.playerProperties[socket.id]?.state === 'picking')
        state.displayMessage = i18n('picking-phase');
      else
        state.displayMessage = i18n('you-are-the-judge-wait');
    }
    else if (roomData.phase === 'judging')
    {
      if (roomData.playerProperties[socket.id]?.state === 'judging')
        state.displayMessage = i18n('judging-phase');
      else
        state.displayMessage = i18n('wait-until-judge-judges');
    }
    else if (roomData.phase === 'transaction')
    {
      const { id } = roomData.field.find((e) => e.highlight);

      if (id === socket.id)
        state.displayMessage = i18n('you-won-the-round');
      else
        // eslint-disable-next-line security/detect-object-injection
        state.displayMessage = i18n('won-this-round', roomData.playerProperties[id]?.username);
    }

    return state;
  }

  // istanbul ignore next
  shareRoomURL()
  {
    navigator.share({
      title: 'Share Room URL',
      text: i18n('join-me'),
      url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`
    }).catch(console.warn);
  }

  // istanbul ignore next
  copyRoomURL()
  {
    const { addNotification } = this.props;

    navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`)
      .then(() => addNotification(i18n('room-copied-to-clipboard')))
      .catch(console.warn);
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
            <div match={ 'true' } className={ styles.container }>
              <div match={ 'true' } className={ styles.state }>{ this.state.displayMessage }</div>

              <div className={ styles.counter }>{ this.formatted }</div>
            </div>
            :
            <div match={ 'false' } className={ styles.container }>
              <div match={ 'false' } className={ styles.state }>{ this.formatted }</div>

              {
                navigator.share ? <ShareIcon className={ styles.icon } onClick={ this.shareRoomURL }/> :
                  this.state.clipboard ? <CopyIcon className={ styles.icon } onClick={ this.copyRoomURL }/> :
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
    fontSize: 'calc(5px + 0.35vw + 0.35vh)',

    padding: '5px',
    margin: 'auto 0',
    borderBottom: '2px solid',

    '[icon="true"]': {
      cursor: 'pointer',
      color: colors.blackText,
      
      width: 'calc(12px + 0.35vw + 0.35vh)',
      height: 'calc(12px + 0.35vw + 0.35vh)',
      borderBottom: '0'
    }
  },

  icon: {
    extend: 'id',
    cursor: 'pointer',

    overflow: 'visible',
    color: colors.blackText,
    
    width: 'calc(12px + 0.35vw + 0.35vh)',
    height: 'calc(12px + 0.35vw + 0.35vh)',

    padding: '8px',
    borderBottom: '0',
    borderRadius: '100%',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    ':active': {
      transform: 'scale(0.9)'
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

    overflow: 'hidden auto',
    margin: 'auto 0',
    
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