import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import { fillTheBlanks } from '../utils.js';

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
  * @param { boolean } isAllowed if the card can be picked
  */
  judgeCard(index, isAllowed)
  {
    const { sendMessage } = this.props;

    if (isAllowed)
      sendMessage('matchLogic', { picks: [ { index } ] }).then(() =>
      {
        // send the entry to match report

        const { entries } = this.state;

        entries.push([
          this.state.field[0].cards[0].content,
          // eslint-disable-next-line security/detect-object-injection
          ...this.state.field[index].cards.map(c => c.content)
        ]);
  
        this.store.set({
          entries
        });
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
      this.state.field[index].cards.map((card) => card.content));
  }

  render()
  {
    const { size } = this.props;

    const { roomData, winnerEntryIndex } = this.state;

    const playerState = roomData?.playerProperties[socket.id]?.state;
    
    const percent = (s, percent) => (s / 100) * percent;

    // TODO this value will break every time field width changes
    const lineWidth = (size.width < 1080) ? size.width : percent(size.width, 85);

    // TODO this value will break every time card width changes
    const cardWidth = 115 + 40 + percent(size.width, 2) + percent(size.height, 2);

    let cardsPerLine = 1, cardNo = 0;

    // count how many cards can fit in one line of the field
    for (;;)
    {
      if (cardWidth * (cardsPerLine + 1) < lineWidth)
        cardsPerLine = cardsPerLine + 1;
      else
        break;
    }

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
            display: (this.state.fieldHidden) ? 'none' : '',

            overflow: 'hidden',

            width: '100%',
            height: '100%'
          } }

          horizontalOnly={ true }
          
          dragEnabled={ false }
  
          frame={ { pixels: Math.round(size.width * 0.05), every: 8 } }

          initialPosition={ { x: size.width } }
          
          boundaries={ {
            left: 0,
            right: size.width
          } }

          snapPoints={ [ { x: size.width }, { x: 0 } ] }

          onMovement={ onMovement }
        >
          <div className={ styles.wrapper }>
            <div id={ 'kuruit-field-overlay' } className={ styles.container }>
              {
                this.state.field.map((entry, entryIndex) =>
                {
                  const isAllowed =
                    (playerState === 'judging')
                    && entryIndex > 0;

                  return entry.cards.map((card, i) =>
                  {
                    let arrow, newLine = false;

                    // using current cardNo and cardsPerLine
                    // find out if the card starts a new line
                    // if not increase the cardNo
                    if (cardNo === cardsPerLine)
                      cardNo = 1, newLine = true;
                    else
                      cardNo = cardNo + 1;

                    // always true but if the card is
                    // not the last in its entry only
                    if (cardsPerLine === 1)
                    {
                      if (entry.cards.length > 1 && i !== entry.cards.length - 1)
                        arrow = 'down';
                    }

                    else if (newLine && entry.cards.length > 1 && i === entry.cards.length - 1)
                      arrow = 'right';
    
                    else if (newLine && entry.cards.length > 1 && i > 0)
                      arrow = 'right-left';
                    
                    else if (entry.cards.length > 1 && i !== entry.cards.length  - 1)
                      arrow = 'left';
                    
                    return <Card
                      key={ card.key }
                      arrow={ arrow }
                      onClick={ () => this.judgeCard(entryIndex, isAllowed) }
                      shareEntry={ (entryIndex === winnerEntryIndex && i === 0) ? () => this.shareEntry(entryIndex) : undefined }
                      allowed={ isAllowed.toString() }
                      self={ roomData?.phase === 'transaction' && entry.id === socket.id && entryIndex > 0 }
                      owner={ (roomData?.phase === 'transaction' && entryIndex > 0) ? roomData?.playerProperties[entry.id]?.username : undefined }
                      type={ card.type }
                      content={ card.content }
                      winner= { entryIndex === winnerEntryIndex }
                      hidden={ card.hidden }/>;
                  });
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
  addNotification: PropTypes.func.isRequired,
  size: PropTypes.object
};

const styles = createStyle({
  view: {
    position: 'absolute',

    height: '100%',
    width: '100%'
  },

  wrapper: {
    overflowX: 'hidden',
    overflowY: 'overlay',

    position: 'relative',
    backgroundColor: colors.fieldBackground,

    left: '10px',
    height: '100%',

    margin: '0',
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
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.fieldScrollbar}`
    }
  },

  container: {
    display: 'grid',

    direction: locale.direction,
    
    gridTemplateColumns: 'repeat(auto-fill, calc(115px + 40px + 2vw + 2vh))',
    justifyContent: 'space-around',

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

export default FieldOverlay;


