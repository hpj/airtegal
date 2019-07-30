import React, { useState, createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import * as colors from '../colors.js';

import { Value } from 'animated';
import withSize from '../react-size.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

/** @param { { utils: {}, children: [], size: { width: number, height: number } } } } param0
*/
const FieldOverlay = ({ utils, children, size }) =>
{
  const [ overlayHidden, setOverlayHidden ] = useState(true);

  // set utils
  utils.openField = () =>
  {
    overlayRef.current.snapTo({ index: 0 });
  };

  // on overlay position changes
  overlayAnimatedX.addListener(({ value }) =>
  {
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
    <Interactable.View
      ref={overlayRef}

      style={{
        display: (overlayHidden) ? 'none' : '',

        backgroundColor: 'red',

        width: '120%',
        height: '100%'
      }}

      animatedValueX={overlayAnimatedX}

      dragEnabled={false}

      horizontalOnly={true}
      initialPosition={{ x: size.width }}

      snapPoints={[ { x: 0 }, { x: size.width } ]}

      boundaries={{
        left: 0,
        right: size.width
      }}
    >
      <div className={styles.container}>
        {children}
      </div>
    </Interactable.View>
  );
};

FieldOverlay.propTypes = {
  utils: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  size: PropTypes.object
};

const styles = createStyle({
  container: {

  }
});

export default withSize(FieldOverlay, { keepSize: true });


