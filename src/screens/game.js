import React, { createRef } from 'react';

import ReactDOM from 'react-dom';

import QrcodeScanIcon from 'mdi-react/QrcodeScanIcon';

import RefreshIcon from 'mdi-react/RefreshIcon';

import Brightness2Icon from 'mdi-react/Brightness2Icon';
import Brightness5Icon from 'mdi-react/Brightness5Icon';

import { createStyle, createAnimation } from 'flcss';

import getTheme, { detectDeviceIsDark, opacity } from '../colors.js';

import { ensureSplashScreen, hideSplashScreen } from '../index.js';

import { socket, connect, hasCamera, sendMessage } from '../utils.js';

import ErrorScreen from '../components/error.js';

import TutorialOverlay from '../components/tutorialOverlay';

import UsernameOverlay from '../components/usernameOverlay.js';

import ShareOverlay from '../components/shareOverlay.js';

import CodeOverlay from '../components/codeOverlay.js';

import RoomOverlay from '../components/roomOverlay.js';

import { translation, withTranslation } from '../i18n.js';

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

const colors = getTheme();

/**
* @type { React.RefObject<RoomOverlay> }
*/
const overlayRef = createRef();

/**
* @type { React.RefObject<ShareOverlay> }
*/
export const shareRef = createRef();

/**
* @type { React.RefObject<UsernameOverlay> }
*/
export const usernameRef = createRef();

/**
* @type { React.RefObject<CodeOverlay> }
*/
export const codeRef = createRef();

/** @param { string } error
*/
function errorScreen(error)
{
  ReactDOM.render(<ErrorScreen error={ error }/>, placeholder);

  ReactDOM.unmountComponentAtNode(app);
}

class Game extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      error: '',
      loading: true,

      username: localStorage.getItem?.('username')?.trim() || '',

      size: {
        width: window.innerWidth,
        height: window.innerHeight
      },

      rooms: []
    };

    this.resize = this.resize.bind(this);
    this.visibilityChange = this.visibilityChange.bind(this);

    this.requestRooms = this.requestRooms.bind(this);

    // fix the scroll position
    window.scrollTo(0, 0);

    ensureSplashScreen();

    // connect to the socket io server
    connect()
      // if app connected successfully
      // hide the loading screen
      .then(async(socket) =>
      {
        let username = this.state.username;

        if (!username)
          username = await sendMessage('username') ;

        this.setState({
          username
        }, () =>
        {
          // process url parameters
          const params = new URL(document.URL).searchParams;

          const id = params?.get('join');
          
          // join room
          if (id)
            overlayRef.current.joinRoom(id);
          // create room
          else if (params?.has('create') || params?.has('match'))
            overlayRef.current.createRoom();

          socket.on('error', () => errorScreen(translation('you-were-disconnected')));
          socket.on('disconnect', () => errorScreen(translation('you-were-disconnected')));

          hideSplashScreen();
        });

        this.requestRooms();
      })
      .catch(err => errorScreen(translation(err?.message ?? err)));
  }

  componentDidMount()
  {
    // update the size state when the app is resized
    window.addEventListener('resize', this.resize);

    // disable any dragging functionality in the app
    window.addEventListener('dragstart', this.disableDrag);

    // detect when the app goes in and out of focus
    document.addEventListener('visibilitychange', this.visibilityChange);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('dragstart', this.disableDrag);
    
    document.removeEventListener('visibilitychange', this.visibilityChange);
  }

  requestRooms()
  {
    // show a loading indictor
    this.setState({ loading: true });

    sendMessage('list', 3000)
      .then(rooms =>
      {
        this.setState({
          rooms,
          loading: false
        });
      }).catch(err =>
      {
        this.setState({
          loading: false,
          error: translation(err) ?? err
        });
      });
  }

  switchTheme(value)
  {
    // reverse current setting
    localStorage.setItem('forceDark', value ? 'true' : 'false');

    // refresh page
    location.reload();
  }

  /**
  * @param { UIEvent } e
  */
  disableDrag(e)
  {
    e.preventDefault();
    e.stopPropagation();
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
    if (!document.hidden && !socket.connected)
      window.location.reload();
  }

  render()
  {
    const { locale, translation } = this.props;

    const { loading, error } = this.state;

    const Header = () => <div className={ headerStyles.container } style={ { direction: locale.direction } }>
      <div id={ 'username' } className={ headerStyles.username } onClick={ () => usernameRef.current?.show(this.state.username) }>
        { translation('username-prefix') }

        <div>
          { this.state.username }
        </div>
      </div>
    </div>;

    const Options = () => <div className={ optionsStyles.container } style={ { direction: locale.direction } }>
      <div className={ optionsStyles.buttons }>
        <div id={ 'create-room' } className={ optionsStyles.button } onClick={ () => overlayRef.current?.createRoom() }>{ translation('create-room') }</div>
        <div id={ 'random-room' } className={ optionsStyles.button } onClick={ () => overlayRef.current?.joinRoom() }>{ translation('random-room') }</div>
        {
          hasCamera ? <div id={ 'scan-room' } className={ optionsStyles.button } onClick={ () => codeRef.current?.show({ scan: true }) }>
            <QrcodeScanIcon/>
          </div> : undefined
        }
      </div>

      <div className={ optionsStyles.title }> { translation('available-rooms') }</div>

      {
        detectDeviceIsDark() ?
          <Brightness2Icon id={ 'switch-theme' } className={ optionsStyles.theme } onClick={ () => this.switchTheme(false) }/> :
          <Brightness5Icon id={ 'switch-theme' } className={ optionsStyles.theme } onClick={ () => this.switchTheme(true) }/>
      }

      <RefreshIcon className={ optionsStyles.refresh } data-allowed={ !loading } onClick={ this.requestRooms }/>
    </div>;

    const Rooms = () => <div className={ roomsStyles.container }>
      <div className={ roomsStyles.wrapper }>

        {
          loading ? <div className={ roomsStyles.loading }>
            <div/>
          </div> : undefined
        }

        {
          error ? <div className={ roomsStyles.error }>
            { error }
          </div> : undefined
        }

        <div className={ roomsStyles.rooms } style={ { direction: locale.direction } } data-empty={ translation('no-rooms-available') }>
          {
            this.state.rooms.map((room, i) =>
            {
              return <div key={ i } className={ roomsStyles.room } onClick={ () => overlayRef.current.joinRoom(room.id) }>
                <div className={ roomsStyles.highlights } style={ { direction: locale.direction } }>
                    
                  <div className={ roomsStyles.counter }>
                    <div>{ room.players }</div>
                    <div>{'/'}</div>
                    <div>{ room.options.maxPlayers }</div>
                  </div>

                  { OptionsPreview(room) }
                </div>

                <div className={ roomsStyles.cover }>
                  <div className={ roomsStyles.coverShadow }/>
                  <div className={ roomsStyles.coverBackground }>
                    <div className={ roomsStyles.coverTitle }>{ room.master }</div>
                  </div>
                </div>
              </div>;
            })
          }
        </div>
      </div>
    </div>;

    const OptionsPreview = room =>
    {
      const highlights = [];

      const gameMode = room.options.gameMode;

      highlights.push(`${translation(`mode:${gameMode}`)}.`);

      if (room.options.endCondition === 'limited')
        highlights.push(`${translation('max-rounds', room.options.maxRounds, true)}.`);
      else if (room.options.endCondition === 'timer')
        highlights.push(`${translation('max-time', room.options.maxTime / 60 / 1000, true)}.`);

      if (gameMode === 'kuruit')
      {
        highlights.push(`${translation('hand-cap-lobby', room.options.startingHandAmount, true)}.`);

        if (room.options.blankProbability > 0)
          highlights.push(`%${room.options.blankProbability} ${translation('blank-probability-lobby')}.`);
      }

      return <div>
        {
          highlights.map((s, i) => <div key={ i }>{ s }</div>)
        }
      </div>;
    };

    return <div id={ 'game' } className={ mainStyles.wrapper }>
      <TutorialOverlay size={ this.state.size }/>

      <ShareOverlay ref={ shareRef } size={ this.state.size }/>

      <UsernameOverlay ref={ usernameRef } size={ this.state.size } setUsername={ username => this.setState({ username }) }/>

      <CodeOverlay ref={ codeRef } size={ this.state.size } join={ id => overlayRef.current?.joinRoom(id) }/>

      <RoomOverlay
        ref={ overlayRef }
        size={ this.state.size }
        username={ this.state.username }
        requestRooms={ this.requestRooms }
      />

      <div className={ mainStyles.container }>
        { Header() }
        { Options() }
        { Rooms() }
      </div>
    </div>;
  }
}

const waitingAnimation = createAnimation({
  duration: '2s',
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

    fontWeight: '700',

    padding: '15px 3vw 5px 3vw'
  },

  username: {
    display: 'flex',
    flexDirection: 'row',

    cursor: 'text',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '> div': {
      margin: '0 5px',
      padding: '0 0 5px 0',
      height: 'min-content',
      borderBottom: `2px ${colors.blackText} solid`
    }
  }
});

const optionsStyles = createStyle({
  container: {
    gridArea: 'options',
    display: 'grid',

    gridTemplateColumns: '1fr 1fr auto auto',
    gridTemplateRows: '1fr auto',
    gridTemplateAreas: '"buttons buttons buttons buttons" "title title . ."',

    gap: '15px',
    margin: '15px 0px',

    fontWeight: '700',

    padding: '0 3vw'
  },

  buttons: {
    gridArea: 'buttons',
    display: 'flex',
    gap: '8px',

    '> :nth-child(1)': {
      flexGrow: 1
    },

    '> :nth-child(2)': {
      flexGrow: 1
    },

    '> :nth-child(3)': {
      display: 'flex',
      alignItems: 'center',

      padding: '8px',

      '> svg': {
        width: '20px',
        height: '20px'
      }
    }
  },

  button: {
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    border: '1px solid',
    borderColor: opacity(colors.greyText, 0.25),

    cursor: 'pointer',
    padding: '6px 0',

    textAlign: 'center',

    transform: 'scale(1)',
    transition: 'transform 0.15s, background-color 0.25s, color 0.25s',

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  title: {
    gridArea: 'title',
    fontWeight: '700',
    margin: 'auto 0'
  },

  refresh: {
    width: '24px',
    height: '24px',

    color: colors.blackText,

    padding: '5px',
    cursor: 'pointer',
    borderRadius: '50%',

    transition: 'transform 0.25s',

    '[data-allowed="false"]': {
      pointerEvents: 'none',
      color: colors.greyText
    },

    ':active': {
      transform: 'rotateZ(22deg)'
    }
  },

  theme: {
    extend: 'refresh',
    width: '20px'
  }
});

const roomsStyles = createStyle({
  container: {
    overflow: 'hidden',
    padding: '10px 3vw 0 3vw'
  },

  wrapper: {
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
      boxShadow: `inset 0 0 8px 8px ${colors.optionsScrollbar}`
    }
  },

  rooms: {
    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fill, calc(260px + 1vw + 1vh))',
    gridTemplateRows: 'min-content',
    justifyContent: 'space-around',

    rowGap: 'calc(15px + 2.5vh)',

    ':empty': {
      display: 'block',
      height: '100%',

      ':after': {
        content: 'attr(data-empty)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        height: '100%',
        fontWeight: '700'
      }
    }
  },

  loading: {
    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
    height: '100%',

    backgroundColor: colors.whiteBackground,

    '> div': {
      width: '30px',
      height: '30px',

      border: `10px ${colors.blackText} solid`,
      animation: waitingAnimation
    }
  },

  error: {
    extend: 'loading',
    cursor: 'pointer',

    color: colors.blackText,
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  room: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '20px',

    cursor: 'pointer',
    color: colors.roomForeground,
    backgroundColor: colors.roomBackground,

    width: 'auto',
    height: 'fit-content',
    minHeight: '185px',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '10px 20px',
    margin: '0px 10px',
    borderRadius: '10px',

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  highlights: {
    '> * > *': {
      fontSize: 'calc(8px + 0.25vw + 0.25vh)'
    }
  },

  counter: {
    display: 'flex',
    width: 'min-content',
    margin: '0 0 8px',

    '> div': {
      fontSize: 'calc(9px + 0.35vw + 0.35vh)'
    }
  },

  cover: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center'
  },

  coverBackground: {
    position: 'absolute',
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.blackBackground,

    width: '100%',
    height: 'calc(100% - 40px)',

    overflow: 'hidden',
    borderRadius: '8px',
    
    margin: '-4px 0 0',
    transform: 'rotate(-2deg)'
  },

  coverShadow: {
    extend: 'coverBackground',
    
    backgroundColor: colors.whiteBackground,

    margin: '3px 0 0',
    transform: 'rotate(5deg)'
  },

  coverTitle: {
    color: colors.whiteText,
    
    textAlign: 'center',
    width: 'min-content',

    fontSize: 'calc(8px + 0.25vw + 0.25vh)'
  }
});

export default withTranslation(Game);