import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import i18n from '../i18n/eg-AR.json';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import Trackbar from './roomTrackbar.js';
import RoomOptions from './roomOptions.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

const overlayRef = createRef();

const overlayAnimatedX = new Value(0);

class RoomOverlay extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      loadingHidden: true,
      errorHidden: true,
      errorMessage: undefined,

      overlayHolderOpacity: 0,
      overlayHidden: true,
      overlayDrag: true
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);

    // make sure socket is closed before component unmount
    socket.close();
  }

  onRoomData(roomData)
  {
    // handler is only visible if user is on the match's lobby screen
    this.handlerVisibility((roomData.state === 'lobby') ? true : false);
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

          errListen(nonce, i18n['timeout']);
        }, timeout);
      }

      // assign the callbacks
      socket.on('done', doneListen);
      socket.on('err', errListen);
    });
  }

  createRoom()
  {
    const { username } = this.props;

    // show a loading indictor
    this.loadingVisibility(true);

    this.sendMessage('create', { username }).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // show an error message
      this.showErrorMessage(i18n[err] || err);
    });
  }

  joinRoom(id)
  {
    const { username } = this.props;
    
    if (typeof id !== 'string')
      id = undefined;

    // show a loading indictor
    this.loadingVisibility(true);

    this.sendMessage('join', { id, username }).then(() =>
    {
      // hide the loading indictor
      this.loadingVisibility(false);

      // show the room overlay
      overlayRef.current.snapTo({ index: 0 });
    }).catch((err) =>
    {
      // show an error message
      this.showErrorMessage(i18n[err] || err);
    });
  }

  leaveRoom()
  {
    this.sendMessage('leave').catch(console.error);
  }

  showErrorMessage(err)
  {
    this.setState({
      errorHidden: false,
      errorMessage: err
    });
  }

  hideErrorMessage()
  {
    this.setState({
      loadingHidden: true,
      errorHidden: true
    });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  handlerVisibility(visible)
  {
    // make overlay drag-able or un-drag-able (which in returns controls the handler visibility)
    this.setState({ overlayDrag: visible });

    // refresh overlay position to show the handler
    requestAnimationFrame(() => overlayRef.current.snapTo({ index: 0 }));
  }

  onSnap({ index })
  {
    // if the room overlay is hidden then aka sure the server knows that
    // the user isn't in any room
    if (index === 1)
      this.leaveRoom();
  }

  render()
  {
    const { size } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // (size.width * 2) doubles the width to make the max number 0.5
      // instead of 1 because 1 is a complete black background
      // (0.5 - $) reverses the number to make far left 0 and far right 0.5
      this.setState({ overlayHolderOpacity: 0.5 - (value / (size.width * 2)) });

      // hide the overlay and overlay holder when they are off-screen
      if (value >= size.width)
        this.setState({ overlayHidden: true });
      else
        this.setState({ overlayHidden: false });
    });

    // if size is not calculated yet
    if (!size.width)
      return <div/>;
    
    return (
      <div>

        <div style={ {
          display: (this.state.loadingHidden) ? 'none' : ''
        } } className={ styles.loading }
        >
          <div className={ styles.loadingSpinner } style={ {
            // hide loading spinner if error is visible
            display: (this.state.errorHidden) ? '' : 'none'
          } }></div>

          <div className={ styles.error } style={ {
            display: (this.state.errorHidden) ? 'none' : ''
            // on click hide error message
          } } onClick={ this.hideErrorMessage.bind(this) }>
            <div className={ styles.errorMessage }>{this.state.errorMessage}</div>
          </div>
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
            width: (this.state.overlayDrag) ? '100vw' : 'calc(100vw + 28px)',
            height: '100%',

            paddingRight: '20vw'
          } }

          animatedValueX={ overlayAnimatedX }

          dragEnabled={ this.state.overlayDrag }
          
          horizontalOnly={ true }
          initialPosition={ { x: size.width, y: 0 } }
          
          onSnap={ this.onSnap.bind(this) }
          snapPoints={ [ { x: (this.state.overlayDrag) ? 0 : -28 }, { x: size.width } ] }

          boundaries={ {
            left: (this.state.overlayDrag) ? 0 : -28,
            right: size.width
          } }
        >

          <div className={ styles.wrapper }>
            <div className={ styles.handler }/>

            <Trackbar sendMessage={ this.sendMessage.bind(this) }/>

            <div className={ styles.content }>
              {/* <HandOverlay/> */}
              <HandOverlay sendMessage={ this.sendMessage.bind(this) } size={ size } />
              <FieldOverlay sendMessage={ this.sendMessage.bind(this) } size={ size }/>

              <RoomOptions sendMessage={ this.sendMessage.bind(this) }/>
            </div>

          </div>
        
        </Interactable.View>

      </div>
    );
  }
}

RoomOverlay.propTypes = {
  size: PropTypes.object,
  username: PropTypes.string
};

const styles = createStyle({
  wrapper: {
    display: 'grid',

    gridTemplateColumns: 'auto 15vw 1fr',
    gridTemplateRows: '100vh',
    gridTemplateAreas: '"handler side content"',

    width: '100%',
    height: '100%'
    
    // TODO fix the portrait overlay
    // '@media screen and (max-width: 980px)': {
    //   gridTemplateColumns: 'auto 1fr',
    //   gridTemplateRows: 'auto 1fr',
    //   gridTemplateAreas: '"handler side" "handler content"'
    // }
  },

  loading: {
    display: 'flex',
    position: 'fixed',

    alignItems: 'center',
    justifyContent: 'center',
    
    backgroundColor: colors.whiteBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  loadingSpinner: {
    backgroundColor: 'transparent',

    paddingBottom: '5%',
    width: '5%',
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
    backgroundColor: colors.error,
    maxWidth: '60%',

    padding: '6px',
    borderRadius: '5px'
  },

  errorMessage: {
    color: colors.whiteText,
    textTransform: 'capitalize',

    cursor: 'pointer',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  holder: {
    position: 'fixed',
    
    backgroundColor: colors.blackBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  handler: {
    cursor: 'pointer',

    gridArea: 'handler',
    backgroundColor: colors.handler,

    width: '8px',
    height: 'calc(5px + 5%)',

    margin: 'auto 0px auto 10px',
    borderRadius: '8px'
  },

  content: {
    gridArea: 'content'
  }
});

// export default withSize(RoomOverlay);
export default RoomOverlay;