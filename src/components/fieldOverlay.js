import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import Interactable from './Interactable.js';

import Card from './card.js';

import { shareEntry } from './shareOverlay.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
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
      roomData.field.findIndex((e) => e.highlight) :
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

  /** send the card the judge judged to the server's match logic
  * @param { number } index
  * @param { boolean } allowed if the card can be picked
  */
  judgeCard(index, allowed)
  {
    if (!allowed)
      return;
      
    const { sendMessage } = this.props;
    
    sendMessage('matchLogic', { index }).then(() =>
    {
      // store the entry for the match highlights

      const { entries } = this.state;

      entries.push([
        this.state.field[0].cards[0].content,
        // eslint-disable-next-line security/detect-object-injection
        ...this.state.field[index].cards.map(c => c.content)
      ]);

      this.store.set({ entries });
    });
  }

  /**
  * @param { number } index
  */
  shareEntry(index)
  {
    shareEntry(
      this.state.field[0].cards[0].content,
      // eslint-disable-next-line security/detect-object-injection
      this.state.field[index].cards.map(c => c.content));
  }

  render()
  {
    const { size } = this.props;

    const { roomData, winnerEntryIndex } = this.state;

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
            <div id={ 'kuruit-field-overlay' } className={ styles.container }>
              {
                this.state.field.map((entry, entryIndex) =>
                {
                  const winner = entryIndex === winnerEntryIndex;
                  const allowed = playerState === 'judging' && entryIndex > 0;

                  return <div className={ styles.entry } key={ entry.key }>
                    {
                      entry.cards.map((card, cardIndex) =>
                      {
                        return <Card
                          key={ card.key }
                          type={ card.type }
                          hidden={ card.hidden }
                          content={ card.content }
                          allowed={ allowed || winner }
                          self={ roomData?.phase === 'transaction' && entry.id === socket.id && card.type === 'white' }
                          owner={ (roomData?.phase === 'transaction' && card.type === 'white') ? roomData?.playerProperties[entry.id]?.username : undefined }
                          winner= { winner }
                          share={ winner && cardIndex === 0 }
                          onClick={ () =>
                          {
                            if (winner)
                              this.shareEntry(entryIndex);
                            else
                              this.judgeCard(entryIndex, allowed);
                          } }
                        />;
                      })
                    }
                  </div>;
                })
              }
            </div>
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
  }
});

export default FieldOverlay;


