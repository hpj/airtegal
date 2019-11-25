import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { Value } from 'animated';

import { socket } from '../screens/game.js';

import Card from './card.js';

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
      visible: false,
      overlayHidden: true,

      hand: []
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
  }

  onRoomData(roomData)
  {
    // the hand overlay is only visible in matches
    this.visibility((roomData.state === 'match') ? true : false);

    // if there player properties object in the data
    // and it has the hand data for this client
    if (
      roomData.playerProperties &&
      roomData.playerProperties[socket.id] &&
      roomData.playerProperties[socket.id].hand
    )
    {
      this.setState({
        hand: roomData.playerProperties[socket.id].hand
      });
    }
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    this.setState({ visible: visible });

    overlayRef.current.snapTo({ index: 0 });
  }

  onSnap(e)
  {
    // TODO set the scroll box's height to the visible area's height
    // so that the user is able to see all cards without needing to maximize the overlay
    
    this.setState({
      snapIndex: e.index
    });
  }

  maximizeMinimize()
  {

    if (this.state.snapIndex < 2)
      overlayRef.current.snapTo({ index: 2 });
    else
      overlayRef.current.snapTo({ index: 0 });
  }

  render()
  {
    const { size } = this.props;
    
    const visibleSnapPoints = [ { y: percent(size.height, 80) }, { y: percent(size.height, 50) }, { y: percent(size.height, 15) } ];
    const hiddenSnapPoints = [ { y: size.height } ];

    // on overlay position changes
    overlayAnimatedY.removeAllListeners();

    overlayAnimatedY.addListener(({ value }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (value >= size.height)
        this.setState({ overlayHidden: true });
      else
        this.setState({ overlayHidden: false });
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
            maxWidth: '700px',

            margin: '0 auto',
            paddingBottom: '20vh'
          } }

          animatedValueY={ overlayAnimatedY }

          onSnap={ this.onSnap.bind(this) }

          verticalOnly={ true }
          initialPosition={ { x: 0, y: size.height } }

          snapPoints={ (this.state.visible) ? visibleSnapPoints : hiddenSnapPoints }
          boundaries={ {
            top: percent(size.height, 15)
          } }
        >
          <div className={ styles.overlay }>
            <div className={ styles.handler } onClick={ this.maximizeMinimize.bind(this) }/>

            <div className={ styles.wrapper }>
              <div className={ styles.container }>
                {
                  this.state.hand.map((cardContent, i) =>
                  {
                    return <Card key={ i } type='white' content={ cardContent }></Card>;
                  })
                }
              </div>
            </div>

          </div>
        </Interactable.View>
      </div>
    );
  }
}

HandOverlay.propTypes = {
  size: PropTypes.object
};

const styles = createStyle({
  overlay: {
    display: 'grid',

    gridTemplateColumns: '100%',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"handler" "cards"',

    width: '100%',
    height: '100%'
  },

  handler: {
    gridArea: 'handler',

    cursor: 'pointer',
    backgroundColor: colors.handler,

    width: 'calc(40px + 2.5%)',
    height: '10px',

    margin: '10px auto 0 auto',
    borderRadius: '8px'
  },

  wrapper: {
    gridArea: 'cards',

    overflowX: 'hidden',
    overflowY: 'overlay',

    '::-webkit-scrollbar':
    {
      width: '22px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '22px',
      boxShadow: `inset 0 0 22px 22px ${colors.handScrollbar}`,
      border: 'solid 8px transparent'
    }
  },

  container: {
    display: 'flex',

    flexWrap: 'wrap',
    justifyContent: 'center',

    '> *': {
      width: '25%',
      margin: '10px auto 10px 20px'
    }
  }
});

export default HandOverlay;
