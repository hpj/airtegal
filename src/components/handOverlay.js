import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { wrapGrid } from 'animate-css-grid';

import { StoreComponent } from '../store.js';

import Interactable from './Interactable.js';

import { socket } from '../screens/game.js';

import Card from './card.js';

import { isTouchScreen } from '../index.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import PicksDialogue from './picksDialogue.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

const overlayContainerRef = createRef();

const wrapperRef = createRef();

const picksDialogueRef = createRef();

const handGridRef = createRef();

const percent = (height, percent) => (height / 100) * percent;

class HandOverlay extends StoreComponent
{
  constructor()
  {
    super({
      handVisible: false,
      handHidden: true,

      handBlockDragging: false,
      handViewableArea: undefined,
      
      hand: []
    });

    // bind functions that are use as callbacks

    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.maximizeMinimize = this.maximizeMinimize.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    window.addEventListener('resize', this.onResize);

    this.animatedHandGrid = wrapGrid(handGridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    window.removeEventListener('resize', this.onResize);
  }

  onResize()
  {
    if (!overlayRef.current)
      return;
    
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current.snapTo({ index: overlayRef.current.lastSnapIndex });

    this.refreshViewableArea();
  }

  onScroll()
  {
    if (!isTouchScreen || !wrapperRef.current)
      return;
    
    const y = wrapperRef.current.scrollTop;

    this.store.set({
      handBlockDragging: (y > 0) ? true : false
    });
  }

  /**
  * @param { string[] } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData?.state ||
      changes?.roomData?.playerProperties ||
      changes?.roomData?.playerSecretProperties ||
      changes?.handVisible ||
      changes?.handHidden ||
      changes?.handBlockDragging ||
      changes?.handViewableArea ||
      changes?.hand ||
      changes?.picks)
      return true;
  }

  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;
    
    // if lobby clear hand and picks
    if (roomData.state === 'lobby')
      state.hand = [];

    // if in match and and has to pick a card
    if (
      roomData.state === 'match' &&
      roomData.playerProperties[socket.id].state === 'picking'
    )
      state.handVisible = true;
    else
      state.handVisible = false;

    if (roomData.playerSecretProperties && roomData.playerSecretProperties.hand)
      state.hand = roomData.playerSecretProperties.hand;

    return state;
  }

  stateDidChange(state, old)
  {
    if (state.handVisible !== old.handVisible)
      overlayRef.current.snapTo({ index: 0 });

    if (state.picks.length !== old.picks?.length)
      this.animatedHandGrid?.forceGridAnimation();
  }

  maximizeMinimize()
  {
    if (overlayRef.current.lastSnapIndex <= 0)
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

      this.store.set({
        handViewableArea: size.height - rect.y
      });
    }
  }

  render()
  {
    const { size } = this.props;

    let snapPoints;
    
    const boundaries = {};

    const playerState = this.state.roomData?.playerProperties[socket.id]?.state;

    if (isTouchScreen)
    {
      snapPoints = [ { y: size.height - 38 }, { y: 0 } ];
      
      boundaries.top = snapPoints[1].y;
    }
    else
    {
      snapPoints = [ { y: percent(size.height, 50) }, { y: percent(size.height, 80) }, { y: percent(size.height, 15) } ];
      
      boundaries.top = snapPoints[2].y;
    }

    const isAllowed = playerState === 'picking';

    const onMovement = ({ y }) =>
    {
      // determined the the area of the overlay that is handVisible on screen
      // set set that amount as the wrapper hight
      // so that the user can view all cards without maximizing the the overlay
      if (wrapperRef.current)
        this.refreshViewableArea();
  
      // hide the overlay when it goes off-screen
      if (y >= size.height)
        this.store.set({ handHidden: true });
      // only make the overlay handVisible if there's a reason
      else if (!this.state.handHidden || this.state.handVisible)
        this.store.set({ handHidden: false });
    };

    // if size is not calculated yet
    // if (!size.height)
    //   return <div/>;

    return (
      <div className={ styles.view }>

        <Interactable
          ref={ overlayRef }

          style={ {
            zIndex: 4,
            display: (this.state.handHidden || !this.state.handVisible) ? 'none' : '',

            width: '100%'
          } }

          verticalOnly={ true }
          
          dragEnabled={ !this.state.handBlockDragging }
          
          frame={ { pixels: Math.round(size.height * 0.05), every: 8 } }

          initialPosition={ { y: size.height } }
          
          boundaries={ boundaries }
          
          snapPoints={ snapPoints }
          
          onMovement={ onMovement }
        >
          <div className={ styles.overlayWrapper }>
            <div style={ { height: (isTouchScreen) ? '100vh' : '85vh' } } ref={ overlayContainerRef } className={ styles.overlayContainer }>
              <div style={ { margin: (isTouchScreen) ? '15px 0 15px 0' : '10px 0 5px 0' } } className={ styles.handlerWrapper }>
                <div className={ styles.handler } onClick={ this.maximizeMinimize }/>
              </div>

              <div ref={ wrapperRef } style={ { height: this.state.handViewableArea } } className={ styles.wrapper } onScroll={ this.onScroll }>

                <PicksDialogue
                  ref={ picksDialogueRef }
                  sendMessage={ this.props.sendMessage }
                />

                <div ref= { handGridRef } id={ 'kuruit-hand-overlay' } className={ styles.handContainer }>
                  {
                    this.state.hand.map((card, i) =>
                    {
                      const isPicked = this.state.picks.includes(i);

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
        </Interactable>
      
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
