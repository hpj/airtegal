import React from 'react';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { withTranslation } from '../i18n.js';

import getTheme from '../colors.js';

import { captureException } from '../utils.js';

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

    this.audio = new Audio();
  }

  componentDidMount()
  {
    super.componentDidMount();

    this.audio.loop = false;
    this.audio.volume = 0.95;
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
    if (changes?.roomData)
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    if (!roomData)
      return;

    if (roomData.state === 'lobby')
    {
      clearInterval(this.countdownInterval);

      // pause audio if it was playing
      this.audio.pause();

      // set state as the players count
      this.formatted = `${roomData.players.length}/${roomData.options.maxPlayers}`;

      // re-render to show correct counter
      this.forceUpdate();
    }
    else if (this.state.roomData?.phase !== roomData.phase)
    {
      clearInterval(this.countdownInterval);

      if (roomData.options.gameMode === 'democracy' && roomData.phase === 'picking')
      {
        try
        {
          if (roomData.field[0].tts instanceof ArrayBuffer)
          {
            const src = window.URL.createObjectURL(new Blob([ roomData.field[0].tts ], { 'type': 'audio/mp3' }));

            if (this.audio.src !== src)
            {
              this.audio.src = src;
              
              this.audio.currentTime = 0;
    
              this.audio.play();
            }
          }
          else
          {
            throw new TypeError('text-to-speech data is not an instance of ArrayBuffer');
          }
        }
        catch (err)
        {
          captureException(err);
        }
      }
      else
      {
        this.audio.pause();
      }

      if (roomData.phase === 'picking' || roomData.phase === 'judging')
      {
        this.countdown = roomData.timestamp + roomData.options.roundTime;
          
        // istanbul ignore if
        // intervals are disabled in testing
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
    }
  }

  formatMs(milliseconds)
  {
    const minutes = Math.floor(milliseconds / 60000);

    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  render()
  {
    const { locale } = this.props;

    const { roomData } = this.state;

    return <div className={ styles.wrapper }>
      <div className={ styles.container } style={ { direction: locale.direction } } data-match={ roomData?.state === 'match' }>
        { this.formatted }
      </div>
    </div>;
  }
}

const styles = createStyle({
  wrapper: {
    gridArea: 'state',

    backgroundColor: colors.trackBarBackground,

    padding: '10px',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      margin: 0,
      padding: '10px 15px'
    }
  },

  container: {
    userSelect: 'none',

    opacity: colors.semitransparent,

    color: colors.blackText,

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.35vw + 0.35vh)',

    '[data-match="false"]': {
      unicodeBidi: 'bidi-override'
    }
  }
});

export default withTranslation(RoomState);