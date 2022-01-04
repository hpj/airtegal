import React, { createRef } from 'react';

import { createAnimation, createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { sendMessage } from '../utils.js';

import { shareRef } from '../screens/game.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

import Interactable from './interactable.js';

import Card from './card.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @prop { import('./roomOverlay').RoomData['field'] } field
* @extends {React.Component<{}, State>}
*/
class FieldOverlay extends StoreComponent
{
  constructor()
  {
    super({
      fieldHidden: true
    });
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData ||
      changes?.fieldHidden ||
      changes?.fieldVisible
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    const state = {};

    state.fieldVisible = roomData?.state === 'match';

    return state;
  }

  stateDidChange(state)
  {
    if (state.fieldVisible && overlayRef.current?.lastSnapIndex === 0)
      overlayRef.current.snapTo({ index: 1 });
    else if (!state.fieldVisible && overlayRef.current?.lastSnapIndex >= 1)
      overlayRef.current.snapTo({ index: 0 });
  }

  submit(index, content, allowed)
  {
    if (!allowed)
      return;
      
    const { options, field } = this.state.roomData;
    
    sendMessage('matchLogic', { index, content }).then(() =>
    {
      // store the entry for the match highlights

      if (options.gameMode === 'kuruit')
      {
        const { entries } = this.state;
  
        entries.push([
          field[0].cards[0].content,
          ...field[index].cards.map(c => c.content)
        ]);

        this.store.set({ entries });
      }
    });
  }

  /**
  * @param { number } index
  */
  share(index)
  {
    const { options, field } = this.state.roomData;

    if (options.gameMode === 'kuruit')
    {
      shareRef.current?.shareEntry({
        black: field[0]?.cards[0]?.content,
        white: field[index]?.cards?.map(c => c.content)
      });
    }
  }

  render()
  {
    const { locale, translation, size } = this.props;

    const { roomData, fieldHidden, fieldVisible } = this.state;

    let field = roomData?.field ?? [];

    const playerState = roomData?.playerProperties.state;

    const phase = roomData?.phase;
    const gameMode = roomData?.options.gameMode;
    
    const onMovement = ({ x }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (x >= size.width)
        this.store.set({ fieldHidden: true });
      else if (!fieldHidden || fieldVisible)
        this.store.set({ fieldHidden: false });
    };

    if (gameMode === 'democracy')
    {
      // show only the black card
      if (phase === 'picking')
        field = [ field[0] ];
      // add a separator element
      else if (phase === 'judging')
        field = [ field[0], field[1], { type: 'separator' }, field[2] ];
    }

    return <div className={ styles.view }>
      <Interactable
        ref={ overlayRef }

        style={ {
          zIndex: 2,
          overflow: 'hidden',

          display: fieldHidden ? 'none' : undefined,

          width: '100%',
          height: '100%'
        } }

        dragEnabled={ false }

        horizontalOnly={ true }

        onMovement={ onMovement }

        frame={ { pixels: Math.round(size.width * 0.05), every: 8 } }

        boundaries={ {
          left: 0,
          right: size.width
        } }

        initialPosition={ { x: size.width } }
        
        snapPoints={ [ { x: size.width }, { x: 0 } ] }
      >
        <div className={ styles.wrapper }>

          <div className={ styles.banner } style={ { direction: locale.direction } }>
            {
              // show spectators a banner that they are only watching
              playerState === 'spectating' ? translation('spectating') :
                // show judges a banner that they have to wait
                roomData?.phase === 'picking' && playerState === 'judging' ? translation('judging') :
                  undefined
            }
          </div>
          
          <div id={ 'kuruit-field-overlay' } className={ styles[gameMode] } data-phase={ phase } style={ { direction: locale.direction } }>
            {
              field.map(({ key, id, type, cards, highlight, votes }, entryIndex) =>
              {
                const allowed = playerState === 'judging' && entryIndex > 0;

                if (type === 'separator')
                  return <div className={ styles.separator } key={ entryIndex }>
                    { translation('or') }
                  </div>;

                return <div className={ styles.entry } data-gamemode={ gameMode } key={ key }>
                  {
                    cards?.map((card, cardIndex) =>
                    {
                      return <Card
                        key={ card.key }
                        type={ card.type }
                        content={ card.content }
                        hidden={ !card.content }
                        allowed={ allowed }
                        votes={ votes }
                        winner= { highlight }
                        locale={ locale }
                        translation={ translation }
                        phase={ phase }
                        gameMode={ gameMode }
                        share={ roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 }
                        owner={ (roomData?.phase === 'transaction' && card.type === 'white') ? id : undefined }
                        onClick={ () => roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 ? this.share(entryIndex) : this.submit(entryIndex, undefined, allowed) }
                      />;
                    })
                  }
                </div>;
              })
            }
          </div>
        </div>
      </Interactable>
    </div>;
  }
}

const hoverAnimation = createAnimation({
  duration: '1.5s',
  delay: '0.3s',
  timingFunction: 'ease-in-out',
  iterationCount: process.env.NODE_ENV === 'test' ? '0' : 'infinite',
  fillMode: 'forwards',
  direction: 'alternate',
  keyframes: {
    '0%': {
      transform: 'translateY(-10px) rotateZ(2deg)'
    },
    '50%': {
      transform: 'translateY(-5px) rotateZ(-2deg)'
    },
    '100%': {
      transform: 'translateY(-10px) rotateZ(2deg)'
    }
  }
});

const styles = createStyle({
  view: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },

  wrapper: {
    overflow: 'auto',

    position: 'relative',
    backgroundColor: colors.fieldBackground,

    height: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      width: '100%'
    },

    '::-webkit-scrollbar':
    {
      width: 0
    }
  },

  banner: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',

    userSelect: 'none',

    color: opacity(colors.blackText, colors.semitransparent),
    backgroundColor: colors.trackBarBackground,
  
    fontSize: 'calc(6px + 0.35vw + 0.35vh)',

    padding: '10px',

    transition: 'padding 0.25s ease-in-out',

    ':empty': {
      height: 0,
      padding: 0
    },
  
    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '10px 15px'
    }
  },

  kuruit: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  democracy: {
    display: 'grid',

    '[data-phase="judging"]': {
      height: 'auto',
      maxWidth: '960px',

      margin: '0 auto',
      
      alignItems: 'center',

      gridTemplateAreas: '". . ." "title title title" "a or b" ". . ."',
      gridTemplateRows: '1fr min-content min-content 1fr',

      '@media screen and (max-width: 840px)': {
        gridTemplateAreas: '"." "title" "a" "or" "b" "."',
        gridTemplateRows: '1fr min-content min-content min-content min-content 1fr',

        '> :nth-child(1)': {
          margin: '5vh auto',
          transform: 'rotateZ(2deg)'
        },

        '> :nth-child(2)': {
          transform: 'rotateZ(-2deg)'
        },

        '> :nth-child(3)': {
          transform: 'rotateZ(2deg)'
        },

        '> :nth-child(4)': {
          transform: 'rotateZ(4deg)'
        }
      },

      '> :nth-child(1)': {
        gridArea: 'title',
        margin: '10vh auto',
        transform: 'rotateZ(2deg)'
      },

      '> :nth-child(2)': {
        gridArea: 'a',
        margin: '2.5vh auto',
        transform: 'rotateZ(4deg)'
      },

      '> :nth-child(3)': {
        gridArea: 'or',
        margin: '15px auto',
        transform: 'translateY(-10px) rotateZ(8deg)'
      },

      '> :nth-child(4)': {
        gridArea: 'b',
        margin: '2.5vh auto',
        transform: 'rotateZ(-8deg)'
      }
    },

    '[data-phase="picking"]': {
      height: '50%',

      alignItems: 'center',
      justifyContent: 'center',
      
      '> :nth-child(1)': {
        animation: hoverAnimation,
        transform: 'translateY(-10px) rotateZ(2deg)'
      }
    }
  },

  separator: {
    display: 'flex',
    userSelect: 'none',

    alignItems: 'center',
    justifyContent: 'center',

    width: '42px',
    height: '42px',
        
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',

    color: colors.whiteCardForeground,
    backgroundColor: colors.whiteCardBackground
  },

  entry: {
    position: 'relative',
    display: 'flex',

    '> div': {
      margin: '20px 2.5vw'
    },

    // group lines
    '[data-gamemode="kuruit"]:after': {
      content: '""',
      position: 'absolute',
      backgroundColor: colors.fieldGroupLine,
      left: '2.5vw',
      top: 'calc(50% - 1px)',
      width: 'calc(100% - 5vw)',
      height: '2px'
    }
  }
});

export default withTranslation(FieldOverlay);


