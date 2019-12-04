import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { Value } from 'animated';

import { socket } from '../screens/game.js';

import Card from './card.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const overlayRef = createRef();
const wrapperRef = createRef();

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

      entry: [],
      hand: []
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);

    window.removeEventListener('resize', this.onResize);
  }

  onResize()
  {
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: 0 });
  }

  onRoomData(roomData)
  {
    // the hand overlay is only visible if this client is participate in the match
    this.visibility((roomData.playerProperties[socket.id].state === 'playing') ? true : false);

    // if the player has a secret properties object in the data
    // and it has the hand data for this client
    if (roomData.secretProperties && roomData.secretProperties.hand)
    {
      this.setState({
        playerState: roomData.playerProperties[socket.id].state,
        hand: roomData.secretProperties.hand
      });
    }

    if (roomData.field && roomData.field[0])
    {
      this.setState({
        pick: roomData.field[0][0].pick
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

  /** send the card the player choose to the server's match logic
  * @param { number } cardIndex
  */
  pickCard(cardIndex)
  {
    const { sendMessage } = this.props;
    const { entry } = this.state;

    if (this.state.playerState !== 'playing')
      return;

    // if card exists in entry already
    // then remove it
    if (entry.indexOf(cardIndex) >= 0)
    {
      entry.splice(entry.indexOf(cardIndex), 1);
    }
    // if not then add it
    else
    {
      entry.push(cardIndex);

      // if entry equal the amount that should be pick
      // then send it to match logic
      if (entry.length === this.state.pick)
      {
        sendMessage('matchLogic', {
          cardIndices: entry
        });
  
        this.setState({
          entry: []
        });
      }
    }
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
      // determined the the area of the overlay that is visible on screen
      // set set that amount as the wrapper hight
      // so that the user can view all cards without maximizing the the overlay
      if (wrapperRef.current)
      {
        const rect = wrapperRef.current.getBoundingClientRect();

        this.setState({ viewableArea: size.height - rect.y });
      }

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

            overflow: 'hidden',

            bottom: '0',

            width: '85%',
            height: '85vh',
            maxWidth: '700px',

            margin: '0 auto',
            borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0'
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
            <div className={ styles.handlerWrapper }>
              <div className={ styles.handler } onClick={ this.maximizeMinimize.bind(this) }/>
            </div>

            <div ref={ wrapperRef } style={ { height: this.state.viewableArea } } className={ styles.wrapper }>
              <div className={ styles.container }>
                {
                  this.state.hand.map((card, i) =>
                  {
                    return <Card key={ i } onClick={ () => this.pickCard(i) } type='white' content={ card.content }></Card>;
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
  size: PropTypes.object,
  sendMessage: PropTypes.func.isRequired
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

  handlerWrapper: {
    display: 'flex',
    justifyContent: 'center',

    margin: '10px 10px 10px 0'
  },

  handler: {
    gridArea: 'handler',

    cursor: 'pointer',
    backgroundColor: colors.handler,

    width: 'calc(40px + 2.5%)',
    height: '10px',

    borderRadius: '8px'
  },

  wrapper: {
    gridArea: 'cards',

    overflowX: 'hidden',
    overflowY: 'scroll',

    margin: '0 10px 0 0',

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.handScrollbar}`
    }
  },

  container: {
    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fill, calc(115px + 40px + 2vw + 2vh))',
    justifyContent: 'space-around',

    padding: '0 10px',

    '> *': {
      width: 'calc(115px + 2vw + 2vh)',
      margin: '10px 20px 20px 20px'
    }
  }
});

export default HandOverlay;
