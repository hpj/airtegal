import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { wrapGrid } from 'animate-css-grid';

import { Value } from 'animated';

import Interactable from 'react-interactable/noNative';

import { socket } from '../screens/game.js';

import Card from './card.js';

import { isTouchScreen } from '../index.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import { gestures } from './fieldOverlay.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayContainerRef = createRef();

const wrapperRef = createRef();
const gridRef = createRef();

const overlayAnimatedY = new Value(0);

const percent = (height, percent) =>
{
  const n = (height / 100) * percent;

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

      blockDragging: false,

      entry: [],
      hand: []
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.maximize = this.maximize.bind(this);
    this.maximizeMinimize = this.maximizeMinimize.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);
    wrapperRef.current.addEventListener('resize', this.onResize);

    if (isTouchScreen)
      gestures.on('up', this.maximize);
   
    this.animatedGrid = wrapGrid(gridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);

    window.removeEventListener('resize', this.onResize);
    
    gestures.off('up', this.maximize);
  }

  onResize()
  {
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: 0 });

    this.refreshViewableArea();
  }

  onScroll()
  {
    if (!isTouchScreen)
      return;
    
    const y = wrapperRef.current.scrollTop;

    this.setState({
      blockDragging: (y > 0) ? true : false
    });
  }

  onRoomData(roomData)
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
    this.setState({ visible: visible },
      () => overlayRef.current.snapTo({ index: 0 }));
  }
  
  onSnap(e)
  {
    this.setState({
      snapIndex: e.index
    }, () =>
    {
      if (isTouchScreen)
      {
        requestAnimationFrame(() => wrapperRef.current.scrollTo({ top: 0 }));
      }
    });
  }

  maximize()
  {
    if (this.state.snapIndex === 0 && this.state.visible)
      overlayRef.current.snapTo({ index: 1 });
  }

  maximizeMinimize()
  {
    if (this.state.snapIndex <= 0 && !isTouchScreen)
      overlayRef.current.snapTo({ index: 2 });
    if (this.state.snapIndex <= 0 && isTouchScreen)
      overlayRef.current.snapTo({ index: 1 });
    else
      overlayRef.current.snapTo({ index: 0 });
  }

  refreshViewableArea()
  {
    // touch screen are not scrolled the same way as non-touch screens
    if (!isTouchScreen)
    {
      const { size } = this.props;
      
      const rect = wrapperRef.current.getBoundingClientRect();

      this.setState({
        viewableArea: size.height - rect.y
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

    if (isTouchScreen)
    {
      visibleSnapPoints = [ { y: size.height - 38 }, { y: 0 } ];
      
      boundaries.top = visibleSnapPoints[1].y;
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

      // hide the overlay when it goes off-screen
      if (Math.round(value) >= size.height)
        this.setState({ overlayHidden: true }, () => this.animatedGrid.forceGridAnimation());
      // only make the overlay visible if there's a reason
      else if (!this.state.overlayHidden || this.state.visible)
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

          dragEnabled={ !this.state.blockDragging }

          frictionAreas={ [ { damping: 0.6 } ] }

          verticalOnly={ true }
          initialPosition={ { x: 0, y: size.height } }

          snapPoints={ (this.state.visible) ? visibleSnapPoints : hiddenSnapPoints }

          boundaries={ boundaries }
        >
          <div className={ styles.overlayWrapper }>
            <div style={ { height: (isTouchScreen) ? '100vh' : '85vh' } } ref={ overlayContainerRef } className={ styles.overlayContainer }>
              <div style={ { margin: (isTouchScreen) ? '15px 0 15px 0' : '10px 0 5px 0' } } className={ styles.handlerWrapper }>
                <div className={ styles.handler } onClick={ this.maximizeMinimize }/>
              </div>

              <div ref={ wrapperRef } style={ { height: this.state.viewableArea } } className={ styles.wrapper } onScroll={ this.onScroll }>
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

    // for the portrait overlay
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
    maxWidth: '700px',

    margin: '0 auto',
    borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0',

    // for the (smaller screens) portrait overlay
    '@media screen and (max-width: 700px)': {
      width: '100%',
      margin: '0'
    }
  },

  handlerWrapper: {
    display: 'flex',
    justifyContent: 'center'
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
