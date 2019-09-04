import React, { useState, useEffect, createRef } from 'react';

import { API_ENDPOINT } from '../index.js';

import { createStyle } from '../flcss.js';

import Card from './card.js';

const cardsContainer = createRef();

const CardShowcase = () =>
{
  const [ cards, setCards ] = useState([]);

  // on url change
  useEffect(() =>
  {
    // Debug Code Starts

    setTimeout(() =>
    {
      // animation trigger: moves title rom center to the right
      cardsContainer.current.style.width = '100%';

      // waiting the animation duration
      setTimeout(() =>
      {
        setCards([
          {
            id: '1',
            type: 'black',
            content: '______.'
          },
          {
            id: '2',
            type: 'white',
            content: 'بطاطس.'
          }
        ]);
        
        // wait until render is done
        requestAnimationFrame(() =>
        {
          cardsContainer.current.childNodes.forEach((v) =>
          {
            // hide cards so they won't appear on screen just yet
            v.classList.add('hide');

            // animation trigger: plays an animation of the cards enter the screen
            requestAnimationFrame(() =>  v.classList.remove('hide'));
          });
        });
      }, 1000);
    }, 1500);

    setTimeout(() =>
    {
      // cardsContainer.current.childNodes.forEach((v) =>
      // {
      //   v.classList.remove('hide');
      // });
    }, 3000);

    // Debug Code Ends

    // fetch(API_URI + '/cards').then((response) =>
    // {
    //   response.json().then((data) =>
    //   {
    //     setCards(data);
    //   });

    // }).catch(console.error);
  }, [ window.location ]);

  return (
    <div ref={cardsContainer} className={styles.cards}>

      {
        cards.splice(0, 2).reverse().map((card) => <Card key={card.id.toString()} type={card.type} content={card.content}/>)
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
    width: '0px',
    // width: '100%',

    transition: 'width 1s',
    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
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

    '> .hide:nth-child(2) > div': {
      transform: 'translate(15%, 100%) rotateZ(60deg)'
    },

    '> .hide:nth-child(1) > div': {
      transform: 'translate(-10%, 100%) rotateZ(-60deg)'
    }
  }
});

export default CardShowcase;