import React, { useState, createRef } from 'react';
import { Value } from 'animated';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { withWindowSizeListener } from 'react-window-size-listener';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

/** @param { { windowSize: { windowWidth: number, windowHeight: number } } } param0
*/
const GameOverlay = ({ windowSize }) =>
{
  const [ overlayHolderOpacity, setOverlayHolderOpacity ] = useState(0);
  const [ overlayHidden, setOverlayHidden ] = useState(true);
  const [ overlayDrag, setOverlayDrag ] = useState(true);

  // TODO when user enter a game set overlayDrag to false and snap overlay to index 0

  const overlaySnap= (event) =>
  {
    // TODO on snap to 0 disable drag (if not working then we have to disable drag first then snap)
  };

  overlayAnimatedX.addListener(({ value }) =>
  {
    // (windowSize.windowWidth * 2) doubles the width to make the max number 0.5
    // instead of 1 because 1 is a complete black background

    // (0.5 - $) reverses the number to make far left 0 and far right 0.5

    setOverlayHolderOpacity(0.5 - (value / (windowSize.windowWidth * 2)));

    // hide the overlay and overlay holder when they are off-screen

    if (value >= windowSize.windowWidth)
      setOverlayHidden(true);
    else
      setOverlayHidden(false);
  });

  return (
    <div>

      <div style={{
        display: (overlayHidden) ? 'none' : '',
        opacity: overlayHolderOpacity
      }} className={styles.holder}/>
    
      <Interactable.View
        ref={overlayRef}

        style={{
          display: (overlayHidden) ? 'none' : '',
          position: 'fixed',

          backgroundColor: colors.whiteBackground,
          
          top: 0,
          width: '120vw' // workaround an animation issue
        }}

        animatedValueX={overlayAnimatedX}

        dragEnabled={overlayDrag}

        horizontalOnly={true}
        initialPosition={{ x: windowSize.windowWidth }}
        snapPoints={[ { x: -28 }, { x: 0 }, { x: windowSize.windowWidth } ]}
        boundaries={{
          left: (overlayDrag) ? 0 : -28,
          right: windowSize.windowWidth
        }}
      >

        <div className={styles.wrapper}>
          <div className={styles.handler}/>
          <div className={styles.container}/>
        </div>
        
      </Interactable.View>

    </div>
  );
};

GameOverlay.propTypes = {
  windowSize: PropTypes.object
};

const styles = createStyle({
  wrapper: {
    display: 'flex',

    width: '100vw',
    height: '100vh'
  },

  container: {
    marginLeft: '28px'
  },

  holder: {
    position: 'fixed',
    
    backgroundColor: colors.blackBackground,

    top: 0,
    width: '100vw',
    height: '100vh'
  },

  handler: {
    backgroundColor: colors.handler,

    width: '8px',
    height: 'calc(5px + 5%)',

    margin: 'auto 10px',
    borderRadius: '8px'
  }
});

export default withWindowSizeListener(GameOverlay);