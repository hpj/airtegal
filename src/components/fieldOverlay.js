import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import { createStyle } from 'flcss';

import Interactable from './Interactable.js';

import Card from './card.js';

import { shareEntry } from './shareOverlay.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

class FieldOverlay extends StoreComponent
{
  constructor()
  {
    super({
      fieldHidden: true,
      field: []
    });
  }

  /**
  * @param { string[] } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData?.state ||
      changes?.roomData?.reason?.message ||
      changes?.roomData?.reason?.details ||
      changes?.roomData?.field ||
      changes?.field ||
      changes?.fieldHidden ||
      changes?.fieldVisible ||
      changes?.winnerEntryIndex)
      return true;
  }

  stateWillChange({ roomData })
  {
    const state = {};

    // if in match
    if (roomData?.state === 'match')
      state.fieldVisible = true;
    else
      state.fieldVisible = false;

    if (!roomData)
      return;

    if (roomData.reason.message === 'round-ended')
      state.winnerEntryIndex = (typeof roomData.reason.details === 'number') ? roomData.reason.details : undefined;
    else if (roomData.reason.message === 'round-started')
      state.winnerEntryIndex = undefined;

    if (roomData.field)
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
  * @param { number } entryIndex
  * @param { boolean } isAllowed if the card can be picked
  */
  judgeCard(entryIndex, isAllowed)
  {
    const { sendMessage } = this.props;

    if (isAllowed)
      sendMessage('matchLogic', { entryIndex }).then(() =>
      {
        // send the entry to match report

        const entries = [ ...this.state.entries ];

        entries.push([
          this.state.field[0].cards[0],
          // eslint-disable-next-line security/detect-object-injection
          ...this.state.field[entryIndex].cards
        ]);
  
        this.store.set({
          entries
        });
      });
  }

  shareEntry(entryIndex)
  {
    shareEntry(
      this.state.field[0].cards[0].content,
      // eslint-disable-next-line security/detect-object-injection
      this.state.field[entryIndex].cards.map((card) => card.content));
  }

  render()
  {
    const { size } = this.props;

    const playerState = this.state.roomData?.playerProperties[socket.id]?.state;
    
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
            <div className={ styles.container }>
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
                      shareEntry={ (entryIndex === this.state.winnerEntryIndex && i == 0) ? () => this.shareEntry(entryIndex) : undefined }
                      allowed={ isAllowed.toString() }
                      self={ (entry.id && entry.id === socket.id && entryIndex > 0) }
                      owner={ (entry.id && entryIndex > 0 && this.state.roomData?.playerProperties[entry.id]) ? this.state.roomData?.playerProperties[entry.id].username : undefined }
                      type={ card.type }
                      content={ card.content }
                      winner= { (entryIndex === this.state.winnerEntryIndex) }
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

    height: '100%',

    margin: '0',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      width: '100%'
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


