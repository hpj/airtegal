import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

// import i18n, { locale } from '../i18n.js';

import { createStyle } from '../flcss.js';

import { gestures } from './fieldOverlay.js';

import TrackBar from './roomTrackBar.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

class PocketOverlay extends React.Component
{
  // TODO add track bar and make sure its always updated

  constructor()
  {
    super();

    this.state = {
      zIndex: 2,
      visible: false,
      overlayHidden: true
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
    this.onResize = this.onResize.bind(this);

    this.maximize = this.maximize.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);

    gestures.on('right', this.maximize);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);

    window.removeEventListener('resize', this.onResize);
    
    gestures.off('right', this.maximize);
  }

  onRoomData(roomData)
  {
    // if client is in match
    if (roomData.state === 'match')
      this.visibility(true);
    // else client is in the lobby
    else
      this.visibility(false);
  }

  onResize()
  {
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: 0 });
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    this.setState({ visible: visible },
      () => overlayRef.current.snapTo({ index: 0 }));
  }

  maximize()
  {
    overlayRef.current.snapTo({ index: 1 });
  }

  render()
  {
    const { size } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // layer control
      this.setState({
        zIndex: (value <= -size.width + 5) ? 2 : 3
      });

      // hide the overlay when it's off-screen
      if (Math.abs(Math.round(value)) >= size.width)
        this.setState({ overlayHidden: true });
      else if (!this.state.overlayHidden || this.state.visible)
        this.setState({ overlayHidden: false });
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
          <div style={ { display: (this.state.visible) ? '' : 'none' } } className={ styles.handler }/>
          <div style={ { display: (this.state.overlayHidden) ? 'none' : '' } } className={ styles.container }>
            <TrackBar contained enabled='true'/>
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

  handler: {
    position: 'absolute',
    backgroundColor: colors.whiteBackground,

    top: '10%',
    left: '100%',
    height: '75%',
    width: '5px',

    borderRadius: '0px 5px 5px 0px'
  },

  container: {
    backgroundColor: colors.whiteBackground,

    height: '100%',
    width: '100%'
  }
});

PocketOverlay.propTypes = {
  size: PropTypes.object
};

export default PocketOverlay;
