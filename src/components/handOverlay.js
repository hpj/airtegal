import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import Interactable from './Interactable.js';

import { socket } from '../screens/game.js';

import Card from './card.js';

import { isTouchScreen } from '../index.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

const colors = getTheme();

/**
* @type { React.RefObject<HTMLDivElement> }
*/
const wrapperRef = createRef();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

const percent = (height, percent) => (height / 100) * percent;

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class HandOverlay extends StoreComponent
{
  constructor()
  {
    super({
      handHidden: true,
      handVisible: false,
      handBlockDragging: false,

      hand: []
    });

    this.active = undefined;

    this.onResize = this.onResize.bind(this);

    this.onScroll = this.onScroll.bind(this);
    this.onMovement = this.onMovement.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount()
  {
    super.componentWillUnmount();

    window.removeEventListener('resize', this.onResize);
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData ||
      changes?.handViewport ||
      changes?.handBlockDragging ||
      changes?.handVisible ||
      changes?.handHidden ||
      changes?.hand ||
      changes?.pick
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    const state = {};

    // if in match and and has to pick a card
    state.handVisible = roomData?.state === 'match' &&
      roomData?.playerProperties[socket.id]?.state === 'picking';

    state.hand = roomData?.playerSecretProperties?.hand ?? [];

    return state;
  }

  stateDidChange(state)
  {
    if (state.handVisible && overlayRef.current?.lastSnapIndex === 0)
      overlayRef.current.snapTo({ index: 1 });
    else if (!state.handVisible && overlayRef.current?.lastSnapIndex >= 1)
      overlayRef.current.snapTo({ index: 0 });
  }

  onResize()
  {
    // it needs to be updated manually on every resize
    // or else it can go off-screen
    overlayRef.current?.snapTo({ index: overlayRef.current.lastSnapIndex });
  }

  /**
  * @param { Event } e
  */
  onScroll(e)
  {
    if (!isTouchScreen || !wrapperRef.current)
      return;

    if (overlayRef?.current?.lastSnapIndex !== 2)
    {
      e.preventDefault();

      wrapperRef.current.scrollTop = 0;
    }
    else
    {
      const y = wrapperRef.current.scrollTop;
  
      this.store.set({
        handBlockDragging: y > 15 ? true : false
      });
    }
  }

  onMovement({ y })
  {
    const { size } = this.props;

    const handViewport = {
      height: size.height - y - 36
    };

    // hide the overlay when it goes off-screen
    if (y >= size.height)
      this.store.set({ handViewport, handHidden: true });
    // only make the overlay handVisible if there's a reason
    else if (!this.state.handHidden || this.state.handVisible)
      this.store.set({ handViewport, handHidden: false });
  }

  /**
  * @param { Card } element
  * @param { import('./roomOverlay').Card } card
  * @param { number } index
  */
  activateCard(element, card, index)
  {
    const { roomData } = this.state;

    if (roomData?.playerProperties[socket.id]?.state !== 'picking')
      return;

    const { textareaRef } = element;

    if (isTouchScreen)
    {
      if (this.active === element && textareaRef.current.value.trim())
      {
        this.active = undefined;
        this.sendCard(index, textareaRef.current.value);

        return;
      }

      if (card.blank)
        textareaRef.current?.focus();
      
      this.active = element;

      document.addEventListener('click', () => this.active = undefined, { once: true });
    }
    else
    {
      if (card.blank && (!element.focused || !textareaRef.current.value.trim()))
      {
        textareaRef.current?.focus();

        return;
      }

      this.sendCard(index, textareaRef.current.value);
    }
  }

  sendCard(index, content)
  {
    const { sendMessage } = this.props;
    
    sendMessage('matchLogic', { index, content });
  }

  render()
  {
    const { size } = this.props;

    const { handViewport, handHidden } = this.state;

    const top = isTouchScreen ? 0 : percent(size.height, 15);

    const snapPoints = isTouchScreen ? [
      { y: size.height, draggable: false },
      { y: percent(size.height, 75) },
      { y: 0 }
    ] : [
      { y: size.height, draggable: false },
      { y: percent(size.height, 50) },
      { y: percent(size.height, 80) }
    ];
    
    const width = '(115px + 2vw + 2vh)';
    const overlayWidth = size.width >= 700 ? '(min(100vw, 700px) / 1.45)' : '(min(85vw, 700px) / 1.45)';

    const margin =
      `calc((${width} - (${overlayWidth} / ${this.state.hand?.length})) / -2)`;

    return <div className={ styles.view }>
      <Interactable
        ref={ overlayRef }

        style={ {
          zIndex: 4,
          width: '100%',
          display: handHidden ? 'none' : ''
        } }

        verticalOnly={ true }
        dragEnabled={ !this.state.handBlockDragging }
        
        onMovement={ this.onMovement }
        frame={ { pixels: Math.round(size.height * 0.05), every: 8 } }

        boundaries={ { top } }
        snapPoints={ snapPoints }
        initialPosition={ { y: size.height } }
      >
        <div className={ styles.overlayWrapper }>
          <div className={ styles.overlayContainer }>
              
            <div className={ styles.handlerWrapper }>
              <div id={ 'kuruit-hand-handler' } className={ styles.handler }/>
            </div>

            <div ref={ wrapperRef } className={ styles.wrapper } style={ {
              height: !isTouchScreen ? handViewport?.height : undefined
            } } onScroll={ this.onScroll }>

              <div id={ 'kuruit-hand-overlay' } className={ styles.container } style={ {
                flexWrap: isTouchScreen ? 'wrap' : undefined
              } }>
                {
                  this.state.hand?.map((card, i) =>
                  {
                    const deg = i > this.state.hand.length * 0.5 ?
                      -(this.state.hand.length / 2) :
                      (this.state.hand.length / 2);

                    const y = i > this.state.hand.length * 0.5 ?
                      (this.state.hand.length / 3) :
                      -(this.state.hand.length / 3);

                    return <Card
                      key={ card.key }
                      style={ {
                        marginLeft: !isTouchScreen ? margin : undefined,
                        marginRight: !isTouchScreen ? margin : undefined,
                        transform: !isTouchScreen ? `rotateZ(${deg}deg) translateY(${y}px)` : undefined
                      } }
                      onClick={ (c) => this.activateCard(c, card, i) }
                      allowed={ true }
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
    </div>;
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
    overflow: 'hidden',
    backgroundColor: colors.handBackground,

    width: '85%',
    height: '100vh',
    maxWidth: '700px',

    margin: '0 auto',
    borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0',

    // for the portrait overlay
    '@media screen and (max-width: 700px)': {
      width: '100%',
      margin: '0'
    }
  },

  handlerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    margin: '15px'
  },

  handler: {
    cursor: 'pointer',
    backgroundColor: colors.handler,

    width: 'calc(35px + 2.5%)',
    height: '6px',
    borderRadius: '6px'
  },

  wrapper: {
    overflow: 'hidden overlay',
    height: 'calc(100vh - 36px)',

    '::-webkit-scrollbar':
    {
      width: '6px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '6px',
      boxShadow: `inset 0 0 6px 6px ${colors.handScrollbar}`
    }
  },

  container: {
    display: 'flex',
    direction: locale.direction,
    justifyContent: 'center',

    '> div': {
      transition: 'margin 0.35s ease',
      
      margin: '20px',

      '> [type="white"]': {
        border: `1px solid ${colors.whiteCardHover}`
      },
      
      '> [type="black"]': {
        border: `1px solid ${colors.blackCardHover}`
      },

      ':hover': {
        margin: '20px 10px !important',
        zIndex: 10
      }
    }
  }
});

export default HandOverlay;
