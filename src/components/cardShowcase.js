import React, { createRef } from 'react';

import axios from 'axios';

import { createStyle } from '../flcss.js';

import Card from './card.js';

import { locale } from '../i18n.js';

const cardsContainer = createRef();

class CardShowcase extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      /**
      * @type { { card: { content: string, type: 'black' }, combos: { content: string, type: 'white' } }[] }
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
    // request the data from server
    axios({
      url: `${process.env.API_ENDPOINT}/combos?region=${locale.value}`,
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

    return <div ref={ cardsContainer } hide={ this.state.hide.toString() } className={ styles.cards }>
      {
        (set) ?
          (locale.direction === 'ltr') ?
            <Card type={ set.card.type } content={ set.card.content }/>
            : <Card type={ set.combos.type } content={ set.combos.content }/>
          : <div/>
      }

      {
        (set) ?
          (locale.direction === 'ltr') ?
            <Card type={ set.combos.type } content={ set.combos.content }/>
            : <Card type={ set.card.type } content={ set.card.content }/>
          : <div/>
      }
    </div>;
  }
}

const styles = createStyle({
  cards: {
    display: 'flex',

    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'flex-start',

    maxWidth: '850px',
    width: 0,

    transition: 'width 1s',
    transitionTimingFunction: 'cubic-bezier(0.55, 0.09, 0.68, 0.53)',
    
    '@media screen and (max-width: 830px)': {
      display: 'none'
    },

    '> div': {
      width: 'calc(120px + 2vw + 1vh)',
      transform: 'scale(1.35) translate(35%, 10%)',
      margin: '0 4.5%'
    },

    '> * > * > [type]': {
      height: 'calc((120px + 2vw + 1vh) * 1.15)'
    },

    '> div:nth-child(2) > div': {
      transform: 'translate(0, 0) rotateZ(5deg)',

      transition: 'transform 0.65s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '> div:nth-child(1) > div': {
      transform: 'translate(0, 0) rotateZ(-10deg)',

      transition: 'transform 0.65s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '[hide="true"]':
    {
      '> :nth-child(2) > div':
      {
        transform: 'translate(15%, 150%) rotateZ(60deg)'
      },

      '> :nth-child(1) > div':
      {
        transform: 'translate(-10%, 150%) rotateZ(-60deg)'
      }
    }
  }
});

export default CardShowcase;