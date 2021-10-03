import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { socket, sendMessage } from '../utils.js';

import Interactable from './interactable.js';

import Card from './card.js';

import { isTouchScreen } from '../index.js';

import { withTranslation } from '../i18n.js';

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
      handBlockScrolling: true,
      handBlockDragging: false
    });

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
      changes?.handBlockScrolling ||
      changes?.handVisible ||
      changes?.handHidden ||
      changes?.pick
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    return {
      // if in match and and has to pick a card
      handVisible: roomData?.state === 'match' &&
      roomData?.playerProperties[socket.id]?.state === 'picking'
    };
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
    // needs to be updated manually on every resize
    overlayRef.current?.snapTo({ index: overlayRef.current.lastSnapIndex });
  }

  /**
  * @param { Event } e
  */
  onScroll()
  {
    if (!isTouchScreen)
      return;

    const y = wrapperRef.current?.scrollTop ?? 0;

    // block dragging if the user is scrolling through the cards

    this.store.set({
      handBlockDragging: overlayRef.current?.lastSnapIndex === 2 && y > 0 ? true : false
    });
  }

  onMovement({ y })
  {
    const { size } = this.props;

    const state = {};

    const { handVisible, handHidden } = this.state;

    const handViewport = {
      // 36px for the handler
      // 31px for portrait mode state bar
      height: (size.height - y) - 36 - (size.width <= 700 ? 31 : 0)
    };

    state.handBlockScrolling = y > 0;

    // hide the overlay when it goes off-screen
    if (y >= size.height)
      state.handHidden = true;
    // only make the overlay handVisible if there's a reason
    else if (!handHidden || handVisible)
      state.handHidden = false;

    state.handViewport = handViewport;

    this.store.set(state);
  }

  /**
  * @param { Card } element
  * @param { import('./roomOverlay').Card } card
  * @param { number } index
  */
  activateCard(element, card, index)
  {
    const { playerProperties } = this.state.roomData;

    if (playerProperties[socket.id]?.state !== 'picking')
      return;

    const { textareaRef } = element;

    const value = textareaRef.current?.value.trim();

    if ((card.blank && element.focused && value?.length > 0) || !card.blank)
      this.sendCard(index, value);
  }

  sendCard(index, content)
  {
    sendMessage('matchLogic', { index, content });
  }

  render()
  {
    const { locale, size } = this.props;

    const {
      roomData,
      handHidden,
      handViewport,
      handBlockScrolling,
      handBlockDragging
    } = this.state;

    const hand = roomData?.playerSecretProperties?.hand ?? [];

    const miniView = isTouchScreen || size.width < 700;

    const width = '(115px + 2vw + 2vh)';
    const overlayWidth = size.width >= 700 ? '(min(100vw, 700px) / 1.45)' : '(min(85vw, 700px) / 1.45)';

    const margin =
      `calc((${width} - (${overlayWidth} / ${hand?.length})) / -2)`;

    const snapPoints = isTouchScreen ? [
      { y: size.height, draggable: false },
      { y: percent(size.height, 75) },
      { y: 0 }
    ] : [
      { y: size.height, draggable: false },
      { y: percent(size.height, 50) },
      { y: percent(size.height, 80) }
    ];

    return <div className={ styles.view }>
      <Interactable
        ref={ overlayRef }

        style={ {
          zIndex: 3,
          width: '100%',
          display: handHidden ? 'none' : ''
        } }

        verticalOnly={ true }

        dragEnabled={ !handBlockDragging }
        
        onMovement={ this.onMovement }

        frame={ { pixels: Math.round(size.height * 0.05), every: 8 } }

        boundaries={ { top: isTouchScreen ? 0 : percent(size.height, 15) } }

        snapPoints={ snapPoints }

        initialPosition={ { y: size.height } }
      >
        <div className={ styles.container }>
              
          <div id={ 'kuruit-hand-handler' } className={ styles.handler }>
            <div/>
          </div>

          <div ref={ wrapperRef } className={ styles.wrapper } style={ {
            // pointer events are disabled meaning that the user can't scroll through the cards
            // unless the interactable is fully snapped to the top of the screen
            // but each cards overrides pointer events so cards still can be picked in any snap point
            pointerEvents: isTouchScreen && handBlockScrolling ? 'none' : 'auto',
            height: !isTouchScreen ? handViewport?.height : undefined
          } } onScroll={ this.onScroll }>

            <div id={ 'kuruit-hand-overlay' } className={ styles.cards } style={ {
              flexWrap: miniView ? 'wrap' : undefined,
              direction: locale.direction
            } }>
              {
                hand?.map((card, i) =>
                {
                  const deg = i > hand.length * 0.5 ?
                    -(hand.length / 2) :
                    (hand.length / 2);

                  const y = i > hand.length * 0.5 ?
                    (hand.length / 3) :
                    -(hand.length / 3);

                  return <Card
                    key={ card.key }
                    style={ {
                      marginLeft: !miniView ? margin : undefined,
                      marginRight: !miniView ? margin : undefined,
                      transform: !miniView ? `rotateZ(${deg}deg) translateY(${y}px)` : undefined
                    } }
                    onClick={ c => this.activateCard(c, card, i) }
                    allowed={ true }
                    type={ card.type }
                    blank={ card.blank }
                    content={ card.content }/>;
                })
              }
            </div>
          </div>
        </div>
      </Interactable>
    </div>;
  }
}

HandOverlay.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
  size: PropTypes.object
};

const styles = createStyle({
  view: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },

  container: {
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

      margin: '0',
      borderRadius: '0'
    }
  },

  handler: {
    display: 'flex',
    justifyContent: 'center',
    margin: '15px',

    '> div': {
      backgroundColor: colors.handler,
      width: 'calc(35px + 2.5%)',
      height: '6px',
      borderRadius: '6px'
    }
  },

  wrapper: {
    overflow: 'hidden overlay',

    // 36px for the handler
    // 31px for portrait mode state bar
    height: 'calc(100vh - 36px - 31px)',

    '::-webkit-scrollbar':
    {
      width: '3px'
    },

    '::-webkit-scrollbar-thumb':
    {
      boxShadow: `inset 0 0 3px 3px ${colors.handScrollbar}`
    }
  },

  cards: {
    display: 'flex',
    justifyContent: 'center',

    '> div': {
      transition: 'margin 0.35s ease',
      
      margin: '20px',

      '> [data-type="white"]': {
        border: `1px solid ${colors.whiteCardHover}`
      },
      
      '> [data-type="black"]': {
        border: `1px solid ${colors.blackCardHover}`
      },

      ':hover': {
        margin: '20px 10px !important',
        zIndex: 10
      }
    }
  }
});

export default withTranslation(HandOverlay);
