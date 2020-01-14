import React from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ContentCopyIcon';

import i18n from '../i18n.js';

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

    this.setState({
      roomId: roomData.id,
      roomState: roomData.state
    });
  }

  shareRoomURL()
  {
    navigator.share({
      title: 'Kuruit Bedan Fash5',
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
    if (!this.state.roomId)
      return <div/>;

    const isMatch = this.state.roomState === 'match';

    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>

          {
            // share the room
            (navigator.share) ? <ShareIcon icon='true' className={ styles.id } match={ isMatch.toString() } onClick={ this.shareRoomURL }/> :
              // copy the room's id
              (navigator.clipboard) ? <CopyIcon icon='true' className={ styles.id } match={ isMatch.toString() } onClick={ this.copyRoomURL }/> :
                // just show the room's id
                <div className={ styles.id } match={ isMatch.toString() } >{ this.state.roomId }</div>
          }

          <div className={ styles.status }>{ this.state.counter }</div>
        </div>
      </div>
    );
  }
}

Trackbar.propTypes = {
  addNotification: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    gridArea: 'counter',

    backgroundColor: colors.trackBarBackground,

    width: '100%',

    padding: '10px 0',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '0'
    }
  },

  container: {
    display: 'grid',
    position: 'relative',

    gridAutoColumns: 'auto 1fr',
    gridTemplateAreas: '"id status"',

    userSelect: 'none',

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    width: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '10px 15px',
      width: 'calc(100% - 30px)'
    }
  },

  id: {
    gridArea: 'id',

    cursor: 'text',
    userSelect: 'all',

    textTransform: 'uppercase',

    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    '[match="true"]': {
      display: 'none'
    },

    '[icon="true"]': {
      cursor: 'pointer',
      fill: colors.blackText,

      width: 'calc(14px + 0.4vw + 0.4vh)',
      height: 'calc(14px + 0.4vw + 0.4vh)'
    }
  },

  status: {
    gridArea: 'status',
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',
    
    whiteSpace: 'pre',

    margin: '0 10px 0 auto'
  }
});

export default Trackbar;