import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import Interactable from 'react-interactable/noNative';

import { Value } from 'animated';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

const overlayRef = createRef();
const overlayAnimatedX = new Value(0);

class FieldOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      overlayHidden: true,

      field: []
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
    // the field overlay is only visible in matches
    this.visibility((roomData.state === 'match') ? true : false);

    if (roomData.field)
    {
      this.setState({
        playerState: roomData.playerProperties[socket.id].state,
        field: roomData.field
      });
    }

    // TODO using this info show the owners of the cards (at the end of the round)
    // and the card that won the round
    if (roomData.roundEnded)
    {
      // roomData.roundEnded.winnerEntryIndex
      // roomData.roundEnded.fieldSecrets
    }
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
      <div style={ { width: '100%', height: '100%' } }>
        <Interactable.View
          ref={ overlayRef }

          style={ {
            zIndex: 2,
            display: (this.state.overlayHidden) ? 'none' : '',

            backgroundColor: colors.fieldBackground,

            overflow: 'hidden',

            top: '-100%',
            width: '100%',
            height: '100%'
          } }

          animatedValueX={ overlayAnimatedX }

          frictionAreas={ [ { damping: 0.6 } ] }

          dragEnabled={ false }

          horizontalOnly={ true }
          initialPosition={ { x: size.width, y: 0 } }

          snapPoints={ [ { x: size.width }, { x: 0 } ] }

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

                  return entry.map((card, cardIndex) =>
                  {
                    return <Card
                      key={ cardIndex }
                      onClick={ () => this.judgeCard(entryIndex, isAllowed) }
                      allowed={ isAllowed.toString() }
                      type={ card.type }
                      content={ card.content }
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
  size: PropTypes.object,
  sendMessage: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    overflowX: 'hidden',
    overflowY: 'scroll',

    height: '100%',

    margin: '0 30px',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      margin: '15px 0 0 0',
      height: 'calc(100% - 15px)'
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
    
    gridTemplateColumns: 'repeat(auto-fill, calc(115px + 40px + 2vw + 2vh))',
    justifyContent: 'space-around',

    '> *': {
      width: 'calc(115px + 2vw + 2vh)',
      margin: '20px'
    }
  }
});

export default FieldOverlay;


