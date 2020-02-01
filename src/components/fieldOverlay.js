import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { EventEmitter } from 'events';

import { Value } from 'animated';

import PanResponder from 'react-panresponder-web';

import Interactable from 'react-interactable/noNative';

import LineTo from './lineTo.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

export const gestures = new EventEmitter();

class FieldOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      overlayHidden: true,

      field: [],
      lines: []
    };

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

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);
  }

  onRoomData(roomData)
  {
    // if lobby clear field
    if (roomData.state === 'lobby')
    {
      this.setState({
        field: []
      });

      this.visibility(false);
    }
    else
    {
      this.visibility(true);
    }

    if (roomData.reason.message === 'round-ended')
    {
      this.setState({
        winnerEntryIndex: (typeof roomData.reason.details === 'number') ? roomData.reason.details : undefined
      });
    }
    else
    {
      this.setState({
        winnerEntryIndex: undefined
      });
    }

    if (roomData.field)
    {
      const lines = [];

      roomData.field.forEach((entry) =>
      {
        entry.cards.forEach((card, i) =>
        {
          if (entry.cards[i + 1])
            lines.push({
              from: card.key,
              to: entry.cards[i + 1].key
            });
        });
      });

      this.setState({
        field: roomData.field,
        lines: lines
      });
    }
    
    this.setState({
      playerState: roomData.playerProperties[socket.id].state,
      playerProperties: roomData.playerProperties
    });
  }

  /** @param { boolean } visible
  */
  visibility(visible)
  {
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
      sendMessage('matchLogic', { entryIndex });
  }

  render()
  {
    const { size } = this.props;

    // on overlay position changes
    overlayAnimatedX.removeAllListeners();

    overlayAnimatedX.addListener(({ value }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (Math.round(value) >= size.width)
        this.setState({ overlayHidden: true });
      else
        this.setState({ overlayHidden: false });
    });

    return (
      <div className={ styles.view }>
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 2,
            display: (this.state.overlayHidden) ? 'none' : '',

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
                  const isAllowed = this.state.playerState === 'judging' && entryIndex > 0;

                  return entry.cards.map((card, i) =>
                  {
                    let owner;

                    if (i === 0 && entry.id && entryIndex > 0 && this.state.playerProperties[entry.id])
                      owner = this.state.playerProperties[entry.id].username;

                    return <Card
                      key={ card.key }
                      elementId={ card.key }
                      onClick={ () => this.judgeCard(entryIndex, isAllowed) }
                      allowed={ isAllowed.toString() }
                      owner={ owner }
                      type={ card.type }
                      content={ card.content }
                      winner= { (entryIndex === this.state.winnerEntryIndex).toString() }
                      hidden={ card.hidden }/>;
                  });
                })
              }
            </div>
          </div>

          {
            this.state.lines.map((o, i) =>
            {
              return <LineTo
                key={ i }
                size={ size }
                within={ styles.wrapper }
                borderColor={ colors.entryLine }
                borderWidth={ 10 }
                from={ o.from }
                to={ o.to }
              />;
            })
          }

        </Interactable.View>
      </div>
    );
  }
}

FieldOverlay.propTypes = {
  size: PropTypes.object,
  sendMessage: PropTypes.func.isRequired
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

    '> * > *': {
      width: 'calc(115px + 2vw + 2vh)',

      minHeight: 'calc((115px + 2vw + 2vh) * 1.35)',
      height: 'auto',

      margin: '20px'
    },

    '> [owner="true"] > *': {
      paddingTop: '5px',
      paddingBottom: '5px'
    },

    '> * > * > textarea': {
      minHeight: 'calc(100% - 20px)'
    }
  }
});

export default FieldOverlay;


