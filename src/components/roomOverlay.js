import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import withSize from '../react-size.js';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import Trackbar from './roomTrackbar.js';
import RoomContent from './roomContent.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

const overlayRef = createRef();

const handOverlayRef = createRef();
const fieldOverlayRef = createRef();

const overlayAnimatedX = new Value(0);

class RoomOverlay extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      overlayHolderOpacity: 0,
      overlayHidden: true,
      overlayDrag: true
    };

    this.handlerVisibility.bind(this);
  }

  createRoom()
  {
    const { username } = this.props;
    
    overlayRef.current.snapTo({ index: 0 });

    socket.emit('create', { username: username });
  }

  joinRoom(id)
  {
    const { username } = this.props;
    
    overlayRef.current.snapTo({ index: 0 });

    if (typeof id !== 'string')
      id = undefined;
  
    socket.emit('join', { username: username, id: id });
  }

  leaveRoom()
  {
    socket.emit('leave');
  }

  startGame()
  {
    this.handlerVisibility(false);
    
    handOverlayRef.current.visibility(true);
    fieldOverlayRef.current.visibility(true);
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

    // // if size is not calculated yet
    if (!size.width)
      return <div/>;
    
    return (
      <div>

        <div style={{
          zIndex: 1,
          display: (this.state.overlayHidden) ? 'none' : '',
          opacity: this.state.overlayHolderOpacity || 0
        }} className={styles.holder}/>
    
        <Interactable.View
          ref={overlayRef}

          style={{
            zIndex: 1,
            position: 'fixed',
            display: (this.state.overlayHidden) ? 'none' : '',

            backgroundColor: colors.whiteBackground,
          
            top: 0,
            width: (this.state.overlayDrag) ? '100vw' : 'calc(100vw + 28px)',
            height: '100%',

            paddingRight: '20vw'
          }}

          animatedValueX={overlayAnimatedX}

          dragEnabled={this.state.overlayDrag}
          
          horizontalOnly={true}
          initialPosition={{ x: size.width, y: 0 }}
          
          onSnap={this.onSnap.bind(this)}
          snapPoints={[ { x: (this.state.overlayDrag) ? 0 : -28 }, { x: size.width } ]}

          boundaries={{
            left: (this.state.overlayDrag) ? 0 : -28,
            right: size.width
          }}
        >

          <div className={styles.wrapper}>
            <div className={styles.handler}/>

            <Trackbar startGame={this.startGame.bind(this)} />

            <RoomContent>
            
              <HandOverlay ref={handOverlayRef}/>
              <FieldOverlay ref={fieldOverlayRef}/>

            </RoomContent>

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

    gridTemplateColumns: 'auto 20vw 1fr',
    gridTemplateRows: '100vh',
    gridTemplateAreas: '"handler side content"',

    width: '100%',
    height: '100%',
    
    '@media screen and (max-width: 980px)': {
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: '"handler side" "handler content"'
    }
  },

  holder: {
    position: 'fixed',
    
    backgroundColor: colors.blackBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  handler: {
    gridArea: 'handler',
    backgroundColor: colors.handler,

    width: '8px',
    height: 'calc(5px + 5%)',

    margin: 'auto 10px',
    borderRadius: '8px'
  }
});

export default withSize(RoomOverlay);