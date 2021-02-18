import React, { createRef } from 'react';
import ReactDOM from 'react-dom';

import RefreshIcon from 'mdi-react/RefreshIcon';
import OptionsIcon from 'mdi-react/CogIcon';

import io from 'socket.io-client';

import { holdLoadingScreen, hideLoadingScreen, remountLoadingScreen } from '../index.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

import * as mocks from '../mocks/io.js';

import stupidNames from '../stupidNames.js';

import AutoSizeInput from '../components/autoSizeInput.js';

import Error from '../components/error.js';
import Warning from '../components/warning.js';

import RoomOverlay from '../components/roomOverlay.js';
import OptionsOverlay from '../components/optionsOverlay.js';

import i18n, { locale } from '../i18n.js';

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

const colors = getTheme();

const overlayRef = createRef();

/** @type { import('socket.io').Socket }
*/
export let socket;

/** @param { string } error
*/
function errorScreen(error)
{
  ReactDOM.render(<Error error={ error }/>, placeholder);

  ReactDOM.unmountComponentAtNode(app);
}

/** connect the socket.io client to the socket.io server
*/
function connect()
{
  return new Promise((resolve, reject) =>
  {
    try
    {
      socket = process.env.NODE_ENV === 'test' ?
        mocks.socket :
        io(process.env.API_ENDPOINT, { path: '/io' });

      socket.once('connect', resolve)
        .once('error', (e) =>
        {
          socket.close();

          reject(e);
        });

      socket.on('disconnect', () =>
      {
        socket.close();

        errorScreen(i18n('you-were-disconnected'));

        reject();
      });

      // connecting timeout
      setTimeout(() =>
      {
        if (!socket.connected)
        {
          socket.close();

          reject('Error: Connecting Timeout');
        }
      }, 3000);
    }
    catch (e)
    {
      socket.close();

      reject(e);
    }
  });
}

class Game extends React.Component
{
  constructor()
  {
    super();

    // check if loading screen is visible
    // if true then hold it
    // if false then remount it
    if (!holdLoadingScreen())
      remountLoadingScreen();

    this.state = {
      loadingHidden: true,
      errorMessage: '',

      // load user preference or use default
      username: localStorage.getItem('username') || stupidNames(),

      size: {},
      rooms: []
    };

    // bind functions that are use as callbacks

    this.resize = this.resize.bind(this);
    this.visibilityChange = this.visibilityChange.bind(this);

    this.requestRooms = this.requestRooms.bind(this);

    // disable back button

    window.history.pushState(undefined, document.title, window.location.href);

    window.addEventListener('popstate', () => window.history.pushState(undefined, document.title,  window.location.href));

    // fix the scroll position
    window.scrollTo(0, 0);

    // connect to the socket.io server
    connect()
      // if app connected successfully
      // hide the loading screen
      .then(() =>
      {
        this.requestRooms();

        hideLoadingScreen();
      })
      .catch((err) =>
      {
        errorScreen(i18n('server-unavailable'));

        console.error(err);
      });
  }

  /**
  * @param { string } eventName
  * @param  { {} } args
  * @param  { number } [timeout]
  */
  sendMessage(eventName, args, timeout)
  {
    return new Promise((resolve, reject) =>
    {
      // nonce is a bunch of random numbers
      const nonce = [
        Math.random() * 32,
        Math.random() * 8
      ].join('.');

      function errListen(n, err)
      {
        if (n !== nonce)
          return;

        socket.off('done', doneListen);
        socket.off('err', errListen);

        reject(err);
      }

      function doneListen(n, data)
      {
        if (n !== nonce)
          return;

        socket.off('done', doneListen);
        socket.off('err', errListen);

        resolve(data);
      }

      // emit the message
      socket.emit(eventName, { nonce, ...args });

      // set a default timeout if 5 seconds
      if (typeof timeout !== 'number')
        timeout = 5000;

      // setup the timeout
      if (typeof timeout === 'number' && timeout > 0)
      {
        setTimeout(() =>
        {
          socket.off('done', doneListen);
          socket.off('err', errListen);

          errListen(nonce, i18n('timeout'));
        }, timeout);
      }

      // assign the callbacks
      socket.on('done', doneListen);
      socket.on('err', errListen);
    });
  }

  requestRooms()
  {
    // show a loading indictor
    this.loadingVisibility(true);

    this.sendMessage('list', { region: locale.value })
      .then((rooms) =>
      {
        // hide the loading indictor
        this.loadingVisibility(false);

        // update the UI
        this.setState({
          rooms: rooms
        });
      }).catch((err) =>
      {
        // hide the loading indictor
        this.loadingVisibility(false);

        // show an error message
        this.showErrorMessage(i18n(err) || err);
      });
  }

  componentDidMount()
  {
    // auto-size the username input-box
    this.resize();

    // auto-size the username input-box on resize
    window.addEventListener('resize', this.resize);

    // disable any dragging functionality in the app
    window.addEventListener('dragstart', this.disableDrag);

    // detect when the app goes in and out of focus
    document.addEventListener('visibilitychange', this.visibilityChange);

    // process url parameters

    const params = new URL(document.URL).searchParams;
    
    // join room
    if (params?.has('join'))
      overlayRef.current.joinRoom(params.get('join'));
    // create room
    else if (params?.has('create'))
      overlayRef.current.createRoom();
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('dragstart', this.disableDrag);
  }

  /**
  * @param { UIEvent } e
  */
  disableDrag(e)
  {
    e.stopPropagation();
    e.preventDefault();
  }

  resize()
  {
    this.setState({
      size: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  visibilityChange()
  {
    if (!socket)
      return;

    // reload the page if we lost connection while
    // the app was in the background
    if (!document.hidden && socket.hidden && socket.disconnected)
      window.location.reload();
    
    socket.hidden = document.hidden;
  }

  showErrorMessage(err)
  {
    this.setState({ errorMessage: err });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  render()
  {
    const Header = () =>
    {
      return (
        <div className={ headerStyles.container }>
          <p className={ headerStyles.welcome }> { i18n('username-prefix') } </p>

          <AutoSizeInput
            id={ 'usrname-input' }
            className={ headerStyles.usrname }
            required
            type={ 'text' }
            maxLength={ 18 }
            placeholder={ i18n('username-placeholder') }
            value={ this.state.username }
            onUpdate={ (value, resize, blur) =>
            {
              const trimmed = (blur) ? value.replace(/\s+/g, ' ').trim() : value.replace(/\s+/g, ' ');

              localStorage.setItem('username', trimmed);

              this.setState({
                username: trimmed
              }, resize);
            } }
          />
        </div>
      );
    };

    const Options = () =>
    {
      return <div className={ optionsStyles.container }>

        <div className={ optionsStyles.buttons }>
          <div id={ 'create-room' } className={ optionsStyles.button } onClick={ () => overlayRef.current.createRoom() }> { i18n('create-room') } </div>
          <div id={ 'random-room' } className={ optionsStyles.button } onClick={ () => overlayRef.current.joinRoom() }> { i18n('random-room') } </div>
        </div>

        <div className={ optionsStyles.title }> { i18n('available-rooms') }</div>

        <RefreshIcon className={ optionsStyles.icon } allowed={ this.state.loadingHidden.toString() } onClick={ this.requestRooms }/>

        <OptionsIcon className={ optionsStyles.icon } onClick={ () => this.setState({ options: { active: true } }) }/>

      </div>;
    };

    const Rooms = () =>
    {
      return <div className={ roomsStyles.container }>
        <div className={ roomsStyles.roomsWrapper }>
          <div style={ {
            display: (this.state.loadingHidden) ? 'none' : ''
          } } className={ roomsStyles.loading }
          >
            <div className={ roomsStyles.loadingSpinner }></div>
          </div>

          <div className={ roomsStyles.error } style={ {
            display: (this.state.errorMessage) ? '' : 'none'
          } } >
            {this.state.errorMessage}
          </div>

          <div className={ roomsStyles.roomsContainer } style={ { display: (this.state.loadingHidden && !this.state.errorMessage) ? '' : 'none' } }>
            {
              (this.state.rooms.length <= 0) ?
                <div className={ roomsStyles.indicator }>
                  { i18n('no-rooms-available') }
                </div>
                :
                this.state.rooms.map((room, i) =>
                {
                  const title = i18n(`${room.options.gameMode}:cover`);

                  return <div key={ i } onClick={ () => overlayRef.current.joinRoom(room.id) } className={ roomsStyles.room }>
                    <div className={ roomsStyles.highlights }>
                      
                      <div className={ roomsStyles.counter }>
                        <div>{room.players}</div>
                        <div>/</div>
                        <div>{ room.options.match.maxPlayers }</div>
                      </div>

                      { RoomHighlights(room) }
                    </div>

                    <div className={ roomsStyles.cover }>
                      <div className={ roomsStyles.coverShadow }/>
                      <div className={ roomsStyles.coverBackground }/>
    
                      <div className={ roomsStyles.coverTitle }>
                        { title }
                      </div>
                    </div>
                  </div>;
                })
            }
          </div>
        </div>
      </div>;
    };

    return (
      <div id={ 'game' } className={ mainStyles.wrapper }>

        <Warning
          fullScreen={ true }
          storageKey={ 'airtegal-adults-warning' }
          text={ i18n('airtegal-adults-warning') }
          button={ i18n('ok') }
        />

        <OptionsOverlay
          options={ this.state.options }
          hide={ () => this.setState({ options: { active: false } }) }
        />

        <div className={ mainStyles.container }>

          { Header() }
          { Options() }
          { Rooms() }

        </div>

        <RoomOverlay
          ref={ overlayRef }
          sendMessage={ this.sendMessage.bind(this) }
          requestRooms={ this.requestRooms }
          size={ this.state.size }
          username={ this.state.username }
        />
      </div>
    );
  }
}

const RoomHighlights = (room) =>
{
  const highlights = [];

  const gameMode = room.options.gameMode;

  // cards based game modes
  if (gameMode === 'judge' || gameMode === 'king')
  {
    if (room.options.winMethod === 'points')
      highlights.push(`${i18n('first-to-points-1')} ${i18n('first-to-points-2', room.options.match.pointsToCollect, true)}.`);
    else if (room.options.winMethod === 'limited')
      highlights.push(`${i18n('max-rounds-1')} ${i18n('max-rounds-2', room.options.match.maxRounds, true)}.`);
    else if (room.options.winMethod === 'timer')
      highlights.push(`${i18n('max-time-1')} ${i18n('max-time-2', room.options.match.maxTime / 60 / 1000, true)}.`);

    if (gameMode === 'king')
    {
      highlights.push(`${room.options.round.maxTime / 60 / 1000} ${i18n('round-countdown')}.`);
    }
    else
    {
      highlights.push(`${i18n('hand-cap-lobby', room.options.match.startingHandAmount, true)}.`);

      if (room.options.match.blankProbability)
        highlights.push(`%${room.options.match.blankProbability} ${i18n('blank-probability:cover')}.`);
    }
  }

  return <div>
    {
      highlights.map((s, i) =>
      {
        return <div key={ i }>{ s }</div>;
      })
    }
  </div>;
};

const mainStyles = createStyle({
  wrapper: {
    width: '100vw',
    height: '100vh',

    backgroundColor: colors.whiteBackground
  },

  container: {
    display: 'grid',

    gridTemplateAreas: '"header" "options" "rooms"',
    gridTemplateRows: 'auto auto 1fr',
    gridTemplateColumns: '100%',

    color: colors.blackText,

    maxWidth: '850px',
    height: '100%',

    userSelect: 'none',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: 'auto'
  }
});

const headerStyles = createStyle({
  container: {
    gridArea: 'header',
    display: 'flex',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',

    direction: locale.direction,
    padding: '15px 3vw 5px 3vw'
  },

  welcome: {
    margin: '0'
  },

  usrname: {
    margin: '0 5px -2px 5px',
    direction: locale.direction,

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: 0,
    border: 0,
    borderBottom: `2px ${colors.blackText} solid`,

    '::placeholder': {
      color: colors.red
    },

    ':focus': {
      'outline': 'none'
    },

    ':not(:valid)':
    {
      borderColor: colors.red
    }
  }
});

const optionsStyles = createStyle({
  container: {
    gridArea: 'options',
    display: 'grid',

    direction: locale.direction,

    gridTemplateColumns: '1fr 1fr auto auto',
    gridTemplateRows: '1fr auto',
    gridTemplateAreas: '"buttons buttons buttons buttons" "title title . ."',

    gridGap: '15px',
    margin: '15px 0px',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',

    padding: '0 3vw'
  },

  buttons: {
    gridArea: 'buttons',
    display: 'grid',

    gridTemplateAreas: '". ."',
    gridColumnGap: '15px'
  },

  button: {
    flexGrow: 1,
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    borderRadius: '5px',
    border: `1px ${colors.blackText} solid`,

    cursor: 'pointer',
    padding: '6px 0',

    transform: 'scale(1)',
    transition: 'transform 0.15s, background-color 0.25s, color 0.25s',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  title: {
    gridArea: 'title',
    fontWeight: '700',

    margin: 'auto 0'
  },

  icon: {
    width: 'calc(12px + 0.55vw + 0.55vh)',
    height: 'calc(12px + 0.55vw + 0.55vh)',

    fill: colors.blackText,
    backgroundColor: colors.whiteBackground,

    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',

    transform: 'rotateZ(0deg) scale(1)',
    transition: 'transform 0.25s, background-color 0.25s, fill 0.25s',

    '[allowed="false"]': {
      pointerEvents: 'none',
      fill: colors.greyText
    },

    ':hover': {
      fill: colors.whiteText,
      backgroundColor: colors.blackBackground,

      transform: 'rotateZ(22deg)'
    },

    ':active': {
      transform: 'scale(0.95) rotateZ(22deg)'
    }
  }
});

const roomsStyles = createStyle({
  container: {
    overflow: 'hidden',

    fontSize: 'calc(8px + 0.2vw + 0.2vh)',
    padding: '10px 3vw 0 3vw'
  },

  roomsWrapper: {
    position: 'relative',
    
    overflowX: 'hidden',
    overflowY: 'auto',

    height: '100%',

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.optionsScrollbar}`
    }
  },

  roomsContainer: {
    display: 'grid',
    direction: locale.direction,

    gridTemplateColumns: 'repeat(auto-fill, calc(260px + 1vw + 1vh))',
    gridTemplateRows: 'min-content',

    justifyContent: 'space-around'
  },

  indicator: {
    display: 'flex',
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    height: '100%',
    
    fontWeight: 700
  },

  loading: {
    zIndex: 1,
    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.whiteBackground,

    top: 0,
    width: '100%',
    height: '100%'
  },

  loadingSpinner: {
    backgroundColor: 'transparent',

    paddingBottom: '30px',
    width: '30px',

    border: `10px ${colors.blackText} solid`,

    animation: createAnimation({
      duration: '2s',
      timingFunction: 'linear',
      iterationCount: 'infinite',
      keyframes: {
        from: {
          transform: 'rotate(0deg)'
        },
        to: {
          transform: 'rotate(360deg)'
        }
      }
    })
  },

  error: {
    extend: 'loading',
    
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  room: {
    display: 'flex',

    cursor: 'pointer',
    color: colors.roomForeground,
    backgroundColor: colors.roomBackground,

    width: 'auto',
    height: 'fit-content',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: '10px 10px 30px 10px',
    borderRadius: '10px',

    ':hover': {
      opacity: '0.75'
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  highlights: {
    direction: locale.direction,

    minHeight: '165px',
    width: 'calc(50% - 40px)',
    height: 'auto',

    margin: '10px 20px'
  },

  counter: {
    display: 'flex',
    fontSize: 'calc(10px + 0.35vw + 0.35vh)',

    width: 'min-content',
    margin: '0 0 5px 0'
  },

  cover: {
    position: 'relative',
    width: '50%'
  },

  coverBackground: {
    position: 'absolute',

    backgroundColor: colors.blackBackground,

    left: 0,
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 30px)',

    overflow: 'hidden',
    borderRadius: '7px',
    
    margin: '15px',
    transform: 'rotate(-2deg)'
  },

  coverShadow: {
    extend: 'coverBackground',
    
    backgroundColor: colors.whiteBackground,

    top: '4px',
    transform: 'rotate(5deg)'
  },

  coverTitle: {
    position: 'absolute',
    display: 'flex',
    
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',

    color: colors.whiteText,
    lineHeight: 'calc(15px + 0.5vw + 0.5vh)',

    left: 0,
    width: 'calc(80% - 20px)',
    height: 'calc(100% - 30px)',

    fontSize: 'calc(10px + 0.2vw + 0.2vh)',
    margin: '15px calc(10% + 15px)'
  }
});

export default Game;