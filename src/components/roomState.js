import React from 'react';

import { StoreComponent } from '../store.js';

import { withTranslation } from '../i18n.js';

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

    // this.music = new Audio();
    // this.audio = new Audio();
  }

  componentDidMount()
  {
    super.componentDidMount();

    // this.music.loop = true;
    
    // this.music.volume = 0;
    // this.audio.volume = 0.95;
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    // this.music.pause();
    // this.audio.pause();
    
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

      // set state as the players count
      this.formatted = `${roomData.players.length}/${roomData.options.maxPlayers}`;

      // re-render to show correct counter
      this.forceUpdate();
    }
    else if (this.state.roomData?.phase !== roomData.phase)
    {
      clearInterval(this.countdownInterval);

      // this.music.pause();
      // this.audio.pause();

      // this.music.currentTime = this.audio.currentTime = 0;

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

      // if (roomData.phase === 'transaction' && roomData.options.gameMode === 'qassa')
      // {
      //   const { composed } = roomData.field[0].story;

      //   try
      //   {
      //     const musicBlob = new Blob([ composed.music ], { 'type': 'audio/mp3' });
      //     const audioBlob = new Blob([ composed.audio ], { 'type': 'audio/mp3' });

      //     this.music.src = window.URL.createObjectURL(musicBlob);
      //     this.audio.src = window.URL.createObjectURL(audioBlob);

      //     // play audio after music starts
      //     this.music.onplaying = () =>
      //     {
      //       this.gracefullyStartAudio(this.music, 0.25, 0.02);

      //       setTimeout(() => this.audio.play(), 1500);
      //     };

      //     // end music after audio ends
      //     this.audio.onended = () =>
      //     {
      //       this.gracefullyMuteAudio(this.music, -0.02);

      //       setTimeout(() => this.music.pause(), 1500);
      //     };
          
      //     if (process.env.NODE_ENV !== 'test')
      //       this.music.play();
      //   }
      //   catch (e)
      //   {
      //     console.error(e);
      //   }
      // }
    }
  }

  // /**
  // * @param { HTMLAudioElement } audio
  // * @param { number } target
  // * @param { number } step
  // */
  // gracefullyStartAudio(audio, target, step)
  // {
  //   audio.volume = Math.min(audio.volume + step, target);

  //   if (audio.volume !== target)
  //     setTimeout(() => this.gracefullyStartAudio(audio, target, step), 100);
  // }

  // /**
  // * @param { HTMLAudioElement } audio
  // * @param { number } step
  // */
  // gracefullyMuteAudio(audio, step)
  // {
  //   audio.volume = Math.max(audio.volume + step, 0);
    
  //   if (audio.volume > 0)
  //     setTimeout(() => this.gracefullyMuteAudio(audio, step), 100);
  // }

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