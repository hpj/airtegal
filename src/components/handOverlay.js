import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import * as game from '../game.js';

import * as colors from '../colors.js';

import { Value } from 'animated';
import withSize from '../react-size.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const overlayAnimatedY = new Value(0);

const percent = (size, percent) => (size / 100) * percent;

/** @param { { children: [], size: { width: number, height: number } } } } param0
*/
const HandOverlay = ({ children, size }) =>
{
  const [ overlayYLimit, setOverlayYLimit ] = useState(size.height);
  const [ overlayHidden, setOverlayHidden ] = useState(true);

  game.requires.handVisibility = (visible) =>
  {
    // if hidden then set limit to off-screen
    if (!visible)
      setOverlayYLimit(size.height);

    overlayRef.current.snapTo({ index: (visible) ? 1 : 0 });
  };

  // on overlay position changes
  overlayAnimatedY.addListener(({ value }) =>
  {
    // hide the overlay and overlay holder when they are off-screen

    if (value >= size.height)
      setOverlayHidden(true);
    else
      setOverlayHidden(false);

    // to stick the overlay so the user can't drag it off the screen
    if (value <= percent(size.height, 80))
      setOverlayYLimit(percent(size.height, 80));
  });

  // if size is not calculated yet
  if (!size.height)
    return <div/>;

  return (
    <Interactable.View
      ref={overlayRef}

      style={{
        display: (overlayHidden) ? 'none' : '',

        backgroundColor: colors.handBackground,

        borderRadius: 'calc(10px + 1.5vw)',

        overflow: 'hidden',

        top: '-100%',
        width: '85%',
        height: '100%',
        
        margin: '0 auto',
        paddingBottom: '20vh'
      }}

      animatedValueY={overlayAnimatedY}

      verticalOnly={true}
      initialPosition={{ x: 0, y: size.height }}

      snapPoints={[ { y: size.height }, { y: percent(size.height, 80) }, { y: percent(size.height, 50) }, { y: percent(size.height, 15) } ]}

      boundaries={{
        top: percent(size.height, 15),
        bottom: overlayYLimit
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.handler}/>

        {children}
      </div>
    </Interactable.View>
  );
};

HandOverlay.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  size: PropTypes.object
};

const styles = createStyle({
  wrapper: {
    width: '100%',
    height: '100%'
  },

  handler: {
    gridArea: 'handler',
    backgroundColor: colors.handler,

    width: 'calc(26px + 2.5%)',
    height: '8px',

    margin: '10px auto',
    borderRadius: '8px'
  }
});

export default withSize(HandOverlay, { keepSize: true });

