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

import PicksDialogue from './picksDialogue.js';

import { requestRoomData, room } from './roomOverlay.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayContainerRef = createRef();

const wrapperRef = createRef();

const picksDialogueRef = createRef();

const picksGridRef = createRef();
const handGridRef = createRef();

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

      hand: []
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.forceGridAnimations = this.forceGridAnimations.bind(this);

    this.maximize = this.maximize.bind(this);
    this.maximizeMinimize = this.maximizeMinimize.bind(this);

    requestRoomData().then((roomData) => this.onRoomData(roomData));
  }

  componentDidMount()
  {
    room.on('roomData', this.onRoomData);

    window.addEventListener('resize', this.onResize);
    wrapperRef.current.addEventListener('resize', this.onResize);

    if (isTouchScreen)
      gestures.on('up', this.maximize);
  }

  componentWillUnmount()
  {
    room.off('roomData', this.onRoomData);

    window.removeEventListener('resize', this.onResize);
    
    gestures.off('up', this.maximize);
  }

  onResize()
  {
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: this.state.snapIndex });

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
    if (!roomData)
      return;
    
    // if lobby clear hand and picks
    if (roomData.state === 'lobby')
    {
      this.setState({
        hand: []
      }, this.forceGridAnimations);
    }

    // if in match and and has to pick a card
    if (
      roomData.state === 'match' &&
      roomData.playerProperties[socket.id].state === 'picking'
    )
    {
      this.visibility(true);
    }
    // client is in the lobby
    // or not picking
    else
    {
      this.visibility(false);
    }

    if (roomData.playerSecretProperties && roomData.playerSecretProperties.hand)
    {
      this.setState({
        hand: roomData.playerSecretProperties.hand
      }, this.forceGridAnimations);
    }

    this.setState({
      playerState: roomData.playerProperties[socket.id].state
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
    });
  }

  maximize()
  {
    if (this.state.snapIndex === 0 && this.state.visible)
      overlayRef.current.snapTo({ index: 1 });
  }

  maximizeMinimize()
  {
    if (this.state.snapIndex <= 0)
      overlayRef.current.snapTo({ index: (isTouchScreen) ? 1 : 2 });
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

  forceGridAnimations()
  {
    // force a re-render
    this.setState({
      hand: this.state.hand
    }, () =>
    {
      // force grid animations
      requestAnimationFrame(() =>
      {
        if (this.animatedHandGrid)
          this.animatedHandGrid.forceGridAnimation();

        if (this.animatedPicksGrid)
          this.animatedPicksGrid.forceGridAnimation();
      });
    });
  }

  render()
  {
    const { size } = this.props;

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
      visibleSnapPoints = [ { y: percent(size.height, 50) }, { y: percent(size.height, 80) }, { y: percent(size.height, 15) } ];
      
      boundaries.top = visibleSnapPoints[2].y;
    }

    if (!this.animatedHandGrid && handGridRef.current)
      this.animatedHandGrid = wrapGrid(handGridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });

    if (!this.animatedPicksGrid && picksGridRef.current)
      this.animatedPicksGrid = wrapGrid(picksGridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });

    const isAllowed = this.state.playerState === 'picking';

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
        this.setState({ overlayHidden: true }, this.forceGridAnimations);
      // only make the overlay visible if there's a reason
      else if (!this.state.overlayHidden || this.state.visible)
        this.setState({ overlayHidden: false }, this.forceGridAnimations);
    });

    // if size is not calculated yet
    if (!size.height)
      return <div/>;

    return (
      <div className={ styles.view }>

        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 4,
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

                <PicksDialogue
                  ref={ picksDialogueRef }
                  gridRef={ picksGridRef }
                  sendMessage={ this.props.sendMessage }
                  forceGridAnimations={ this.forceGridAnimations }
                />

                <div ref= { handGridRef } className={ styles.handContainer }>
                  {
                    this.state.hand.map((card, i) =>
                    {
                      const isPicked = picksDialogueRef.current.isPicked(i);

                      return <Card
                        key={ card.key }
                        onClick={ () => picksDialogueRef.current.pickCard(i, isAllowed) }
                        disabled={ isPicked }
                        allowed={ isAllowed.toString() }
                        type={ card.type }
                        blank={ card.blank }
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
    margin: '0 0 0 15vw',

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

  handContainer: {
    display: 'grid',

    direction: locale.direction,

    gridTemplateColumns: 'repeat(auto-fill, calc(115px + 40px + 2vw + 2vh))',
    justifyContent: 'space-around',

    padding: '0 10px',

    '> *': {
      margin: '20px'
    },

    '> * > * > [type]': {
      width: 'calc(115px + 2vw + 2vh)',

      minHeight: 'calc((115px + 2vw + 2vh) * 1.15)',
      height: 'auto'
    }
  }
});

export default HandOverlay;
