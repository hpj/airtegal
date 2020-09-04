import React, { createRef } from 'react';

import axios from 'axios';

import { createStyle } from 'flcss';

import Card from './card.js';

import { locale } from '../i18n.js';

import getTheme from '../colors.js';

const colors = getTheme();

const cardsContainer = createRef();

class CardShowcase extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      /**
      * @type { { card: { content: string, type: 'black' }, combos: { content: string, type: 'white' }[] }[] }
      */
      data: [],

      hide: true,
      shownIndex: -1
    };

    // bind functions that are use as callbacks

    this.startShowcase = this.startShowcase.bind(this);
  }

  componentDidMount()
  {
    // TODO test showcase
    if (process.env.NODE_ENV === 'test')
      return;

    // request the data from server
    axios.get(`${process.env.API_ENDPOINT}/combos?region=${locale.value}`, {
      timeout: 20000
    }).then((response) =>
    {
      if (response && response.data)
      {
        this.setState({
          data: response.data
        }, () => setTimeout(this.startShowcase, 1000));
      }
    }).catch(console.error);
  }

  componentWillUnmount()
  {
    if (this.interval)
      clearInterval(this.interval);
  }

  startShowcase()
  {
    const { data } = this.state;

    let lastSetIndex = -1;

    if (data.length <= 0)
      return;
     
    function nextSet()
    {
      lastSetIndex = lastSetIndex + 1;

      if (lastSetIndex >= data.length)
        lastSetIndex = 0;

      this.setState({
        shownIndex: lastSetIndex
      }, () =>
      {
        setTimeout(() =>
        {
          this.setState({
            hide: false
          });
        }, 250);
      });
    }

    // animation trigger: moves title rom center to the right
    cardsContainer.current.style.width = '100%';

    setTimeout(nextSet.bind(this), 1000);

    // cycle between different sets of cards every 5 seconds
    
    if (this.interval)
      clearInterval(this.interval);

    this.interval = setInterval(() =>
    {
      this.setState({
        hide: true
      }, () => setTimeout(nextSet.bind(this), 1000));
    }, 5000);
  }

  render()
  {
    const set = this.state.data[this.state.shownIndex];

    return <div ref={ cardsContainer } className={ styles.cards }>
      {
        (set) ? <div className={ styles.container }>
          <div className={ styles.black } hide={ this.state.hide.toString() }>
            <Card type={ set.card.type } content={ set.card.content }/>
          </div>

          <div className={ styles.whites } hide={ this.state.hide.toString() }>
            {
              set.combos.map((c, i) => (<Card key={ i } type={ c.type } content={ c.content }/>))
            }
          </div>
          
        </div> : <div/>
      }

    </div>;
  }
}

const styles = createStyle({
  cards: {
    overflow: 'hidden',

    maxWidth: '850px',
    width: '0',

    transition: 'width 1s',
    transitionTimingFunction: 'cubic-bezier(0.55, 0.09, 0.68, 0.53)',
    
    '@media screen and (max-width: 830px)': {
      display: 'none'
    }
  },

  black: {
    '> div': {
      width: 0,
      minWidth: 'calc(162px + 2vw + 1vh)',
      
      margin: '0 20px'
    },

    '> * > * > [type]': {
      height: 'calc((162px + 2vw + 1vh) * 1.15)'
    },

    '> * > * > *': {
      fontSize: 'calc(10px + 0.4vw + 0.4vh)'
    },

    '> * > * > * > *': {
      fontSize: 'calc(10px + 0.4vw + 0.4vh)'
    },

    '> * > [type="black"]': {
      transform: `translate(0, 0) rotateZ(${(locale.direction === 'rtl') ? '5deg' : '-10deg'})`,

      transition: 'transform 0.65s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '[hide="true"]':
    {
      '> * > [type="black"]':
      {
        transform: (locale.direction === 'rtl') ? 'translate(-10%, 150%) rotateZ(60deg)' : 'translate(15%, 150%) rotateZ(-60deg)'
      },

      '> * > [type="white"]':
      {
        transform: (locale.direction === 'rtl') ? 'translate(15%, 150%) rotateZ(-60deg)' : 'translate(-10%, 150%) rotateZ(60deg)'
      }
    }
  },

  whites: {
    extend: 'black',
    display: 'flex',

    '> * > [type="white"]': {
      transform: `translate(0, 0) rotateZ(${(locale.direction === 'rtl') ? '-10deg' : '5deg'})`,

      boxShadow: `0px 0px 6px 0px ${colors.greyText}`,

      transition: 'transform 0.65s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '> :not(:first-child)':
    {
      margin: (locale.direction === 'rtl') ? '0 -25px 0 20px' : '0 20px 0 -25px'
    }
  },

  container: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: (locale.direction === 'rtl') ? 'flex-end' : 'flex-start',
    direction: locale.direction,

    width: '100%',
    height: '100%',

    margin: '0 35px'
  }
});

export default CardShowcase;