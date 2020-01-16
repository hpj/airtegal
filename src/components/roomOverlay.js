import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import Notifications from './notifications.js';

import TrackBar from './roomTrackBar.js';
import Counter from './roomCounter.js';

import RoomOptions from './roomOptions.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

import PocketOverlay from './pocketOverlay.js';

import { isTouchScreen } from '../index.js';

const colors = getTheme();

const overlayRef = createRef();
const optionsRef = createRef();
const adsRef = createRef();

const overlayAnimatedX = new Value(0);

class RoomOverlay extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      loadingHidden: true,
      errorMessage: '',

      blockDragging: false,

      master: undefined,

      incremental: 1,
      notifications: [],

      overlayHolderOpacity: 0,
      overlayHidden: true,

      handlerVisible: true
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);
    // socket.on('kicked', this.onKicked);

    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);
    // socket.off('kicked', this.onKicked);
    
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);

    // make sure socket is closed before component unmount
    socket.close();
  }

  // TODO finish kick logic
  // onKicked()
  // {
  //   // after leaving the room
  //   // clean up some of the state values
  //   this.setState({
  //     master: undefined
  //   });

  //   overlayRef.current.snapTo({ index: 1 });
  // }

  onRoomData(roomData)
  {
    // handler is only visible if user is on the match's lobby screen
    this.handlerVisibility((roomData.state === 'lobby') ? true : false);

    // if players are in the room's lobby
    if (roomData.state === 'lobby')
    {
      // send notification if the room's master changes
      if (this.state.master && this.state.master !== roomData.master)
      {
        if (roomData.master === socket.id)
          this.addNotification(i18n('you-are-now-master'));
        else
          this.addNotification(`${roomData.playerProperties[roomData.master].username} ${i18n('new-master')}`);
      }
    }
    
    if (roomData.roundStarted)
    {
      // this client is the judge for this round
      if (roomData.roundStarted.judgeId === socket.id)
        this.addNotification(i18n('you-are-the-judge'));
    }
    // show that the round ended
    else if (roomData.roundEnded)
    {
      if (roomData.roundEnded.reason)
        this.addNotification(i18n(roomData.roundEnded.reason) || roomData.roundEnded.reason);
    }
    // show that the match ended
    else if (roomData.matchEnded)
    {
      if (roomData.matchEnded.reason)
        this.addNotification(i18n(roomData.matchEnded.reason) || roomData.matchEnded.reason);
      else if (roomData.matchEnded.id === socket.id)
        this.addNotification(i18n('you-won'));
      else if (roomData.playerProperties[roomData.matchEnded.id])
        this.addNotification(`${i18n('match-winner-is')} ${roomData.playerProperties[roomData.matchEnded.id].username}.`);
    }

    this.setState({
      master: roomData.master
    });
  }

  handleTouchStart(e)
  {
    // block dragging if it started 25vw far from the left edge of the screen
    this.setState({
      blockDragging: (e.touches[0].pageX > (this.props.size.width / 100) * 25) ? true: false
    });
  }

  handleTouchEnd()
  {
    this.setState({
      blockDragging: false
    });
  }

  createRoom()
  {
    const { username, sendMessage } = this.props;

    // show a loading indictor
    this.loadingVisibility(true);

    // timeout is 1 minute
    sendMessage('create', { username, region: locale.value }, 60000).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show an error message
      this.showErrorMessage(i18n(err) || err);
    });
  }

  joinRoom(id)
  {
    const { username, sendMessage } = this.props;
    
    if (typeof id !== 'string')
      id = undefined;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('join', { id, username, region: locale.value }).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show an error message
      this.showErrorMessage(i18n(err) || err);
    });
  }

  leaveRoom()
  {
    const { sendMessage } = this.props;

    sendMessage('leave').then(() =>
    {
      // after leaving the room
      // clean up some of the state values
      this.setState({
        master: undefined
      });
    }).catch(console.warn);
  }

  showErrorMessage(err)
  {
    this.setState({ errorMessage: err });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  handlerVisibility(visible)
  {
    // make overlay drag-able or un-drag-able (which in returns controls the handler visibility)
    this.setState({ handlerVisible: visible });

    // refresh overlay position to show the handler
    requestAnimationFrame(() => overlayRef.current.snapTo({ index: 0 }));
  }
  
  /**
  *  @param { string } content
  */
  addNotification(content)
  {
    // add delay between notifications
    if (this.state.notifications.length > 0)
    {
      // delta time of when the last notification appeared
      const delta = Date.now() - this.state.notifications[this.state.notifications.length - 1].timestamp;

      if (delta < 1500)
      {
        // add this notifications when 1.5s are passed
        // from when the last notification was added
        setTimeout(() => this.addNotification(content), 1500 - delta);

        return;
      }
    }

    const key = this.state.incremental;

    // increase
    this.setState({
      // set 99 as the limit
      // if it is reached then set as 0
      incremental: (key >= 99) ? 0 : key + 1
    });
   
    const item = {
      key: key,
      content: content,
      timestamp: Date.now(),
      remove: this.removeNotification
    };
   
    const notifications = this.state.notifications;
   
    notifications.push(item);
   
    this.setState({ notifications: notifications });

    // by doing this it makes sure that all the notifications are cleared at once
    // which is more pleasant to the human eye
    if (this.notificationsTimeout)
      clearTimeout(this.notificationsTimeout);
    
    // automatically remove the notification after 2.5 seconds
    this.notificationsTimeout = setTimeout(this.removeNotification, 2500);
  }

  removeNotification()
  {
    this.setState({ notifications: [] });
    
    this.notificationsTimeout = undefined;
  }

  onSnap({ index })
  {
    // if the room overlay is hidden then aka sure the server knows that
    // the user isn't in any room
    if (index === 1)
    {
      this.leaveRoom();
      
      // reset room options scroll
      if (optionsRef.current)
        optionsRef.current.scrollTo({ top: 0 });
    }
  }

  render()
  {
    const { size, sendMessage } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // (size.width * 2) doubles the width to make the max number 0.5
      // instead of 1 because 1 is a complete black background
      // (0.5 - $) reverses the number to make far left 0 and far right 0.5
      this.setState({ overlayHolderOpacity: 0.5 - (value / (size.width * 2)) });

      // hide the overlay and overlay holder when they are off-screen
      // (-5px is to make sure that the overlay is hidden even if tit ends up few pixels off from where it should of been)
      if (Math.round(value) >= size.width)
      {
        this.setState({ overlayHidden: true });

        // reload ads when overlay is off-screen
        if (adsRef.current)
        {
          adsRef.current.replaceChild(adsRef.current.children[0].cloneNode(), adsRef.current.children[0]);
          adsRef.current.replaceChild(adsRef.current.children[1].cloneNode(), adsRef.current.children[1]);
        }
      }
      else
      {
        this.setState({ overlayHidden: false });
      }
    });

    // if size is not calculated yet
    if (!size.width)
      return <div/>;

    return (
      <div>
        <Notifications notifications={ this.state.notifications }/>

        <div style={ {
          display: (this.state.loadingHidden) ? 'none' : ''
        } } className={ styles.loading }
        />

        <div className={ styles.error } style={ {
          display: (this.state.errorMessage) ? '' : 'none'
        } } onClick={ () => this.showErrorMessage('') }>
          <div>{ this.state.errorMessage }</div>
        </div>

        <div style={ {
          zIndex: 1,
          display: (this.state.overlayHidden) ? 'none' : '',
          opacity: this.state.overlayHolderOpacity || 0
        } } className={ styles.holder }/>
    
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 1,
            position: 'fixed',
            display: (this.state.overlayHidden) ? 'none' : '',

            backgroundColor: colors.whiteBackground,
          
            top: 0,
            width: (this.state.handlerVisible) ? '100vw' : 'calc(100vw + 18px)',
            height: '100%',

            paddingRight: '20vw'
          } }

          animatedValueX={ overlayAnimatedX }

          dragEnabled={ this.state.handlerVisible && !this.state.blockDragging }
          
          horizontalOnly={ true }
          initialPosition={ { x: size.width } }
          
          onSnap={ this.onSnap.bind(this) }
          snapPoints={ [ { x: (this.state.handlerVisible) ? 0 : -18 }, { x: size.width } ] }

          boundaries={ {
            left: (this.state.handlerVisible) ? 0 : -18,
            right: size.width
          } }
        >

          <div className={ styles.wrapper }>
            <div className={ styles.handlerWrapper }>
              <div className={ styles.handler }/>
            </div>

            <div className={ styles.container }>

              <Counter addNotification={ this.addNotification }/>

              {/* this instance of trackBar is always enabled on
              non-touch screens or on touch screens in landscape mode */}
              <TrackBar
                enabled={ (!isTouchScreen || size.width >= 1080).toString() }
              />

              <HandOverlay sendMessage={ sendMessage } size={ size } />

              <div className={ styles.content }>
                <FieldOverlay sendMessage={ sendMessage } size={ size }/>
                
                {
                  (isTouchScreen) ? <PocketOverlay size={ size }/> : <div/>
                }

                {/* this instance of trackBar is only enabled on
                touch screens in portrait mode  */}
                <RoomOptions ref={ optionsRef } sendMessage={ sendMessage }>

                  <div ref={ adsRef } className={ styles.ads }>
                    <iframe src="https://syndication.exdynsrv.com/ads-iframe-display.php?idzone=3665471&output=noscript&type=300x50" width="300" height="50" scrolling="no" marginWidth="0" marginHeight="0" frameBorder="0"/>
                    <iframe src="https://syndication.exdynsrv.com/ads-iframe-display.php?idzone=3665471&output=noscript&type=300x50" width="300" height="50" scrolling="no" marginWidth="0" marginHeight="0" frameBorder="0"/>
                  </div>

                  <TrackBar contained
                    enabled={ (isTouchScreen && size.width < 1080).toString() }
                  />

                </RoomOptions>
              </div>
            </div>

          </div>
        
        </Interactable.View>

      </div>
    );
  }
}

RoomOverlay.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  size: PropTypes.object,
  username: PropTypes.string
};

const styles = createStyle({
  wrapper: {
    display: 'grid',
    
    backgroundColor: colors.trackBarBackground,

    gridTemplateColumns: '18px 1fr',
    gridTemplateRows: '100vh',
    gridTemplateAreas: '"handler ."',

    width: '100%',
    height: '100%',
    
    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridTemplateColumns: '18px calc(100% - 18px)',
      gridTemplateAreas: '"handler ."',

      backgroundColor: colors.whiteBackground
    }
  },

  container: {
    display: 'grid',

    gridTemplateColumns: '15vw 1fr',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"counter content" "trackBar content"',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridTemplateColumns: '100%',
      gridTemplateRows: 'auto auto 1fr',
      gridTemplateAreas: '"counter" "trackBar" "content"'
    }
  },

  loading: {
    zIndex: 1,
    position: 'fixed',
    backgroundColor: colors.blackBackground,

    opacity: 0.5,
    top: 0,

    width: '100vw',
    height: '100vh'
  },

  error: {
    extend: 'loading',
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    textTransform: 'capitalize',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    cursor: 'pointer',
    opacity: 0.85,

    '> div': {
      backgroundColor: colors.error,
      color: colors.whiteText,
  
      padding: '6px',
      borderRadius: '5px'
    }
  },

  holder: {
    position: 'fixed',
    
    backgroundColor: colors.blackBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  handlerWrapper: {
    gridArea: 'handler',

    padding: '0 0 0 10px',
    height: '100vh'
  },

  handler: {
    cursor: 'pointer',

    position: 'relative',
    backgroundColor: colors.handler,

    top: 'calc(50vh - (5px + 5vh) / 2)',
    width: '8px',
    height: 'calc(5px + 5vh)',

    borderRadius: '8px'
  },

  content: {
    position: 'relative',
    gridArea: 'content',

    backgroundColor: colors.whiteBackground
  },

  ads: {
    display: 'flex',
    justifyContent: 'center',

    padding: '10px',

    '@media screen and (max-width: 1080px)': {
      '> iframe:nth-child(1)':
      {
        display: 'none'
      }
    }
  }
});

export default RoomOverlay;