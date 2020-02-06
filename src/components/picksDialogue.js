/* eslint-disable security/detect-object-injection */
import React from 'react';

import PropTypes from 'prop-types';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

import Card from './card.js';

import { requestRoomData } from './roomOverlay.js';

const colors = getTheme();

class PicksDialogue extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      picks: [],
      blanks: []
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);

    this.isPicked = this.isPicked.bind(this);

    this.clearPick = this.clearPick.bind(this);
    this.confirmPick = this.confirmPick.bind(this);

    requestRoomData().then((roomData) => this.onRoomData(roomData));
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
    if (!roomData)
      return;
    
    // client is in the lobby
    // or not picking
    if (
      roomData.state !== 'match' ||
      roomData.playerProperties[socket.id].state !== 'picking'
    )
    {
      this.clearPick();
    }

    if (roomData.options.gameMode === 'king' && roomData.reason.message === 'black-card')
    {
      // the black card picks max length
      this.setState({
        pick: 1
      });
    }
    else if (roomData.field && roomData.field.length > 0)
    {
      // the white card picks max length
      this.setState({
        pick: roomData.field[0].cards[0].pick
      });
    }

    if (roomData.playerSecretProperties && roomData.playerSecretProperties.hand)
    {
      this.setState({
        hand: roomData.playerSecretProperties.hand
      }, this.props.forceGridAnimations);
    }
  }

  pickCard(cardIndex, isAllowed)
  {
    if (!isAllowed)
      return;
    
    const { picks, blanks } = this.state;

    // remove card from the array
    if (this.isPicked(cardIndex))
    {
      const index = picks.indexOf(cardIndex);

      picks.splice(index, 1);
      blanks.splice(index, 1);
    }
    // add card to the array
    else
    {
      picks.push(cardIndex);
      blanks.push('');
    }

    // update state
    this.setState({
      picks,
      blanks
    }, this.props.forceGridAnimations);
  }

  clearPick()
  {
    this.setState({
      picks: [],
      blanks: []
    }, this.props.forceGridAnimations);
  }

  confirmPick()
  {
    if (!this.checkValidity())
      return;
    
    const { sendMessage } = this.props;

    const { picks, hand, blanks } = this.state;

    sendMessage('matchLogic', {
      picks: picks.map((handIndex, i) =>
      {
        if (hand[handIndex].blank)
          return { index: handIndex, content: blanks[i].trim() };
        else
          return { index: handIndex };
      })
    });

    this.clearPick();
  }

  checkValidity()
  {
    if (this.state.pick !== this.state.picks.length)
      return false;
                  
    const { hand, picks, blanks } = this.state;

    for (let i = 0; i < picks.length; i++)
    {
      if (!hand[picks[i]].blank)
        continue;
      
      if (!blanks[i].trim() || !blanks[i].trim() === '' || !blanks[i].trim().length === 0)
        return false;
    }

    return true;
  }

  isPicked(cardIndex)
  {
    return this.state.picks.includes(cardIndex);
  }

  render()
  {
    if (!this.state.hand)
      return <div/>;
    
    return (
      <div className={ styles.wrapper } style={ { display: (this.state.picks.length > 0) ? '' : 'none' } }>

        <div ref= { this.props.gridRef } className={ styles.container }>
          {
            this.state.hand.map((card, i) =>
            {
              const order = this.state.picks.indexOf(i);

              return <Card
                key={ card.key }
                // TODO remove button
                // onClick={ () => this.pickCard(i, true) }
                disabled={ (order >= 0) ? false : true }
                allowed='false'
                picked={ true }
                type={ card.type }
                style={ { order } }
                blank={ card.blank }
                content={ (card.blank) ? this.state.blanks[order] : card.content }
                onChange={ (card.blank) ? (e) =>
                {
                  const blanks = this.state.blanks;

                  const trimmed = e.target.value.replace(locale.blank, '').replace(/\s+/g, ' ');

                  blanks[order] = trimmed;

                  this.setState({
                    blanks: blanks
                  });
                } : undefined }
              />;
            })
          }
        </div>

        <div className={ styles.buttons }>
          <div
            className={ styles.button }
            allowed={ this.checkValidity().toString() }
            onClick={ this.confirmPick }
          >
            { i18n('confirm') }
          </div>

          <div
            className={ styles.button }
            onClick={ this.clearPick }
          >
            { i18n('clear') }
          </div>
        </div>

        <div className={ styles.separator }/>

      </div>
    );
  }
}

PicksDialogue.propTypes = {
  gridRef: PropTypes.object.isRequired,
  sendMessage: PropTypes.func.isRequired,
  forceGridAnimations: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    userSelect: 'none',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontWeight: 700
  },

  buttons: {
    display: 'flex',
    direction: locale.direction
  },

  button: {
    flexGrow: 1,
    cursor: 'pointer',

    color: colors.whiteCardForeground,
    backgroundColor: colors.whiteCardBackground,

    textAlign: 'center',

    padding: '10px',
    margin: '10px 30px',

    borderRadius: '5px',

    '[allowed="false"]': {
      pointerEvents: 'none',
      color: colors.whiteText,
      backgroundColor: colors.red
    },

    ':hover': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    }
  },

  container: {
    display: 'grid',

    direction: locale.direction,

    gridTemplateColumns: 'repeat(auto-fill, calc(115px + 40px + 2vw + 2vh))',
    justifyContent: 'space-around',

    padding: '0 10px',

    '> *': {
      margin: '10px 20px 20px 20px'
    },

    '> * > * > [type]': {
      width: 'calc(115px + 2vw + 2vh)',

      minHeight: 'calc((115px + 2vw + 2vh) * 1.35)',
      height: 'auto'
    }
  },

  separator: {
    height: '5px',

    backgroundColor: colors.handScrollbar,

    margin: '10px 30px',

    borderRadius: '5px'
  }
});

export default PicksDialogue;
