/* eslint-disable security/detect-object-injection */

import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { wrapGrid } from 'animate-css-grid';

import { StoreComponent } from '../store.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import i18n, { locale } from '../i18n.js';

import Card from './card.js';

const colors = getTheme();

const picksGridRef = createRef();

class PicksDialogue extends StoreComponent
{
  constructor()
  {
    super({
      pick: undefined,

      picks: [],
      blanks: []
    });

    // bind functions that are use as callbacks

    this.isPicked = this.isPicked.bind(this);

    this.clearPick = this.clearPick.bind(this);
    this.confirmPick = this.confirmPick.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    this.animatedPicksGrid = wrapGrid(picksGridRef.current, { easing: 'backOut', stagger: 25, duration: 250 });
  }

  /**
  * @param { string[] } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.pick ||
      changes?.picks ||
      changes?.blanks ||
      changes?.hand)
      return true;
  }

  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;
    
    // client is in the lobby
    // or not picking
    if (
      (roomData.state !== 'match' && this.state.picks.length > 0) ||
      (roomData.playerProperties[socket.id].state !== 'picking')
    )
    {
      state.picks = [];
      state.blanks = [];
    }

    if (roomData.options.gameMode === 'king' &&
      roomData.reason.message === 'black-card')
    {
      // the black card picks max length
      state.pick = 1;
    }
    else if (
      roomData.field && roomData.field.length > 0 &&
      this.state.pick !== roomData.field[0].cards[0].pick)
    {
      // the white card picks max length
      state.pick = roomData.field[0].cards[0].pick;
    }

    return state;
  }

  stateDidChange(state, changes)
  {
    if (changes.picks)
      this.animatedPicksGrid.forceGridAnimation();
  }

  pickCard(cardIndex, isAllowed)
  {
    if (!isAllowed)
      return;
    
    const picks = [ ...this.state.picks ];
    const blanks = [ ...this.state.blanks ];

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
    this.store.set({
      picks,
      blanks
    });
  }

  clearPick()
  {
    this.store.set({
      picks: [],
      blanks: []
    });
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
    return (
      <div className={ styles.wrapper } style={ { display: (this.state.picks.length > 0) ? '' : 'none' } }>

        <div ref={ picksGridRef } className={ styles.container }>
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

                  this.store.set({  blanks });
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
  sendMessage: PropTypes.func.isRequired
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

      minHeight: 'calc((115px + 2vw + 2vh) * 1.15)',
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
