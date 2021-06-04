import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import Interactable from './Interactable.js';

import Card from './card.js';

import Block from './block.js';

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
      field: [],
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
      changes?.field ||
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

    // if in match
    state.fieldVisible = roomData?.state === 'match' ? true : false;

    if (!roomData)
      return;

    state.winnerEntryIndex = roomData.phase === 'transaction' ?
      roomData.field.findIndex(e => e.highlight) :
      undefined;

    state.field = roomData.field;

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

    const { roomData } = this.state;
    
    sendMessage('matchLogic', { index, content }).then(() =>
    {
      // store the entry for the match highlights

      if (roomData.options.gameMode === 'kuruit')
      {
        
        const { entries } = this.state;
  
        entries.push([
          this.state.field[0].cards[0].content,
          // eslint-disable-next-line security/detect-object-injection
          ...this.state.field[index].cards.map(c => c.content)
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
    const { roomData } = this.state;

    if (roomData.options.gameMode === 'kuruit')
    {
      shareEntry(
        this.state.field[0].cards[0].content,
        // eslint-disable-next-line security/detect-object-injection
        this.state.field[index].cards.map(c => c.content));
    }
  }

  render()
  {
    const { size } = this.props;

    const { roomData, winnerEntryIndex } = this.state;

    const gameMode = roomData?.options.gameMode;

    const playerState = roomData?.playerProperties[socket.id]?.state;
    
    const onMovement = ({ x }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (x >= size.width)
        this.store.set({ fieldHidden: true });
      else if (!this.state.fieldHidden || this.state.fieldVisible)
        this.store.set({ fieldHidden: false });
    };

    return (
      <div className={ styles.view }>
        <Interactable
          ref={ overlayRef }

          style={ {
            zIndex: 2,
            overflow: 'hidden',

            display: this.state.fieldHidden ? 'none' : undefined,

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
                    this.state.field.map((entry, entryIndex) =>
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
                            allowed={ allowed || winner }
                            self={ roomData?.phase === 'transaction' && entry.id === socket.id && card.type === 'white' }
                            owner={ (roomData?.phase === 'transaction' && card.type === 'white') ? roomData?.playerProperties[entry.id]?.username : undefined }
                            winner= { winner }
                            share={ winner && cardIndex === 0 }
                            onClick={ () => winner ? this.shareEntry(entryIndex) : this.submit(entryIndex, undefined, allowed) }
                          />)
                        }
                      </div>;
                    })
                  }
                </div>
                :
                <div id={ 'qassa-field-overlay' } className={ styles.container }>
                  {
                    this.state.field[0]?.story.composed ? <div className={ styles.qassa }>
                      { this.state.field[0]?.story.composed.text }
                    </div> :
                      this.state.field[0]?.story.blocks.map((block, blockIndex) => <Block
                        key={ blockIndex }
                        block={ block }
                        allowed={ playerState === 'writing' }
                        onSubmit={ content => this.submit(blockIndex, content, playerState === 'writing') }
                      />)
                  }
                </div>
            }
          </div>
        </Interactable>
      </div>
    );
  }
}

FieldOverlay.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  size: PropTypes.object
};

const styles = createStyle({
  view: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },

  wrapper: {
    overflow: 'hidden overlay',

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
      width: '6px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '6px',
      boxShadow: `inset 0 0 6px 6px ${colors.fieldScrollbar}`
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
    userSelect: 'none',
    direction: locale.direction,
    
    color: colors.whiteText,
    backgroundColor: colors.blackCardBackground,
    
    fontWeight: 700,
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    lineHeight: '2em',
    whiteSpace: 'pre-wrap',

    width: '100%',
    maxWidth: '480px',

    padding: '45px 35px',
    margin: '45px 0',
    borderRadius: '10px'
  }
});

export default FieldOverlay;


