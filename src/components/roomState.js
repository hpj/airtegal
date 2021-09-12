import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { StoreComponent } from '../store.js';

import { translation, locale, withTranslation } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

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

    this.music = new Audio();
    this.audio = new Audio();

    this.shareRoomURL = this.shareRoomURL.bind(this);
    this.copyRoomURL = this.copyRoomURL.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    this.music.loop = true;
    
    this.music.volume = 0;
    this.audio.volume = 0.95;
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    this.music.pause();
    this.audio.pause();
    
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

    const player = roomData.playerProperties[socket.id];

    if (roomData.state === 'lobby')
    {
      clearInterval(this.countdownInterval);

      // set state as players count
      if (locale().direction === 'ltr')
        this.formatted = `${roomData.players.length}/${roomData.options.maxPlayers}`;
      else
        this.formatted = `${roomData.options.maxPlayers}/${roomData.players.length}`;

      // re-render to show correct counter
      this.forceUpdate();
    }
    else if (this.state.roomData?.phase !== roomData.phase)
    {
      clearInterval(this.countdownInterval);

      this.music.pause();
      this.audio.pause();

      this.music.currentTime = this.audio.currentTime = 0;

      if (roomData.phase === 'picking' || roomData.phase === 'judging')
      {
        this.countdown = roomData.timestamp + roomData.options.roundTime;
          
        // interval are disabled in testing

        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test')
        {
          this.formatted = this.formatMs((this.countdown + 500) - Date.now());

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
        else
        {
          this.formatted = this.formatMs(this.countdown - roomData.timestamp);
        }
  
        // re-render to show correct counter
        this.forceUpdate();
      }
      else
      {
        this.formatted = '';
      }

      if (roomData.phase === 'transaction' && roomData.options.gameMode === 'qassa')
      {
        const { composed } = roomData.field[0].story;

        try
        {
          const musicBlob = new Blob([ composed.music ], { 'type': 'audio/mp3' });
          const audioBlob = new Blob([ composed.audio ], { 'type': 'audio/mp3' });

          this.music.src = window.URL.createObjectURL(musicBlob);
          this.audio.src = window.URL.createObjectURL(audioBlob);

          // play audio after music starts
          this.music.onplaying = () =>
          {
            this.gracefullyStartAudio(this.music, 0.25, 0.02);

            setTimeout(() => this.audio.play(), 1500);
          };

          // end music after audio ends
          this.audio.onended = () =>
          {
            this.gracefullyMuteAudio(this.music, -0.02);

            setTimeout(() => this.music.pause(), 1500);
          };
          
          if (process.env.NODE_ENV !== 'test')
            this.music.play();
        }
        catch (e)
        {
          console.error(e);
        }
      }
    }

    // if lobby clear match state
    state.displayMessage = undefined;
    
    if (!player)
    {
      state.displayMessage = translation('spectating');
    }
    else if (roomData.phase === 'picking')
    {
      if (roomData.playerProperties[socket.id]?.state === 'picking')
        state.displayMessage = translation('picking-phase');
      else
        state.displayMessage = translation('wait-for-your-turn');
    }
    else if (roomData.phase === 'judging')
    {
      if (roomData.playerProperties[socket.id]?.state === 'judging')
        state.displayMessage = translation('judging-phase');
      else
        state.displayMessage = translation('wait-until-judged');
    }
    else if (roomData.phase === 'writing')
    {
      if (roomData.playerProperties[socket.id]?.state === 'writing')
        state.displayMessage = translation('writing-phase');
      else
        state.displayMessage = translation('wait-for-your-turn');
    }
    else if (roomData.phase === 'transaction' && roomData.options.gameMode === 'qassa')
    {
      state.displayMessage = roomData.field[0].story.name;
    }
    else if (roomData.phase === 'transaction')
    {
      const { id } = roomData.field.find(e => e.highlight);

      if (id === socket.id)
        state.displayMessage = translation('you-won-the-round');
      else if (id)
        // eslint-disable-next-line security/detect-object-injection
        state.displayMessage = translation('won-this-round', roomData.playerProperties[id]?.username);
    }

    return state;
  }

  /**
  * @param { HTMLAudioElement } audio
  * @param { number } target
  * @param { number } step
  */
  gracefullyStartAudio(audio, target, step)
  {
    audio.volume = Math.min(audio.volume + step, target);

    if (audio.volume !== target)
      setTimeout(() => this.gracefullyStartAudio(audio, target, step), 100);
  }

  /**
  * @param { HTMLAudioElement } audio
  * @param { number } step
  */
  gracefullyMuteAudio(audio, step)
  {
    audio.volume = Math.max(audio.volume + step, 0);
    
    if (audio.volume > 0)
      setTimeout(() => this.gracefullyMuteAudio(audio, step), 100);
  }

  // istanbul ignore next
  shareRoomURL()
  {
    navigator.share({
      title: 'Share Room URL',
      text: translation('join-me'),
      url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`
    }).catch(console.warn);
  }

  /**
  * @param { HTMLDivElement } element
  * @param { text } value
  */
  setSelection(element, value)
  {
    element.innerHTML = value;

    const range = document.createRange();

    range.selectNodeContents(element);

    document.getSelection().removeAllRanges();
    document.getSelection().addRange(range);
  }

  // istanbul ignore next
  copyRoomURL()
  {
    const { addNotification } = this.props;

    const value = `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`;

    navigator.clipboard.writeText(value)
      .then(() => addNotification(translation('room-copied-to-clipboard')))
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
    const { locale } = this.props;

    const isMatch = this.state.roomData?.state === 'match';

    const value = `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`;

    return <div className={ styles.wrapper }>
      <div data-match={ isMatch } className={ styles.container } style={ { direction: locale.direction } }>
        {
          isMatch ?
            <>
              <div data-match={ true } className={ styles.state }>{ this.state.displayMessage }</div>
              <div className={ styles.counter }>{ this.formatted }</div>
            </>
            :
            <>
              <div data-match={ false } className={ styles.state }>{ this.formatted }</div>

              {
                navigator.share ? <ShareIcon className={ styles.icon } onClick={ this.shareRoomURL }/> :
                  <div className={ styles.id } onClick={ this.copyRoomURL }>{ value }</div>
              }
            </>
        }
      </div>
    </div>;
  }
}

RoomState.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
  addNotification: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'state',

    backgroundColor: colors.trackBarBackground,

    padding: '10px',
    margin: '0px 0px 0px 10px',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      margin: 0,
      padding: '10px 15px'
    }
  },

  container: {
    display: 'grid',
    gridTemplateAreas: '"counter" "state"',
    gridRowGap: '10px',

    userSelect: 'none',

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[data-match="false"]': {
      gridAutoColumns: 'min-content auto',
      gridTemplateAreas: '"state counter"',
      gridColumnGap: '10px'
    },

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridAutoColumns: 'min-content auto',
      gridTemplateAreas: '"state counter"',
      gridColumnGap: '10px'
    }
  },

  id: {
    cursor: 'text',

    userSelect: 'all',
    wordBreak: 'break-word',
    direction: 'ltr',

    fontSize: 'calc(5px + 0.35vw + 0.35vh)',

    padding: '8px',
    margin: '0 auto 0 0',
    borderBottom: '2px solid'
  },

  icon: {
    cursor: 'pointer',

    overflow: 'visible',
    color: colors.blackText,
    
    width: 'calc(12px + 0.35vw + 0.35vh)',
    height: 'calc(12px + 0.35vw + 0.35vh)',

    padding: '8px',
    margin: '0 auto 0 0',
    
    borderBottom: '0',
    borderRadius: '100%',

    ':active': {
      transform: 'scale(0.9)'
    }
  },

  counter: {
    gridArea: 'counter',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',
    margin: '0 auto 0 0'
  },

  state: {
    gridArea: 'state',

    maxHeight: '150px',

    overflow: 'hidden auto',
    margin: 'auto 0',
    
    '[data-match="false"]': {
      fontSize: 'calc(8px + 0.5vw + 0.5vh)'
    },
    
    '[data-match="true"]': {
      textAlign: 'center'
    },

    '@media screen and (max-width: 1080px)': {
      whiteSpace: 'nowrap',

      overflowY: 'hidden',
      textOverflow: 'ellipsis',

      '[data-match="true"]': {
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

export default withTranslation(RoomState);