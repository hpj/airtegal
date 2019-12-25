import React, { useState, useEffect, createRef } from 'react';

import { API_ENDPOINT } from '../index.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

let lastSetIndex;

const cardsContainer = createRef();

const CardShowcase = () =>
{
  const [ cards, setCards ] = useState([]);
  const [ cardsOnShow, setCardsOnShow ] = useState([]);

  function randomSet()
  {
    if (cards.length <= 0)
      return;

    setCardsOnShow(cards[randomIndex()]);
  }

  function randomIndex()
  {
    let i = lastSetIndex;

    while (i === lastSetIndex)
    {
      i = Math.round(Math.random() * (cards.length - 1));
    }

    lastSetIndex = i;
    
    return i;
  }

  // on url change
  useEffect(() =>
  {
    // TODO card showcase
    
    // the graphql query should be something like this
    // setCards([
    //   [
    //     {
    //       id: '1',
    //       type: 'black',
    //       content: 'كرت 1'
    //     },
    //     {
    //       id: '2',
    //       type: 'white',
    //       content: 'كرت 2'
    //     }
    //   ],
    //   [
    //     {
    //       id: '1',
    //       type: 'black',
    //       content: 'كرت 3'
    //     },
    //     {
    //       id: '2',
    //       type: 'white',
    //       content: 'كرت 4'
    //     }
    //   ]
    // ]);

    // axios(API_ENDPOINT + '/v1/cards').then((response) =>
    // {
    //   response.json().then((data) =>
    //   {
    //     setCards(data);
    //   });

    // }).catch(console.error);
  }, [ window.location ]);

  // happens once after cards are fetched from server
  useEffect(() =>
  {
    if (cards.length <= 0)
      return;
    
    // animation trigger: moves title rom center to the right
    cardsContainer.current.style.width = '100%';

    // cards start hidden to wait for the title movment
    cardsContainer.current.classList.add('hide');

    // waiting the animation duration (title clearing space for the showcase element)
    setTimeout(() =>
    {
      // then show the cards
      randomSet();
    }, 1000);
    
    // cycle between different sets of cards every 5 seconds
    const interval = setInterval(() =>
    {
      cardsContainer.current.classList.add('hide');
      
      setTimeout(() => randomSet(), 1000);
    }, 5000);

    // clear the interval on unmount
    return () => clearInterval(interval);
  }, [ cards ]);

  // happens every 5 seconds, cards on display changes
  useEffect(() =>
  {
    if (cardsOnShow.length <= 0)
      return;

    cardsContainer.current.classList.remove('hide');
  }, [ cardsOnShow ]);

  return (
    <div ref={cardsContainer} className={styles.cards}>

      {
        cardsOnShow.map((card) =>
        {
          if (card.type === 'white')
            return <Card key={card.id.toString()} type='white' content={card.content}/>;
        })
      }

      {
        cardsOnShow.map((card) =>
        {
          if (card.type === 'black')
            return <Card key={card.id.toString()} type='black' content={card.content}/>;
        })
      }

    </div>
  );
};

const styles = createStyle({
  cards: {
    display: 'flex',

    overflow: 'hidden',
  
    alignItems: 'center',
    justifyContent: 'flex-start',

    maxWidth: '850px',
    width: '0',

    transition: 'width 1s',
    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    '@media screen and (max-width: 830px)': {
      display: 'none'
    },

    '> div': {
      transform: 'scale(1.35) translate(35%, 15%)',
      margin: '0 4.5%'
    },

    '> div:nth-child(2) > div': {
      transform: 'translate(0, 0) rotateZ(5deg)',
      transition: 'transform 0.85s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '> div:nth-child(1) > div': {
      transform: 'translate(0, 0) rotateZ(-10deg)',
      transition: 'transform 0.85s',
      transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    },

    '.hide':
    {
      '> :nth-child(2) > div':
      {
        transform: 'translate(15%, 100%) rotateZ(60deg)'
      },

      '> :nth-child(1) > div':
      {
        transform: 'translate(-10%, 100%) rotateZ(-60deg)'
      }
    }
  }
});

export default CardShowcase;