import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import i18n from '../i18n.js';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import Notifications from './notifications.js';

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
      errorMessage: '',

      incremental: 1,
      notifications: [],

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
      else
        this.addNotification(`${i18n('match-winner-is')} ${roomData.playerProperties[roomData.matchEnded.id].username}.`);
    }
  }

  createRoom()
  {
    const { username, sendMessage } = this.props;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('create', { username }).then(() =>
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

    sendMessage('join', { id, username }).then(() =>
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

    sendMessage('leave').catch(console.error);
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
    this.setState({ overlayDrag: visible });

    // refresh overlay position to show the handler
    requestAnimationFrame(() => overlayRef.current.snapTo({ index: 0 }));
  }

  
  /**
  *  @param { string } content
  *  @param { string } [timeout] time until the notification automatically dissolve (default is 2.5s)
  */
  addNotification(content, timeout)
  {
    timeout = timeout || 2500;

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
      remove: () => this.removeNotification(item)
    };
   
    const notifications = this.state.notifications;
   
    notifications.push(item);
   
    this.setState({ notifications: notifications });

    // automatically remove the notification after 2.5 seconds
    setTimeout(() => this.removeNotification(item), timeout);
  }

  removeNotification(item)
  {
    const index = this.state.notifications.indexOf(item);

    if (index >= 0)
    {
      const notifications = this.state.notifications;
 
      notifications.splice(index, 1);

      this.setState({ notifications: notifications });
    }
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
        <Notifications notifications={ this.state.notifications }/>

        <div style={ {
          display: (this.state.loadingHidden) ? 'none' : ''
        } } className={ styles.loading }
        >
          <div className={ styles.loadingSpinner }></div>
        </div>

        <div className={ styles.error } style={ {
          display: (this.state.errorMessage) ? '' : 'none'
        } } onClick={ () => this.showErrorMessage('') }>
          <div className={ styles.errorMessage }>{ this.state.errorMessage }</div>
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
            width: (this.state.overlayDrag) ? '100vw' : 'calc(100vw + 18px)',
            height: '100%',

            paddingRight: '20vw'
          } }

          animatedValueX={ overlayAnimatedX }

          dragEnabled={ this.state.overlayDrag }
          
          horizontalOnly={ true }
          initialPosition={ { x: size.width, y: 0 } }
          
          onSnap={ this.onSnap.bind(this) }
          snapPoints={ [ { x: (this.state.overlayDrag) ? 0 : -18 }, { x: size.width } ] }

          boundaries={ {
            left: (this.state.overlayDrag) ? 0 : -18,
            right: size.width
          } }
        >

          <div className={ styles.wrapper }>
            <div className={ styles.handler }/>

            <Trackbar sendMessage={ sendMessage }/>

            <div className={ styles.content }>
              <HandOverlay sendMessage={ sendMessage } size={ size } />
              <FieldOverlay sendMessage={ sendMessage } size={ size }/>

              <RoomOptions sendMessage={ sendMessage }/>
            </div>

          </div>
        
        </Interactable.View>

      </div>
    );
  }
}

RoomOverlay.propTypes = {
  size: PropTypes.object,
  username: PropTypes.string,
  sendMessage: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    display: 'grid',

    gridTemplateColumns: 'auto 15vw 1fr',
    gridTemplateRows: '100vh',
    gridTemplateAreas: '"handler side content"',

    width: '100%',
    height: '100%',
    
    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      gridTemplateColumns: '18px calc(100% - 18px)',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: '"handler side" "handler content"'
    }
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
    extend: 'loading',
    cursor: 'pointer',

    backgroundColor: colors.whiteBackground
  },

  errorMessage: {
    backgroundColor: colors.error,
    color: colors.whiteText,

    textTransform: 'capitalize',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '6px',
    borderRadius: '5px'
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
    gridArea: 'content',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      position: 'relative',
      top: '-15px',
      height: 'calc(100% + 15px)'
    }
  }
});

// export default withSize(RoomOverlay);
export default RoomOverlay;