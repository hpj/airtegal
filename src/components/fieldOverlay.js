import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import * as colors from '../colors.js';

import { Value } from 'animated';
import withSize from '../react-size.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

class FieldOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      overlayHidden: true
    };
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    overlayRef.current.snapTo({ index: (visible) ? 1 : 0 });
  }

  render()
  {
    const { children, size } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
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
      <Interactable.View
        ref={overlayRef}

        style={{
          display: (this.state.overlayHidden) ? 'none' : '',

          backgroundColor: colors.fieldBackground,

          overflow: 'hidden',

          top: '-100%',
          width: '100%',
          height: '100%',

          paddingRight: '20vw'
        }}

        animatedValueX={overlayAnimatedX}

        dragEnabled={false}

        horizontalOnly={true}
        initialPosition={{ x: size.width, y: 0 }}

        snapPoints={[ { x: size.width }, { x: 0 } ]}

        boundaries={{
          left: 0,
          right: size.width
        }}
      >
        <div className={styles.wrapper}>
          {children}
        </div>
      </Interactable.View>
    );
  }
}

FieldOverlay.propTypes = {
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
  }
});

export default withSize(FieldOverlay, { keepSize: true });


