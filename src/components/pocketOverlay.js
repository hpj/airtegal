import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import getTheme from '../colors.js';

// import i18n, { locale } from '../i18n.js';

import { createStyle } from '../flcss.js';

import { gestures } from './fieldOverlay.js';

import RoomTrackBar from './roomTrackBar.js';

import { requestRoomData, room } from './roomOverlay.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

class PocketOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      init: false,
      zIndex: 3,

      pocketVisible: false,
      pocketHidden: true
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
    this.onResize = this.onResize.bind(this);

    this.maximize = this.maximize.bind(this);
  }

  componentDidMount()
  {
    room.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);

    gestures.on('right', this.maximize);
  }

  componentWillUnmount()
  {
    room.off('roomData', this.onRoomData);

    window.removeEventListener('resize', this.onResize);
    
    gestures.off('right', this.maximize);
  }

  onRoomData(roomData)
  {
    if (!roomData)
      return;
    
    // if client is in match
    if (roomData.state === 'match')
      this.visibility(true);
    // else client is in the lobby
    else
      this.visibility(false);

    this.setState({
      init: true
    });
  }

  onResize()
  {
    if (!overlayRef.current)
      return;
    
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: 0 });
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    if (!overlayRef.current)
      return;
    
    this.setState({ pocketVisible: visible },
      () => overlayRef.current.snapTo({ index: 0 }));
  }

  maximize()
  {
    overlayRef.current.snapTo({ index: 1 });
  }

  render()
  {
    if (!this.state.init)
    {
      requestRoomData().then((roomData) => this.onRoomData(roomData));
      
      return <div/>;
    }

    const { size } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // layer control
      this.setState({
        zIndex: (value <= -size.width + 5) ? 3 : 5
      });

      // hide the overlay when it's off-screen
      if (Math.abs(Math.round(value)) >= size.width)
        this.setState({ pocketHidden: true });
      else if (!this.state.pocketHidden || this.state.pocketVisible)
        this.setState({ pocketHidden: false });
    });
    
    return (
      <div className={ styles.view }>
        <Interactable.View
          ref={ overlayRef }

          style= { {
            zIndex: this.state.zIndex,
            backgroundColor: colors.transparent,

            width: '100%',
            height: '100%'
          } }

          animatedValueX={ overlayAnimatedX }

          frictionAreas={ [ { damping: 0.6 } ] }

          dragEnabled={ true }

          horizontalOnly={ true }
          initialPosition={ { x: -size.width } }

          snapPoints={ [ { x: -size.width }, { x: 0 } ] }

          boundaries={ {
            left: -size.width,
            right: 0
          } }
        >
          <div className={ styles.handlerWrapper } style={ { display: (this.state.pocketVisible) ? '' : 'none' } }>
            <div className={ styles.handler }/>
          </div>

          <div style={ { display: (this.state.pocketHidden) ? 'none' : '' } } className={ styles.container }>
            <RoomTrackBar contained enabled='true'/>
          </div>
        </Interactable.View>
      </div>
    );
  }
}

const styles = createStyle({
  view: {
    position: 'absolute',

    height: '100%',
    width: '100%'
  },

  handlerWrapper: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',

    left: '100%',
    height: '100%'
  },

  handler: {
    backgroundColor: colors.pocketHandler,

    width: '5px',
    height: '65%',

    margin: '0 0 0 8px',
    borderRadius: '5px'
  },

  container: {
    height: '100%',
    width: '100%'
  }
});

PocketOverlay.propTypes = {
  size: PropTypes.object
};

export default PocketOverlay;
