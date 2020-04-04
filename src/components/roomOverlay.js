import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import { StoreComponent } from '../store.js';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { randomLastName } from '../stupidNames.js';

import { createStyle } from '../flcss.js';

import Notifications from './notifications.js';

import RoomTrackBar from './roomTrackBar.js';
import RoomState from './roomState.js';

import RoomOptions from './roomOptions.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

import PocketOverlay from './pocketOverlay.js';

import ShareOverlay from './shareOverlay.js';

import { isTouchScreen } from '../index.js';

const colors = getTheme();

const overlayRef = createRef();
const optionsRef = createRef();

const overlayAnimatedX = new Value(0);

export let requestRoomData;

class RoomOverlay extends StoreComponent
{
  constructor()
  {
    super({
      overlayLoadingHidden: true,
      overlayErrorMessage: '',

      overlayBlockDragging: false,

      notificationsIncremental: 1,
      notifications: [],

      overlayHolderOpacity: 0,
      overlayHidden: true,

      overlayHandlerVisible: true
    });

    this.randoProperties = {};

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    socket.on('roomData', this.onRoomData);
    // socket.on('kicked', this.onKicked);

    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

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
  //   this.store.set({
  //     master: undefined
  //   });

  //   overlayRef.current.snapTo({ index: 1 });
  // }

  onRoomData(roomData)
  {
    // process randos usernames
    roomData.players.forEach(id =>
    {
      // eslint-disable-next-line security/detect-object-injection
      if (roomData.playerProperties[id].rando)
      {
        // eslint-disable-next-line security/detect-object-injection
        roomData.playerProperties[id].username =
        // eslint-disable-next-line security/detect-object-injection
        this.randoProperties[id] =
        // eslint-disable-next-line security/detect-object-injection
        (this.randoProperties[id] || `${i18n('rando')} ${randomLastName()}`);
      }
    });

    // handler is only visible if user is on the match's lobby screen
    this.handlerVisibility((roomData.state === 'lobby') ? true : false);

    if (roomData.state === 'lobby')
    {
      // send notification if the room's master changes
      if (this.state.roomData?.master && this.state.roomData?.master !== roomData.master)
      {
        if (roomData.master === socket.id)
          this.addNotification(i18n('you-are-now-master'));
        else
          this.addNotification(`${roomData.playerProperties[roomData.master].username} ${i18n('new-master')}`);
      }
    }

    // if client was in a match
    // and is about to return to room lobby
    if (this.state.roomData?.state !== roomData.state && this.state.roomData?.state === 'match')
    {
      // reset room options scroll
      if (optionsRef.current)
        optionsRef.current.scrollTo({ top: 0 });
    }
    
    // show that the round ended
    if (roomData.reason.message === 'round-ended')
    {
      if (typeof roomData.reason.details === 'string')
        this.addNotification(i18n(roomData.reason.details) || roomData.reason.details);
    }
    // show that the match ended
    else if (roomData.reason.message === 'match-ended')
    {
      // draw
      if (Array.isArray(roomData.reason.id))
      {
        this.addNotification(
          i18n(`${roomData.reason.details}:match-ended`,
            i18n('no-one-wins')));
      }
      // this client won
      else if (roomData.reason.id === socket.id)
      {
        this.addNotification(
          i18n(`${roomData.reason.details}:match-ended`,
            i18n(`${roomData.options.gameMode}:you`)));
      }
      // a different client won
      else if (
        roomData.playerProperties[roomData.reason.id] ||
        this.randoProperties[roomData.reason.id])
      {
        this.addNotification(
          i18n(`${roomData.reason.details}:match-ended`,
            i18n(`${roomData.options.gameMode}:other`,
              roomData.playerProperties[roomData.reason.id]?.username ||
              this.randoProperties[roomData.reason.id])));
      }
      else
      {
        this.addNotification(i18n(roomData.reason.details) || roomData.reason.details);
      }
    }
    // room's options were changed
    else if (roomData.reason.message === 'options-edit')
    {
      if (roomData.master !== socket.id)
        this.addNotification(i18n('room-edited'));
    }

    this.store.set({
      roomData
    });
  }

  handleTouchStart(e)
  {
    // block dragging if it started 25vw far from the left edge of the screen
    this.store.set({
      overlayBlockDragging: (e.touches[0].pageX > (this.props.size.width / 100) * 25) ? true: false
    });
  }

  handleTouchEnd()
  {
    this.store.set({
      overlayBlockDragging: false
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
      // refresh rooms list
      this.props.requestRooms();
    
      // after leaving the room
      this.store.set({
        field: [],
        hand: [],
        picks: [],
        blanks: [],
        
        entries: [],

        matchState: undefined,
        dirtyOptions: undefined,
        roomData: undefined
      });
    }).catch(console.warn);
  }

  showErrorMessage(err)
  {
    this.store.set({ overlayErrorMessage: err });
  }

  loadingVisibility(visible)
  {
    this.store.set({ overlayLoadingHidden: visible = !visible });
  }

  handlerVisibility(visible)
  {
    // make overlay drag-able or un-drag-able (which in returns controls the handler visibility)
    this.store.set({ overlayHandlerVisible: visible },
      () => overlayRef.current.snapTo({ index: 0 }));
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

    const key = this.state.notificationsIncremental;

    // increase
    this.store.set({
      // set 99 as the limit
      // if it is reached then set as 0
      notificationsIncremental: (key >= 99) ? 0 : key + 1
    });
   
    const item = {
      key: key,
      content: content,
      timestamp: Date.now(),
      remove: this.removeNotification
    };
   
    this.state.notifications.push(item);
   
    this.store.set({ notifications: this.state.notifications });

    // by doing this it makes sure that all the notifications are cleared at once
    // which is more pleasant to the human eye
    if (this.notificationsTimeout)
      clearTimeout(this.notificationsTimeout);
    
    // automatically remove the notification after 2.5 seconds
    this.notificationsTimeout = setTimeout(this.removeNotification, 2500);
  }

  removeNotification()
  {
    this.store.set({ notifications: [] });
    
    this.notificationsTimeout = undefined;
  }

  onSnap({ index })
  {
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
      this.store.set({ overlayHolderOpacity: 0.5 - (Math.round(value) / (size.width * 2)) });

      // hide the overlay and overlay holder when they are off-screen
      // (-5px is to make sure that the overlay is hidden even if tit ends up few pixels off from where it should of been)
      if (Math.round(value) >= size.width)
        this.store.set({ overlayHidden: true });
      else
        this.store.set({ overlayHidden: false });
    });

    // if size is not calculated yet
    if (!size.width)
      return <div/>;

    return (
      <div>
        <Notifications notifications={ this.state.notifications }/>

        <ShareOverlay
          addNotification={ this.addNotification }
          share={ this.state.share }
          hide={ () => this.store.set({ share: { ...this.state.share, active: false } }) }/>

        <div style={ {
          display: (this.state.overlayLoadingHidden) ? 'none' : ''
        } } className={ styles.loading }
        />

        <div className={ styles.error } style={ {
          display: (this.state.overlayErrorMessage) ? '' : 'none'
        } } onClick={ () => this.showErrorMessage('') }>
          <div>{ this.state.overlayErrorMessage }</div>
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
            width: (this.state.overlayHandlerVisible) ? '100vw' : 'calc(100vw + 18px)',
            height: '100%',

            paddingRight: '20vw'
          } }

          animatedValueX={ overlayAnimatedX }

          dragEnabled={ this.state.overlayHandlerVisible && !this.state.overlayBlockDragging }
          
          horizontalOnly={ true }
          initialPosition={ { x: size.width } }
          
          onSnap={ this.onSnap.bind(this) }
          snapPoints={ [ { x: (this.state.overlayHandlerVisible) ? 0 : -18 }, { x: size.width } ] }

          boundaries={ {
            left: (this.state.overlayHandlerVisible) ? 0 : -18,
            right: size.width
          } }
        >
          <div className={ styles.wrapper }>
            <div className={ styles.handlerWrapper }>
              <div className={ styles.handler }/>
            </div>

            <div className={ styles.container }>

              <RoomState addNotification={ this.addNotification }/>

              {/* this instance of trackBar is always enabled on
              non-touch screens or on touch screens in landscape mode */}
              <RoomTrackBar
                enabled={ (!isTouchScreen || size.width >= 1080).toString() }
              />

              <HandOverlay sendMessage={ sendMessage } size={ size } />

              <div className={ styles.content }>
                <FieldOverlay sendMessage={ sendMessage } addNotification={ this.addNotification } size={ size }/>
                
                {
                  (isTouchScreen) ? <PocketOverlay size={ size }/> : <div/>
                }

                {/* this instance of trackBar is only enabled on
                touch screens in portrait mode  */}
                <RoomOptions ref={ optionsRef } sendMessage={ sendMessage }>

                  <RoomTrackBar contained
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
  requestRooms: PropTypes.func.isRequired,
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
    gridTemplateAreas: '"state content" "trackBar content"',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridTemplateColumns: '100%',

      gridTemplateRows: 'auto auto 1fr',
      gridTemplateAreas: '"state" "trackBar" "content"'
    }
  },

  loading: {
    zIndex: 1,
    position: 'fixed',
    backgroundColor: colors.holder,

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
    
    backgroundColor: colors.holder,

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
  }
});

export default RoomOverlay;