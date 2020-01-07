import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { wrapGrid } from 'animate-css-grid';

import Interactable from '../interactable/noNative.js';

import { Value } from 'animated';

import { socket } from '../screens/game.js';

import Card from './card.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayContainerRef = createRef();

const wrapperRef = createRef();
const gridRef = createRef();

const overlayAnimatedY = new Value(0);

const percent = (height, percent) =>
{
  const n = (height / 100) * percent;
  const delta = height - n;

  // for the portrait overlay
  // set a minimal height that the overlay can't go below
  if (200 > delta)
    return height - 200;

  return n;
};

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
    this.onResize = this.onResize.bind(this);
    this.maximizeMinimize = this.maximizeMinimize.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);
    wrapperRef.current.addEventListener('resize', this.onResize);

    this.animatedGrid = wrapGrid(gridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });
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

    this.refreshViewableArea();
  }

  onRoomData(roomData)
  {
    // if a change happen in room's state
    if (this.stateroomState !== roomData.state)
    {
      // if lobby clear hand and entry
      if (roomData.state === 'lobby')
      {
        this.setState({
          hoverIndex: undefined,
          entry: [],
          hand: []
        });
      }
    }

    if (roomData.roundStarted)
    {
      this.setState({
        hoverIndex: undefined,
        entry: []
      });
    }

    // if in match and and has to choose a card from hand aka "playing"
    if (
      roomData.state === 'match' &&
      roomData.playerProperties[socket.id].state === 'playing'
    )
    {
      this.visibility(true);
    }
    // client is in the lobby
    // or not playing
    else
    {
      this.visibility(false);
    }

    // if the player has a secret properties object in the data
    // and it has the hand data for this client
    if (roomData.playerSecretProperties && roomData.playerSecretProperties.hand)
    {
      this.setState({
        playerState: roomData.playerProperties[socket.id].state,
        hand: roomData.playerSecretProperties.hand
      });
    }

    if (roomData.field && roomData.field.length > 0)
    {
      this.setState({
        // the black card pick amount
        pick: roomData.field[0].cards[0].pick
      });
    }
    
    this.setState({
      roomState: roomData.state
    });
  }

  /**
  * @param { boolean } visible
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
    if (this.state.snapIndex <= 0)
      overlayRef.current.snapTo({ index: 2 });
    else
      overlayRef.current.snapTo({ index: 0 });
  }

  refreshViewableArea()
  {
    let touchScreen = false;
    
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      touchScreen = true;
   
    // touch screen are not scrolled the same way as non-touch screens
    if (!touchScreen)
    {
      const { size } = this.props;
      
      const rect = wrapperRef.current.getBoundingClientRect();

      this.setState({
        viewableArea: size.height - rect.y,
        maxViewableArea: undefined
      });
    }
    else
    {
      const rect = overlayContainerRef.current.getBoundingClientRect();

      this.setState({
        viewableArea: undefined,
        maxViewableArea: rect.height
      });
    }
  }

  /** send the card the player choose to the server's match logic
  * @param { number } cardIndex
  * @param { boolean } isAllowed if the card can be picked
  * @param { boolean } isPicked if the card is selected in the entry
  */
  pickCard(cardIndex, isAllowed, isPicked)
  {
    let entry = [ ...this.state.entry ];

    const { sendMessage } = this.props;

    if (!isAllowed)
      return;

    // if card exists in entry already
    if (isPicked)
    {
      // remove the card from entry
      entry.splice(entry.indexOf(cardIndex), 1);

      // update state to force re-render
      this.setState({
        entry: entry
      });
    }
    // if not then add it
    else
    {
      // add the card to entry
      entry.push(cardIndex);

      // if entry equal the amount that should be pick
      if (entry.length === this.state.pick)
      {
        // send it to match logic
        sendMessage('matchLogic', {
          cardIndices: entry
        });

        // clean the entry
        entry = [];
      }

      // update state to force re-render
      this.setState({
        entry: entry
      });
    }
  }

  render()
  {
    const { size } = this.props;
    const { entry } = this.state;

    let visibleSnapPoints;
    
    const hiddenSnapPoints = [ { y: size.height } ];

    const boundaries = {};

    let freewillAfter;

    if (this.state.maxViewableArea)
    {
      visibleSnapPoints = [ { y: percent(size.height, 80) }, { y: size.height - this.state.maxViewableArea } ];
      
      boundaries.top = visibleSnapPoints[1].y;

      freewillAfter = { y: percent(size.height, 80) };
    }
    else
    {
      visibleSnapPoints = [ { y: percent(size.height, 80) }, { y: percent(size.height, 50) }, { y: percent(size.height, 15) } ];
      
      boundaries.top = visibleSnapPoints[2].y;
    }

    const isAllowed = this.state.playerState === 'playing';

    // on overlay position changes
    overlayAnimatedY.removeAllListeners();

    overlayAnimatedY.addListener(({ value }) =>
    {
      // determined the the area of the overlay that is visible on screen
      // set set that amount as the wrapper hight
      // so that the user can view all cards without maximizing the the overlay
      if (wrapperRef.current)
        this.refreshViewableArea();

      // hide the overlay and overlay holder when they are off-screen
      if (value >= size.height)
        this.setState({ overlayHidden: true }, () => this.animatedGrid.forceGridAnimation());
      else
        this.setState({ overlayHidden: false }, () => this.animatedGrid.forceGridAnimation());
    });

    // if size is not calculated yet
    if (!size.height)
      return <div/>;

    return (
      <div className={ styles.view }>
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 3,
            display: (this.state.overlayHidden) ? 'none' : ''
          } }

          animatedValueY={ overlayAnimatedY }

          onSnap={ this.onSnap.bind(this) }

          dragWithSpring={ { tension: 500 } }

          dragEnabled={ true }

          frictionAreas={ [ { damping: 0.6 } ] }

          verticalOnly={ true }
          initialPosition={ { x: 0, y: size.height } }

          snapPoints={ (this.state.visible) ? visibleSnapPoints : hiddenSnapPoints }

          boundaries={ boundaries }

          freewillAfter={ freewillAfter }
        >
          <div className={ styles.overlayWrapper }>
            <div ref={ overlayContainerRef } className={ styles.overlayContainer }>
              <div className={ styles.handlerWrapper }>
                <div className={ styles.handler } onClick={ this.maximizeMinimize }/>
              </div>

              <div ref={ wrapperRef } style={ { height: this.state.viewableArea } } className={ styles.wrapper }>
                <div ref= { gridRef } className={ styles.container }>
                  {
                    this.state.hand.map((card, i) =>
                    {
                      const isPicked = entry.indexOf(i) > -1;

                      const onMouseEnter = () =>
                      {
                        this.setState({
                          hoverIndex: i
                        });
                      };

                      const onMouseLeave = () =>
                      {
                        this.setState({
                          hoverIndex: undefined
                        });
                      };

                      return <Card
                        key={ card.key }
                        onMouseEnter={ onMouseEnter }
                        onMouseLeave={ onMouseLeave }
                        onClick={ () => this.pickCard(i, isAllowed, isPicked) }
                        picked={ isPicked.toString() }
                        allowed={ isAllowed.toString() }
                        highlighted={ (this.state.hoverIndex === i).toString() }
                        type='white'
                        content={ card.content }/>;
                    })
                  }
                </div>
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
  view: {
    position: 'absolute',

    width: '100vw',
    height: '100vh'
  },

  overlayWrapper: {
    // margin to avoid the trackbar
    margin: '0 0 0 calc(15vw + 10px)',

    // for the (smaller screens) portrait overlay
    '@media screen and (max-width: 1080px)': {
      margin: 0
    }
  },

  overlayContainer: {
    display: 'grid',

    gridTemplateColumns: '100%',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"handler" "cards"',

    backgroundColor: colors.handBackground,

    overflow: 'hidden',

    width: '85%',
    height: '85vh',
    maxWidth: '700px',

    margin: '0 auto',
    borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0',

    '@media (pointer: coarse)': {
      height: 'fit-content'
    },

    // for the (smaller screens) portrait overlay
    '@media screen and (max-width: 700px)': {
      width: '100%',
      margin: '0'
    }
  },

  handlerWrapper: {
    display: 'flex',
    justifyContent: 'center',

    margin: '10px 0 5px 0'
  },

  handler: {
    gridArea: 'handler',

    cursor: 'pointer',
    backgroundColor: colors.handler,

    width: 'calc(40px + 2.5%)',
    height: '8px',

    borderRadius: '8px'
  },

  wrapper: {
    gridArea: 'cards',

    overflowX: 'hidden',
    overflowY: 'scroll',

    margin: '0 10px 0 0',

    '@media (pointer: coarse)': {
      overflowX: 'none',
      overflowY: 'none',

      height: 'fit-content'
    },

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

    direction: locale.direction,

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
