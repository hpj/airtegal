import React, { createRef } from 'react';
import ReactDOM from 'react-dom';

import RefreshIcon from 'mdi-react/RefreshIcon';

import autoSizeInput from 'autosize-input';

// eslint-disable-next-line no-unused-vars
import io, { Socket } from 'socket.io-client';

import { API_ENDPOINT, holdLoadingScreen, hideLoadingScreen, remountLoadingScreen } from '../index.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import stupidNames from '../stupidNames.js';

import Error from '../components/error.js';
import Warning from '../components/warning.js';

import RoomOverlay from '../components/roomOverlay.js';

import i18n, { locale } from '../i18n.js';

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

const colors = getTheme();

const inputRef = createRef();
const overlayRef = createRef();

/** @type { Socket }
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
      socket = io(API_ENDPOINT, { path: '/io' });

      socket.once('connect', resolve)
        .once('error', (e) =>
        {
          socket.close();

          reject(e);
        });

      socket.on('disconnect', () =>
      {
        socket.close();

        errorScreen(i18n('server-unavailable'));

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

    this.usernameBlurEvent = this.usernameBlurEvent.bind(this);
    this.usernameChangeEvent = this.usernameChangeEvent.bind(this);

    this.requestRooms = this.requestRooms.bind(this);

    // set the title of this screen
    document.title = 'Kuruit Bedan Fash5';

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

        reject(err);
      }

      function doneListen(n, data)
      {
        if (n !== nonce)
          return;

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

    this.sendMessage('rooms', { region: locale.value })
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

    // process url parameters

    const params = new URL(document.URL).searchParams;
    
    // if there is any parameters in the url
    if (params)
    {
      // join room
      if (params.get('join'))
        overlayRef.current.joinRoom(params.get('join'));
    }

    // TODO show install pinned prompt
    // onInstallPrompt((e) =>
    // {
    //   if (localStorage.getItem('install-prompt-ignore'))
    //     return;
      
    //   this.setState({
    //     pin: {
    //       closeCallback: () =>
    //       {
    //         localStorage.setItem('install-prompt-ignore', true);
  
    //         this.hidePin();
    //       },
    //       title: '',
    //       content: i18n('install-prompt'),
    //       buttons: [ {
    //         title: i18n('install'),
    //         // shows browser's install prompt
    //         callback: () => e.prompt()
    //       } ]
    //     }
    //   });
      
    //   // hide the install prompt when the user installs the pwa
    //   window.addEventListener('appinstalled', () => this.hidePin());
    // });
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
  }

  resize()
  {
    // auto-size the username input-box
    autoSizeInput(inputRef.current);

    this.setState({
      size: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  usernameChangeEvent()
  {
    const username = event.target.value.replace(/\s+/g, ' ');

    this.setState({
      username: username
    }, () => autoSizeInput(inputRef.current));
  }

  usernameBlurEvent()
  {
    const username = event.target.value.replace(/\s+/g, ' ').trim();

    this.setState({
      username: username
    }, () => autoSizeInput(inputRef.current));

    // save the user preference
    localStorage.setItem('username', username);
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
    return (
      <div className={ mainStyles.wrapper }>

        <Warning
          fullScreen={ true }
          storageKey='kbf-adults-warning'
          text={ i18n('kbf-adults-warning') }
          button={ i18n('ok') }
        />

        {/* <div style={ {
          zIndex: 1,

          position: 'absolute',
          display: (this.state.loadingHidden && !this.state.errorMessage) ? 'flex' : 'none',
          justifyContent: 'center',
          
          overflow: 'hidden',

          bottom: 0,
          maxWidth: 'inherit',
          width: '100%'
        } }>
          <iframe src="//a.exdynsrv.com/iframe.php?idzone=3663401&size=468x60" width="468" height="60" scrolling="no" marginWidth="0" marginHeight="0" frameBorder="0"/>
        </div> */}

        <div className={ mainStyles.container }>

          <div className={ headerStyles.container }>

            <p className={ headerStyles.welcome }> { i18n('welcome') } </p>

            <input
              required
              type='text'
              maxLength='18'
              ref={ inputRef }
              className={ headerStyles.username }
              placeholder={ i18n('username-input') }
              value={ this.state.username }
              onBlur={ this.usernameBlurEvent }
              onChange={ this.usernameChangeEvent }
            />

          </div>

          <div className={ optionsStyles.container }>

            <div className={ optionsStyles.button } onClick={ () => overlayRef.current.createRoom() }> { i18n('create-room') } </div>
            <div className={ optionsStyles.button } onClick={ () => overlayRef.current.joinRoom() }> { i18n('random-room') } </div>

          </div>

          <div className={ optionsStyles.ads }>
            <iframe src="https://syndication.exdynsrv.com/ads-iframe-display.php?idzone=3665471&output=noscript&type=300x50" width="300" height="50" scrolling="no" marginwidth="0" marginheight="0" frameborder="0"></iframe>
            <iframe src="https://syndication.exdynsrv.com/ads-iframe-display.php?idzone=3665471&output=noscript&type=300x50" width="300" height="50" scrolling="no" marginwidth="0" marginheight="0" frameborder="0"></iframe>
            <iframe src="https://syndication.exdynsrv.com/ads-iframe-display.php?idzone=3665471&output=noscript&type=300x50" width="300" height="50" scrolling="no" marginwidth="0" marginheight="0" frameborder="0"></iframe>
          </div>

          <div className={ roomsStyles.container }>

            <p className={ roomsStyles.title }> { i18n('available-rooms') } </p>
            <RefreshIcon allowed={ this.state.loadingHidden.toString() } onClick={ this.requestRooms } className={ roomsStyles.refresh }/>

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
                    </div> :
                    this.state.rooms.map((room, i) =>
                    {
                      const pack = room.options.match.selectedPacks[0];

                      return <div key={ i } onClick={ () => overlayRef.current.joinRoom(room.id) } className={ roomsStyles.room }>
                        <div className={ roomsStyles.highlights }>

                          <div className={ roomsStyles.counter }>{ `${room.players}/${room.options.match.maxPlayers}` }</div>
                          <div>{ `${i18n('first-to-points-1')} ${room.options.match.pointsToCollect} ${i18n('first-to-points-2')}.` }</div>

                        </div>

                        <div className={ roomsStyles.packs }>
                          <div style={ {
                            color: pack.foreground_color,
                            backgroundImage: `url(${pack.background_url})`,
                            backgroundColor: pack.background_url
                          } } className={ roomsStyles.pack }>
                            <div className={ roomsStyles.packName }>{ pack.display_name }</div>
                          </div>
                        </div>

                      </div>;
                    })
                }
              </div>
            </div>
          </div>
        </div>

        <RoomOverlay ref={ overlayRef } sendMessage={ this.sendMessage.bind(this) } size={ this.state.size } username={ this.state.username }/>
      </div>
    );
  }
}

const mainStyles = createStyle({
  wrapper: {
    width: '100vw',
    height: '100vh',

    backgroundColor: colors.whiteBackground
  },

  container: {
    display: 'grid',

    gridTemplateAreas: '"header" "options" "." "rooms"',
    gridTemplateRows: 'auto auto auto 1fr',
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

  username: {
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

    gridTemplateAreas: '". ."',
    gridColumnGap: '5%',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',

    padding: '0 3vw'
  },

  button: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    borderRadius: '5px',
    border: `1px ${colors.blackText} solid`,

    cursor: 'pointer',
    padding: '5px 0',
    margin: '5% 0',

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

  ads: {
    display: 'flex',
    justifyContent: 'center',
    maxWidth: 'inherit',

    '@media screen and (max-width: 1080px)': {
      '> iframe:nth-child(1)':
      {
        display: 'none'
      }
    },

    '@media screen and (max-width: 620px)': {
      '> iframe:nth-child(2)':
      {
        display: 'none'
      }
    }
  }
});

const roomsStyles = createStyle({
  container: {
    gridArea: 'rooms',

    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"title refresh" "rooms rooms"',

    direction: locale.direction,
    
    alignItems: 'center',
    overflow: 'hidden',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    padding: '10px 3vw 0 3vw'
  },

  title: {
    gridArea: 'title',
    fontWeight: '700',

    margin: 'auto 0'
  },

  refresh: {
    gridArea: 'refresh',

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
  },

  roomsWrapper: {
    direction: locale.direction,

    gridArea: 'rooms',
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
      keyframes: `
      from { transform:rotate(0deg); }
      to { transform:rotate(360deg); }
      `,
      duration: '2s',
      timingFunction: 'linear',
      iterationCount: 'infinite'
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

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: '10px 10px 30px 10px',
    borderRadius: '10px',

    ':hover': {
      opacity: 0.85
    },

    ':active': {
      opacity: 0.7
    }
  },

  highlights: {
    direction: locale.direction,

    width: 'calc(50% - 40px)',
    height: 'calc(155px - 20px + 1vw + 1vh)',

    margin: '10px 20px'
  },

  counter: {
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    width: 'min-content',
    margin: '0 0 5px 0'
  },

  packs: {
    width: '50%'
  },

  pack: {
    color: colors.whiteText,
    backgroundColor: colors.blackBackground,

    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',

    width: '80%',
    height: '85%',
    
    borderRadius: '10px',
    margin: (locale.direction === 'ltr') ? '35% 20% 0 0' : '35% 0 0 20%'
  },

  packName: {
    display: 'flex',
    
    alignItems: 'center',
    textAlign: 'center',

    lineHeight: 'calc(15px + 0.5vw + 0.5vh)',

    width: 'min-content',
    height: '100%',

    margin: 'auto'
  }
});

export default Game;