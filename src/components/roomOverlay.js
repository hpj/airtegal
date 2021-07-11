import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { StoreComponent } from '../store.js';

import { translation } from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import Notifications from './notifications.js';

import Interactable from './Interactable.js';

import RoomTrackBar from './roomTrackBar.js';
import RoomState from './roomState.js';

import RoomOptions from './roomOptions.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

import ShareOverlay from './shareOverlay.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

/**
* @type { React.RefObject<RoomOptions> }
*/
const optionsRef = createRef();

export let requestRoomData;

/**
* @typedef { Object } Card
* @property { string } id
* @property { string } key
* @property { number } pick
* @property { boolean } blank
* @property { string } content
* @property { 'white' | 'black' } type
*/

/**
* @typedef { Object } Story
* @property { string } key
* @property { string } name
* @property { string } template
* @property { { key: string, value: string, description: string }[] } items
* @property { { text: string, music: ArrayBuffer, audio: ArrayBuffer } } composed
*/

/**
* @typedef { Object } PlayerProperties
* @property { 'waiting' | 'picking' | 'judging' | 'writing' | 'left' } state
* @property { boolean } rando
* @property { string } username
*/

/**
* @typedef { Object } RoomOptionsT
* @property { 'kuruit' | 'qassa' } gameMode
* @property { 'limited' | 'timer' } endCondition
* @property { {
*    maxPlayers: number,
*    maxRounds: number,
*    maxTime: number,
*    blankProbability: number,
*    startingHandAmount: number,
*    randos: boolean
* } } match
* @property { {
*    delay: number,
*    maxDelay: number,
*    maxTime: number
* } } round
*/

/**
* @typedef { Object } RoomData
* @property { string } region
* @property { string } master
* @property { 'lobby' | 'match' } state
* @property { 'picking' | 'judging' | 'transaction' |
*          'judge-left' | 'judge-timeout' | 'picking-timeout' |
*          'writing' |
*          'not-enough-players' | 'unhandled' } phase
* @property { number } timestamp
* @property { string[] } players
* @property { Object<string, PlayerProperties> } playerProperties
* @property { { hand: Card[] } } playerSecretProperties
* @property { RoomOptionsT } options
* @property { { id: string, key: string, highlighted: boolean, cards: Card[], story: Story }[] } field
*/

/**
* @typedef { object } State
* @prop { RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class RoomOverlay extends StoreComponent
{
  constructor()
  {
    super({
      overlayLoadingHidden: true,
      overlayErrorMessage: '',

      notifications: [],

      overlayHolderOpacity: 0,
      overlayHidden: true,

      overlayHandlerVisible: true
    });

    this.onSnapEnd = this.onSnapEnd.bind(this);

    this.onKicked = this.onKicked.bind(this);
    this.onRoomData = this.onRoomData.bind(this);

    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    socket.on('kicked', this.onKicked);
    socket.on('roomData', this.onRoomData);

    const params = new URL(document.URL).searchParams;

    // if testing and there's a match parameter then start a mockup match
    if (process.env.NODE_ENV === 'test' && params.has('notifications'))
    {
      requestAnimationFrame(() =>
      {
        this.addNotification('Test 1');
        this.addNotification('Test 2');
      });
    }
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    socket.off('kicked', this.onKicked);
    socket.off('roomData', this.onRoomData);

    // make sure socket is closed before component unmount
    socket.close();
  }

  onKicked()
  {
    // make sure overlay is closed
    overlayRef.current?.snapTo({ index: 1 });

    this.addNotification(translation('you-were-kicked'));
    
    this.closeOverlay();
  }

  /**
  * @param { RoomData } roomData
  */
  onRoomData(roomData)
  {
    // handler is only visible if user is on the match's lobby screen
    this.handlerVisibility(roomData.state === 'lobby');

    if (roomData.state === 'lobby')
    {
      // send notification if the room's master changes
      if (this.state.roomData?.master && this.state.roomData?.master !== roomData.master)
      {
        if (roomData.master === socket.id)
          this.addNotification(translation('you-are-now-master'));
        else
          this.addNotification(`${roomData.playerProperties[roomData.master]?.username} ${translation('new-master')}`);
      }
    }

    // if client was in a match
    // and is about to return to room lobby
    // then reset room options scroll
    if (this.state.roomData?.state !== roomData.state && this.state.roomData?.state === 'match')
      optionsRef.current?.scrollTo({ top: 0 });
    
    // show that the round ended
    if (roomData.phase && roomData.phase !== 'picking' && roomData.phase !== 'judging' && roomData.phase !== 'writing'&& roomData.phase !== 'transaction')
    {
      this.addNotification(translation(roomData.phase));
    }

    this.store.set({
      roomData
    });
  }

  createRoom()
  {
    const { username, sendMessage } = this.props;

    const params = new URL(document.URL).searchParams;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('create', { username }).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      if (params.has('match'))
        setTimeout(() => optionsRef.current?.matchRequest(), 1500);

      // request a screen wake lock
      navigator.wakeLock?.request('screen')
        .then(wl => this.wakeLock = wl)
        .catch(e => e);

      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show an error message
      this.showErrorMessage(translation(err) || err);
    });
  }

  joinRoom(id)
  {
    const { username, sendMessage } = this.props;
    
    if (typeof id !== 'string')
      id = undefined;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('join', { id, username }).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // request a screen wake lock.
      navigator.wakeLock?.request('screen')
        .then(wl => this.wakeLock = wl)
        .catch(e => e);
      
      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show an error message
      this.showErrorMessage(translation(err) || err);
    });
  }

  leaveRoom()
  {
    const { sendMessage } = this.props;

    sendMessage('leave').then(() => this.closeOverlay)
      .catch(console.error);
  }

  closeOverlay()
  {
    // refresh rooms list
    this.props.requestRooms();

    // release screen wake lock
    this.wakeLock?.release();

    this.wakeLock = undefined;

    // reset room options scroll
    optionsRef.current?.scrollTo({ top: 0 });

    // after leaving the room
    this.store.set({
      blanks: [],
      entries: [],
      matchState: undefined,
      dirtyOptions: undefined,
      roomData: undefined
    });
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
      () => requestAnimationFrame(() => this.forceUpdate(() => overlayRef.current.snapTo({ index: 0 }))));
  }
  
  /**
  *  @param { string } content
  */
  addNotification(content)
  {
    // add delay between notifications
    if (this.state.notifications.length > 0 && process.env.NODE_ENV !== 'test')
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

    const item = {
      content,
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
    if (process.env.NODE_ENV !== 'test')
      this.notificationsTimeout = setTimeout(this.removeNotification, 2500);
  }

  removeNotification()
  {
    this.store.set({ notifications: [] });
    
    this.notificationsTimeout = undefined;
  }

  onSnapEnd(index)
  {
    if (index === 1)
      this.leaveRoom();
  }

  render()
  {
    const { size, sendMessage } = this.props;

    const onMovement = ({ x }) =>
    {
      this.store.set({
        overlayHolderOpacity: 0.5 - (x / (size.width * 2))
      });

      // hide the overlay and overlay holder when they are off-screen
      this.store.set({
        overlayHidden: x >= size.width ? true : false
      });
    };

    // if size is not calculated yet
    if (!size.width)
      return <div/>;

    return <div>
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

      <Interactable
        ref={ overlayRef }

        style={ {
          zIndex: 1,

          position: 'fixed',
          display: (this.state.overlayHidden) ? 'none' : '',

          backgroundColor: colors.whiteBackground,
          
          width: (this.state.overlayHandlerVisible) ? '100vw' : 'calc(100vw + 18px)'
        } }

        horizontalOnly={ true }
        
        dragEnabled={ this.state.overlayHandlerVisible }

        dragArea={ { width: { percent: 25, size: size.width } } }
        frame={ { pixels: Math.round(size.width * 0.05), every: 8 } }

        initialPosition={ { x: size.width } }
          
        boundaries={ {
          left: (this.state.overlayHandlerVisible) ? 0 : -18,
          right: size.width
        } }

        snapPoints={ [ { x: (this.state.overlayHandlerVisible) ? 0 : -18 }, { x: size.width } ] }

        onMovement={ onMovement }
        onSnapEnd={ this.onSnapEnd }
      >
        <div className={ styles.wrapper }>
          <div className={ styles.handlerWrapper }>
            <div className={ styles.handler }/>
          </div>

          <div className={ styles.container }>
            <RoomState addNotification={ this.addNotification }/>
            <RoomTrackBar/>

            <HandOverlay sendMessage={ sendMessage } size={ size }/>

            <div className={ styles.content }>
              <FieldOverlay sendMessage={ sendMessage } size={ size }/>
              <RoomOptions ref={ optionsRef } sendMessage={ sendMessage } addNotification={ this.addNotification }/>
            </div>
          </div>

        </div>
      </Interactable>
    </div>;
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

    minHeight: '32px',
    maxHeight: '64px',

    borderRadius: '8px'
  },

  content: {
    position: 'relative',
    gridArea: 'content',

    backgroundColor: colors.whiteBackground
  }
});

export default RoomOverlay;