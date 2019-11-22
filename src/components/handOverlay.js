import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { Value } from 'animated';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const overlayAnimatedY = new Value(0);

const percent = (size, percent) => (size / 100) * percent;

class HandOverlay extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      // at this point of code execution
      // we can't access screen height
      // instead we use a very big number to make sure that the overlay
      // is off-screen
      overlayYLimit: Number.MAX_SAFE_INTEGER,
      overlayHidden: true
    };
  }

  componentDidMount()
  {
    socket.on('roomData', (roomData) =>
    {
      // the hand overlay is only visible in matches
      this.visibility((roomData.state === 'match') ? true : false);
    });
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    const { size } = this.props;

    // if hidden then set limit to to off-screen
    // normally the limit is somewhere on screen so that the user won't be able
    // to drag the overlay to off-screen where they won't be able to drag it back
    if (!visible)
      this.setState({ overlayYLimit: size.height });
      
    overlayRef.current.snapTo({ index: (visible) ? 1 : 0 });
  }

  render()
  {
    const { children, size } = this.props;
    
    // on overlay position changes
    overlayAnimatedY.removeAllListeners();

    overlayAnimatedY.addListener(({ value }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (value >= size.height)
        this.setState({ overlayHidden: true });
      else
        this.setState({ overlayHidden: false });
      
      // to stick the overlay so the user can't drag it off the screen
      if (value <= percent(size.height, 80))
        this.setState({ overlayYLimit: percent(size.height, 80) });
    });

    // if size is not calculated yet
    if (!size.height)
      return <div/>;
    
    return (
      <div style={ { width: '100%', height: '100%' } }>
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 3,
            display: (this.state.overlayHidden) ? 'none' : '',

            backgroundColor: colors.handBackground,

            borderRadius: 'calc(10px + 1.5vw)',

            overflow: 'hidden',

            bottom: '0',
            width: '85%',
            height: '85%',

            margin: '0 auto',
            paddingBottom: '20vh'
          } }

          animatedValueY={ overlayAnimatedY }

          verticalOnly={ true }
          initialPosition={ { x: 0, y: size.height } }

          snapPoints={ [ { y: size.height }, { y: percent(size.height, 80) }, { y: percent(size.height, 50) }, { y: percent(size.height, 15) } ] }
          boundaries={ {
            top: percent(size.height, 15),
            bottom: this.state.overlayYLimit
          } }
        >
          <div className={ styles.wrapper }>
            <div className={ styles.handler }/>

            {children}
          </div>
        </Interactable.View>
      </div>
    );
  }
}

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

export default HandOverlay;
