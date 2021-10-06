import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import LoadingIcon from 'mdi-react/LoadingIcon';

import { createAnimation, createStyle } from 'flcss';

import stack from '../stack.js';

import { StoreComponent } from '../store.js';

import { socket, sendMessage } from '../utils.js';

import { translation } from '../i18n.js';

import getTheme, { opacity } from '../colors.js';

import Interactable from './interactable.js';

import RoomTrackBar from './roomTrackBar.js';
import RoomState from './roomState.js';

import RoomOptions from './roomOptions.js';

import FieldOverlay from './fieldOverlay.js';

import HandOverlay from './handOverlay.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

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
* @typedef { Object } PlayerProperties
* @property { 'waiting' | 'picking' | 'judging' | 'left' } state
* @property { boolean } rando
* @property { string } username
*/

/**
* @typedef { Object } RoomOptionsT
* @property { 'kuruit' } gameMode
* @property { 'limited' | 'timer' } endCondition
* @property { number } maxPlayers
* @property { number } maxRounds
* @property { number } maxTime
* @property { number } blankProbability
* @property { number } startingHandAmount
* @property { number } randos
* @property { number } roundDelay
* @property { number } roundMaxDelay
* @property { number } roundTime
*/

/**
* @typedef { Object } RoomData
* @property { string } region
* @property { string } id
* @property { string } master
* @property { 'lobby' | 'match' } state
* @property { 'picking' | 'judging' | 'transaction' |
*          'judge-left' | 'judge-timeout' | 'picking-timeout' |
*          'not-enough-players' | 'unhandled' } phase
* @property { number } timestamp
* @property { string[] } players
* @property { Object<string, PlayerProperties> } playerProperties
* @property { { hand: Card[] } } playerSecretProperties
* @property { RoomOptionsT } options
* @property { { id: string, key: string, highlighted: boolean, cards: Card[] }[] } field
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
      overlayError: '',
      overlayLoading: false,

      overlayHandler: true,
      overlayVisible: false,
      overlayOpacity: 0
    });

    this.onRoomData = this.onRoomData.bind(this);
    this.onSnapEnd = this.onSnapEnd.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    socket.on('kicked', this.leave);
    socket.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    socket.off('kicked', this.leave);
    socket.off('roomData', this.onRoomData);

    // make sure socket is closed before component unmount
    socket.close();
  }

  /**
  * @param { RoomData } roomData
  */
  onRoomData(roomData)
  {
    // TODO
    // if (roomData.state === 'lobby')
    // {
    //   // send notification if the room's master changes
    //   if (this.state.roomData?.master && this.state.roomData?.master !== roomData.master)
    //   {
    //     if (roomData.master === socket.id)
    //       this.addNotification(translation('you-are-now-master'));
    //     else
    //       this.addNotification(`${roomData.playerProperties[roomData.master]?.username} ${translation('new-master')}`);
    //   }
    // }

    // TODO
    // show that the round ended
    // if (roomData.phase && roomData.phase !== 'picking' && roomData.phase !== 'judging' && roomData.phase !== 'writing' && roomData.phase !== 'transaction')
    //   this.addNotification(translation(roomData.phase));

    this.store.set({
      roomData,
      // handler is only visible if user is on the match's lobby screen
      overlayHandler: roomData.state === 'lobby'
    });
  }

  leave()
  {
    // hide the room overlay
    interactableRef.current?.snapTo({ index: 0 });
  }

  onSnapEnd(index)
  {
    if (index === 1)
    {
      this.store.set({
        overlayError: '',
        overlayLoading: false
      });
    }
    else
    {
      this.hide();
    }
  }

  createRoom()
  {
    const { username } = this.props;

    const params = new URL(document.URL).searchParams;

    this.store.set({ overlayLoading: true });

    sendMessage('create', { username }).then(() =>
    {
      // enable the wake-lock
      stack.wakelock();

      // register on the back stack
      stack.register(this.leave);

      // spoof a match request for testing purposes
      if (params.has('match'))
        setTimeout(() => optionsRef.current?.matchRequest(), 1500);

      // show the room overlay
      this.store.set({
        overlayVisible: true
      }, () => interactableRef.current?.snapTo({ index: 1 }));
    }).catch(err => this.errorScreen(translation(err) ?? err));
  }

  joinRoom(id)
  {
    const { username } = this.props;
    
    if (typeof id !== 'string')
      id = undefined;

    this.store.set({ overlayLoading: true });

    sendMessage('join', { id, username }).then(() =>
    {
      // enable the wake-lock
      stack.wakelock();

      // register on the back stack
      stack.register(this.leave);

      // show the room overlay
      this.store.set({
        overlayVisible: true
      }, () => interactableRef.current?.snapTo({ index: 1 }));
    }).catch(err => this.errorScreen(translation(err) ?? err));
  }

  errorScreen(overlayError)
  {
    this.store.set({
      overlayLoading: false,
      overlayError: overlayError
    });
  }

  hide()
  {
    if (!this.state.overlayVisible)
      return;

    // release the wake-lock
    stack.release();

    // unregister from the back stack
    stack.unregister(this.leave);
    
    sendMessage('leave').catch(console.warn);

    // refresh rooms list
    this.props.requestRooms();
  
    // after leaving the room
    this.store.set({
      blanks: [],
      entries: [],

      overlayError: '',
      overlayLoading: false,
      overlayVisible: false,
        
      matchState: undefined,
      dirtyOptions: undefined,
      roomData: undefined
    });
  }

  render()
  {
    const { size } = this.props;

    const {
      overlayError,
      overlayLoading,
      overlayHandler,
      overlayOpacity,
      overlayVisible
    } = this.state;

    const onMovement = ({ x }) =>
    {
      this.store.set({
        overlayOpacity: 1 - (x / size.width)
      });
    };

    return <>
      {
        overlayLoading ? <div className={ styles.loading }>
          <LoadingIcon/>
        </div> : undefined
      }

      {
        overlayError ? <div className={ styles.error } onClick={ () => this.errorScreen() }>
          { overlayError }
        </div> : undefined
      }

      <div className={ styles.wrapper } data-visible={ overlayVisible }>

        <div style={ { opacity: overlayOpacity } }/>

        <Interactable
          ref={ interactableRef }

          style={ {
            display: 'flex',
            position: 'fixed',

            width: '100vw',
            height: '100vh'
          } }

          dragEnabled={ overlayHandler }

          horizontalOnly={ true }

          frame={ { pixels: Math.round(size.width * 0.05), every: 8 } }

          boundaries={ {
            left: 0,
            right: size.width
          } }

          initialPosition={ { x: size.width } }

          snapPoints={ [ { x: size.width }, { x: 0 } ] }

          resistance={ { x: size.width * 0.05 } }

          triggers={ [ { x: size.width * 0.25, index: 0 } ] }

          onMovement={ onMovement }
          onSnapEnd={ this.onSnapEnd }
        >

          <div className={ styles.handler } data-visible={ overlayHandler }>
            <div/>
          </div>

          <div className={ styles.container }>

            <RoomState/>

            <RoomTrackBar/>

            <div className={ styles.content }>
              <FieldOverlay size={ size }/>
              <HandOverlay size={ size }/>
              <RoomOptions ref={ optionsRef }y size={ size }/>
            </div>
          </div>
        </Interactable>
      </div>
    </>;
  }
}

RoomOverlay.propTypes = {
  size: PropTypes.object,
  requestRooms: PropTypes.func.isRequired,
  username: PropTypes.string
};

const waitingAnimation = createAnimation({
  duration: '1s',
  timingFunction: 'ease',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  }
});

const styles = createStyle({
  wrapper: {
    zIndex: 3,
    position: 'fixed',

    width: '100vw',
    height: '100vh',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[data-visible="false"]': {
      display: 'none'
    },

    '> :nth-child(1)': {
      position: 'absolute',
      backgroundColor: opacity(colors.whiteBackground, '0.95'),

      width: '100vw',
      height: '100vh'
    }
  },

  loading: {
    zIndex: 1,

    display: 'flex',
    position: 'fixed',
    alignItems: 'center',
    justifyContent: 'center',

    color: opacity(colors.blackText, 0.5),
    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    width: '100vw',
    height: '100vh',

    '> svg': {
      color: colors.blackText,
      animation: waitingAnimation,

      minWidth: '32px',
      minHeight: '32px',
      maxWidth: '64px',
      maxHeight: '64px',
      width: '5vw',
      height: '5vw'
    }
  },

  error: {
    extend: 'loading',
    cursor: 'pointer',

    color: opacity(colors.error, 0.95),

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  handler: {
    gridArea: 'handler',

    backgroundColor: colors.whiteBackground,

    height: '100vh',
    padding: '0 0 0 10px',

    '[data-visible="false"]': {
      display: 'none'
    },

    '> div': {
      position: 'relative',
      backgroundColor: colors.handler,
  
      top: 'calc(50vh - (5px + 5vh) / 2)',
      width: '6px',
      height: '48px',
      borderRadius: '6px'
    }
  },

  container: {
    flexGrow: 1,

    display: 'grid',

    backgroundColor: colors.whiteBackground,

    gridTemplateAreas: '"state content" "trackBar content"',
    gridTemplateColumns: 'minmax(185px, 15vw) 1fr',
    gridTemplateRows: 'auto 1fr',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      gridTemplateAreas: '"state" "trackBar" "content"',
      gridTemplateColumns: '100%',
      gridTemplateRows: 'auto auto 1fr'
    }
  },

  content: {
    position: 'relative',
    gridArea: 'content'
  }
});

export default RoomOverlay;