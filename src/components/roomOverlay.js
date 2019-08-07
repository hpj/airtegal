import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import { Value } from 'animated';
import Interactable from 'react-interactable/noNative';

import withSize from '../react-size.js';

import * as game from '../game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import Trackbar from './roomTrackbar.js';
import RoomContent from './roomContent.js';

import FieldOverlay from './fieldOverlay.js';
import HandOverlay from './handOverlay.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

/** @param { { size: { width: number, height: number } } } param0
*/
const RoomOverlay = ({ size }) =>
{
  const [ overlayHolderOpacity, setOverlayHolderOpacity ] = useState(0);
  const [ overlayHidden, setOverlayHidden ] = useState(true);
  const [ overlayDrag, setOverlayDrag ] = useState(true);

  // set utils

  game.requires.createRoom = () =>
  {
    overlayRef.current.snapTo({ index: 0 });
  };

  game.requires.joinRoom = () =>
  {
    overlayRef.current.snapTo({ index: 0 });
  };

  game.requires.startGame = () =>
  {
    game.handVisibility(true);
    game.fieldVisibility(true);

    game.handlerVisibility(false);
  };

  game.requires.handlerVisibility = (visible) =>
  {
    // make overlay drag-able or un-drag-able (which in returns controls the handler visibility)
    setOverlayDrag(visible);
    
    // refresh overlay position to show the handler
    requestAnimationFrame(() => overlayRef.current.snapTo({ index: 0 }));
  };

  // on overlay position changes
  overlayAnimatedX.addListener(({ value }) =>
  {
    // (size.width * 2) doubles the width to make the max number 0.5
    // instead of 1 because 1 is a complete black background

    // (0.5 - $) reverses the number to make far left 0 and far right 0.5

    setOverlayHolderOpacity(0.5 - (value / (size.width * 2)));

    // hide the overlay and overlay holder when they are off-screen

    if (value >= size.width)
      setOverlayHidden(true);
    else
      setOverlayHidden(false);
  });

  // if size is not calculated yet
  if (!size.width)
    return <div/>;

  return (
    <div>

      <div style={{
        display: (overlayHidden) ? 'none' : '',
        opacity: overlayHolderOpacity || 0
      }} className={styles.holder}/>
    
      <Interactable.View
        ref={overlayRef}

        style={{
          display: (overlayHidden) ? 'none' : '',
          position: 'fixed',

          backgroundColor: colors.whiteBackground,
          
          top: 0,
          width: (overlayDrag) ? '100vw' : 'calc(100vw + 28px)',
          height: '100%',

          paddingRight: '20vw'
        }}

        animatedValueX={overlayAnimatedX}

        dragEnabled={overlayDrag}

        horizontalOnly={true}
        initialPosition={{ x: size.width, y: 0 }}
        
        snapPoints={[ { x: (overlayDrag) ? 0 : -28 }, { x: size.width } ]}

        boundaries={{
          left: (overlayDrag) ? 0 : -28,
          right: size.width
        }}
      >

        <div className={styles.wrapper}>
          <div className={styles.handler}/>

          <Trackbar/>

          <RoomContent>
            
            <FieldOverlay/>
            <HandOverlay/>

          </RoomContent>

        </div>
        
      </Interactable.View>

    </div>
  );
};

RoomOverlay.propTypes = {
  size: PropTypes.object
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

export default withSize(RoomOverlay, { keepSize: true });