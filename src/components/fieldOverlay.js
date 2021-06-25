import React, { createRef } from 'react';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import PropTypes from 'prop-types';

import { createStyle, createAnimation } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import i18n, { locale } from '../i18n.js';

import Interactable from './Interactable.js';

import Card from './card.js';

import Box from './box.js';

import { shareEntry } from './shareOverlay.js';

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
      changes?.fieldVisible ||
      changes?.winnerEntryIndex
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

    if (!roomData)
      return;

    state.winnerEntryIndex = roomData.phase === 'transaction' ?
      roomData.field.findIndex(e => e.highlight) :
      undefined;

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
      
    const { sendMessage } = this.props;

    const { options, field } = this.state.roomData;
    
    sendMessage('matchLogic', { index, content }).then(() =>
    {
      // store the entry for the match highlights

      if (options.gameMode === 'kuruit')
      {
        const { entries } = this.state;
  
        entries.push([
          field[0].cards[0].content,
          // eslint-disable-next-line security/detect-object-injection
          ...field[index].cards.map(c => c.content)
        ]);

        this.store.set({ entries });
      }
    });
  }

  /**
  * @param { number } index
  */
  shareEntry(index)
  {
    const { options, field } = this.state.roomData;

    if (options.gameMode === 'qassa')
    {
      shareEntry(field[0]?.story?.composed?.text.replace(/\\n/g, '\n'));
    }
    else if (options.gameMode === 'kuruit')
    {
      shareEntry(
        field[0]?.cards[0]?.content,
        // eslint-disable-next-line security/detect-object-injection
        field[index]?.cards?.map(c => c.content));
    }
  }

  render()
  {
    const { size } = this.props;

    const { roomData, fieldHidden, fieldVisible, winnerEntryIndex } = this.state;

    const field = roomData?.field ?? [];

    const gameMode = roomData?.options.gameMode;

    const playerState = roomData?.playerProperties[socket.id]?.state;
    
    const onMovement = ({ x }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (x >= size.width)
        this.store.set({ fieldHidden: true });
      else if (!fieldHidden || fieldVisible)
        this.store.set({ fieldHidden: false });
    };

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
        snapPoints={ [ { x: size.width }, { x: 0 } ] }
        initialPosition={ { x: size.width } }
      >
        <div className={ styles.wrapper }>
          {
            gameMode === 'kuruit' ?
              <div id={ 'kuruit-field-overlay' } className={ styles.container }>
                {
                  field.map((entry, entryIndex) =>
                  {
                    const winner = entryIndex === winnerEntryIndex;
                    const allowed = playerState === 'judging' && entryIndex > 0;

                    return  <div className={ styles.entry } key={ entry.key }>
                      {
                        entry.cards.map((card, cardIndex) => <Card
                          key={ card.key }
                          type={ card.type }
                          content={ card.content }
                          hidden={ !card.content }
                          allowed={ allowed }
                          self={ roomData?.phase === 'transaction' && entry.id === socket.id && card.type === 'white' }
                          owner={ (roomData?.phase === 'transaction' && card.type === 'white') ? roomData?.playerProperties[entry.id]?.username : undefined }
                          winner= { winner }
                          share={ roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 }
                          onClick={ () => roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 ? this.shareEntry(entryIndex) : this.submit(entryIndex, undefined, allowed) }
                        />)
                      }
                    </div>;
                  })
                }
              </div>
              :
              <TransitionGroup id={ 'qassa-field-overlay' } className={ styles.container }>
                {
                  field[0]?.story?.composed ?
                    <CSSTransition key={ field[0].story.key } timeout={ 250 }>
                      <div className={ styles.qassa }>
                        <div className={ styles.content } onClick={ () => this.shareEntry() }>
                          { field[0].story.composed?.text.replace(/\\n/g, '\n') }
                          <div className={ styles.bottom }>
                            { i18n('qassa') }
                            <ShareIcon className={ styles.share }/>
                          </div>
                        </div>
                      </div>
                    </CSSTransition>
                    :
                    field[0]?.story?.items.map((item, index) =>
                      <CSSTransition key={ item.key } timeout={ 250 }>
                        <Box
                          description={ item.description }
                          allowed={ playerState === 'writing' }
                          onSubmit={ content => this.submit(index, content, playerState === 'writing') }
                        />
                      </CSSTransition>)
                }
              </TransitionGroup>
          }
        </div>
      </Interactable>
    </div>;
  }
}

FieldOverlay.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  size: PropTypes.object
};

const hoverAnimation = createAnimation({
  duration: '1.5s',
  timingFunction: 'ease-in-out',
  iterationCount: 'infinite',
  direction: 'alternate',
  keyframes: {
    from: {
      transform: 'translateY(-10px)'
    },
    to: {
      transform: 'translateY(-5px)'
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

    left: '10px',
    height: '100%',

    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
    borderRadius: 'calc(10px + 1.5vw) 0 0 calc(10px + 1.5vw)',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      left: '0',
      width: '100%',
      borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0'
    },

    '::-webkit-scrollbar':
    {
      width: 0
    }
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
    direction: locale.direction,
    justifyContent: 'center'
  },

  entry: {
    position: 'relative',
    display: 'flex',

    '> div': {
      margin: '20px 2.5vw'
    },

    ':after': {
      content: '""',
      position: 'absolute',
      backgroundColor: colors.entryLine,
      left: '2.5vw',
      top: 'calc(50% - 1px)',
      width: 'calc(100% - 5vw)',
      height: '2px'
    }
  },

  qassa: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',

    width: '100%',
    height: 'auto',
    minHeight: '100%',

    '.enter': {
      left: '100vw'
    },
    
    '.enter-active': {
      left: 0,
      transition: 'left 0.25s'
    },

    '.exit': {
      left: 0
    },

    '.exit-active': {
      left: '100vw',
      transition: 'left 0.25s'
    }
  },

  content: {
    cursor: 'pointer',
    userSelect: 'none',
    direction: locale.direction,
    
    color: colors.whiteText,
    backgroundColor: colors.blackCardBackground,
    
    fontWeight: 700,
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    whiteSpace: 'pre-wrap',
    lineHeight: '2em',

    maxWidth: '480px',
    width: '100%',
    height: 'min-content',

    margin: '25px',
    padding: '45px 35px 0',
    borderRadius: '10px',

    ':hover': {
      animation: hoverAnimation
    }
  },

  bottom: {
    display: 'flex',
    padding: '15px 0px 15px'
  },

  share: {
    color: colors.blackCardForeground,

    width: 'calc(14px + 0.3vw + 0.3vh)',
    height: 'calc(14px + 0.3vw + 0.3vh)',

    margin: 'auto auto auto 0'
  }
});

export default FieldOverlay;


