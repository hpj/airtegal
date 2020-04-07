import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { EventEmitter } from 'events';

import { Value } from 'animated';

import PanResponder from 'react-panresponder-web';

import Interactable from 'react-interactable/noNative';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

import { shareEntry } from './shareOverlay.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

export const gestures = new EventEmitter();

class FieldOverlay extends StoreComponent
{
  constructor()
  {
    super({
      fieldHidden: true,

      field: [],
      votes: {}
    });

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      
      onPanResponderMove: (evt, gesture) =>
      {
        if (typeof gesture !== 'object')
          return;
      
        this.panResponderMove = {
          x0: gesture.x0,
          y0: gesture.y0,
          moveX: gesture.moveX,
          moveY: gesture.moveY
        };
      },
    
      onPanResponderRelease: () =>
      {
        if (typeof this.panResponderMove !== 'object')
          return;
        
        const { x0, y0, moveX, moveY } = this.panResponderMove;

        const [ deltaX, deltaY ] = [ x0 - moveX, y0 - moveY ];

        if (deltaX > 150)
          gestures.emit('left');

        if (deltaX < -150)
          gestures.emit('right');

        if (deltaY > 100)
          gestures.emit('up');

        if (deltaY < -100)
          gestures.emit('down');
      }
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
      changes?.roomData?.votes ||
      changes?.field ||
      changes?.fieldHidden ||
      changes?.winnerEntryIndex ||
      changes?.votes)
      return true;
  }

  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;
    
    // if lobby clear field
    if (roomData.state === 'lobby')
    {
      state.field = [];

      this.visibility(false);
    }
    else
    {
      this.visibility(true);
    }

    if (roomData.reason.message === 'vote')
      state.votes = roomData.votes;
    else if (roomData.reason.message !== 'round-ended')
      state.votes = {};

    if (roomData.reason.message === 'round-ended')
      state.winnerEntryIndex = (typeof roomData.reason.details === 'number') ? roomData.reason.details : undefined;
    else if (roomData.reason.message === 'round-started')
      state.winnerEntryIndex = undefined;

    if (roomData.field)
      state.field = roomData.field;

    return state;
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
    if (!overlayRef.current)
      return;
    
    overlayRef.current.snapTo({ index: (visible) ? 1 : 0 });
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

    let totalLineWidth = 0;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (Math.round(value) >= size.width)
        this.store.set({ fieldHidden: true });
      else
        this.store.set({ fieldHidden: false });
    });

    return (
      <div className={ styles.view }>
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 2,
            display: (this.state.fieldHidden) ? 'none' : '',

            overflow: 'hidden',

            width: '100%',
            height: '100%'
          } }

          animatedValueX={ overlayAnimatedX }

          frictionAreas={ [ { damping: 0.6 } ] }

          dragEnabled={ false }

          horizontalOnly={ true }
          initialPosition={ { x: size.width } }

          snapPoints={ [ { x: size.width }, { x: 0 } ] }

          boundaries={ {
            left: 0,
            right: size.width
          } }
        >
          <div className={ styles.wrapper } { ...this.panResponder.panHandlers }>
            <div className={ styles.container }>
              {
                this.state.field.map((entry, entryIndex) =>
                {
                  const percent = (s, percent) =>
                  {
                    const n = (s / 100) * percent;
                  
                    return n;
                  };

                  const isAllowed =
                    (playerState === 'judging' || (playerState === 'voting' && entry.id !== socket.id))
                    && entryIndex > 0;

                  return entry.cards.map((card, i) =>
                  {
                    const rowWidth = 115 + 40 + percent(size.width, 2) + percent(size.height, 2);

                    let newLine = false;

                    totalLineWidth = totalLineWidth + rowWidth;

                    if (totalLineWidth > size.width)
                    {
                      totalLineWidth = rowWidth;
                      newLine = true;
                    }

                    let line;

                    if (entry.cards[i - 1] && entry.cards[i + 1] && newLine)
                      line = 'both';
                    else if (entry.cards[i - 1] && newLine)
                      line = 'left';
                    else if (entry.cards[i + 1])
                      line = 'right';

                    return <Card
                      key={ card.key }
                      line={ line }
                      newLine={ newLine }
                      onClick={ () => this.judgeCard(entryIndex, isAllowed) }
                      shareEntry={ (entryIndex === this.state.winnerEntryIndex && i == 0) ? () => this.shareEntry(entryIndex) : undefined }
                      allowed={ isAllowed.toString() }
                      self={ (entry.id && entry.id === socket.id && entryIndex > 0) }
                      owner={ (entry.id && entryIndex > 0 && this.state.roomData?.playerProperties[entry.id]) ? this.state.roomData?.playerProperties[entry.id].username : undefined }
                      type={ card.type }
                      // eslint-disable-next-line security/detect-object-injection
                      votes={ this.state.votes[entryIndex] }
                      content={ card.content }
                      winner= { (entryIndex === this.state.winnerEntryIndex) }
                      hidden={ card.hidden }/>;
                  });
                })
              }
            </div>
          </div>
        </Interactable.View>
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


