import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from '../interactable/noNative.js';

import { Value } from 'animated';

import LineTo from './lineTo.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { locale } from '../i18n.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

const colors = getTheme();

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

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
    // if a change happen in room's state
    if (this.stateroomState !== roomData.state)
    {
      // the field overlay is only visible in matches
      this.visibility(roomData.state === 'match');

      // if lobby clear field
      if (roomData.state === 'lobby')
      {
        this.setState({
          hoverIndex: undefined,
          field: []
        });
      }
    }

    if (roomData.roundEnded)
    {
      this.setState({
        hoverIndex: undefined
      });
    }

    if (roomData.field)
    {
      const lines = [];

      roomData.field.forEach((entry, entryIndex) =>
      {
        entry.cards.forEach((card, i) =>
        {
          if (entry.cards[i + 1])
            lines.push({
              id: entry.id !== undefined,
              from: card.key,
              to: entry.cards[i + 1].key,
              entryIndex: entryIndex
            });
        });
      });

      this.setState({
        field: roomData.field,
        lines: lines
      });
    }
    
    this.setState({
      roomState: roomData.state,
      winnerEntryIndex: (roomData.roundEnded) ? roomData.roundEnded.winnerEntryIndex : undefined,
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

  /** send the card the judge choose to the server's match logic
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
      if (value >= size.width)
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

          frictionAreas={ [ { damping: 0.65 } ] }

          dragEnabled={ false }

          horizontalOnly={ true }
          initialPosition={ { x: size.width, y: 0 } }

          snapPoints={ [ { x: size.width, y: 0 }, { x: 0, y: 0 } ] }

          boundaries={ {
            left: 0,
            right: size.width
          } }
        >
          <div className={ styles.wrapper }>
            <div className={ styles.container }>
              {
                this.state.field.map((entry, entryIndex) =>
                {
                  const isAllowed = this.state.playerState === 'judging' && entryIndex > 0;

                  return entry.cards.map((card, i) =>
                  {
                    let owner;

                    if (i === 0 && entry.id && entryIndex > 0)
                      owner = this.state.playerProperties[entry.id].username;

                    const onMouseEnter = () =>
                    {
                      this.setState({
                        hoverIndex: entryIndex
                      });
                    };

                    const onMouseLeave = () =>
                    {
                      this.setState({
                        hoverIndex: undefined
                      });
                    };

                    return <Card
                      key={ card.key }
                      elementId={ card.key }
                      onMouseEnter={ (isAllowed) ? onMouseEnter : undefined }
                      onMouseLeave={ (isAllowed) ? onMouseLeave : undefined }
                      onClick={ () => this.judgeCard(entryIndex, isAllowed) }
                      allowed={ isAllowed.toString() }
                      highlighted={ (this.state.hoverIndex === entryIndex).toString() }
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
              return (o.entryIndex === this.state.hoverIndex || o.id) ? <LineTo
                key={ i }
                within={ styles.container }
                borderColor={ colors.entryLine }
                borderWidth={ 10 }
                from={ o.from }
                to={ o.to }
              /> : <div key={ i }/>;
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
    position: 'relative',
    height: '100vh'
  },

  wrapper: {
    overflowX: 'hidden',
    overflowY: 'scroll',

    position: 'relative',
    backgroundColor: colors.fieldBackground,

    height: '100%',

    margin: '0',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      left: '-10px',
      
      width: '100%',
      
      padding: '0 10px'
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
      width: 'calc(115px + 2vw + 2vh)',
      margin: '20px'
    }
  }
});

export default FieldOverlay;


