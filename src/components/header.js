import React, { useState, useEffect } from 'react';

import InlineSVG from 'svg-inline-react';

import { API_URI } from '../index.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import gameLogo from '../../build/kbf.svg';
import hpjLogo from '../../build/hpj-logo-ar.svg';

import Card from './card.js';

const Header = () =>
{
  const [ cards, setCards ] = useState([]);

  // on url change
  useEffect(() =>
  {
    fetch(API_URI + '/cards').then((response) =>
    {
      response.json().then((data) => setCards(data));

    }).catch(console.error);

  }, [ window.location ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <a className={styles.hpj} href='https://herpproject.com'>
          <InlineSVG src={hpjLogo}></InlineSVG>
        </a>
        <InlineSVG className={styles.kbf} src={gameLogo}></InlineSVG>

        <div className={styles.cards}>

          {
            cards.splice(0, 2).reverse().map((card) => <Card key={card.id.toString()} type={card.type} content={card.content}/>)
          }
        
        </div>

      </div>
    </div>
  );
};

const styles = createStyle({
  wrapper: { background: 'radial-gradient(circle, rgba(32,25,25,1) 0%, rgba(31,28,28,1) 16%, rgba(0,0,0,1) 100%)' },

  container: {
    display: 'grid',

    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"cards hpj" "cards kbf"',
  
    gridColumnGap: '15px',
    
    maxWidth: '850px',
    overflow: 'hidden',
    
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',

    flexGrow: 1,

    minWidth: '100px',
    maxWidth: '150px',
    width: '80%',
    height: '100%',

    margin: '0 0 0 auto',

    '> i > svg': {
      width: '100%',
      height: '100%',
      
      fill: colors.whiteText,

      cursor: 'pointer'
    },

    ':hover > i > svg': { fill: colors.accentColor }
  },

  kbf: {
    display: 'flex',
    gridArea: 'kbf',

    minWidth: '95px',
    maxWidth: '152px',
    width: '80%',
    height: '100%',

    margin: '0 0 0 auto',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    }
  },

  cards: {
    gridArea: 'cards',
    display: 'flex',
  
    alignItems: 'center',
    justifyContent: 'flex-end',
    
    '> *': {
      margin: '0 10px'
    },

    '> * > *[type="black"]': {
      transform: 'rotateZ(5deg)'
    },

    '> * > *[type="white"]': { transform: 'rotateZ(-10deg)' }
  }
});

export default Header;