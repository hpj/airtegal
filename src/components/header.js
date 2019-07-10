import React from 'react';

import InlineSVG from 'svg-inline-react';
import Card from './card.js';

import gameLogo from '../../build/kbf-logo-ar.svg';
import hpjLogo from '../../build/hpj-logo-ar-horizontal.svg';

import cards from '../../cards.json';

import { whiteText } from '../theme.js';

import { createStyle } from '../flcss.js';

const Header = () =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <InlineSVG className={styles.hpj} src={hpjLogo}></InlineSVG>
        <InlineSVG className={styles.kbf} src={gameLogo}></InlineSVG>

        <div className={styles.cards}>
          <Card type='black' content={cards.black[0]}></Card>
          <Card type='white' content={cards.white[0]}></Card>
        </div>
      </div>
    </div>
  );
};

const styles = createStyle({
  // wrapper: { background: 'linear-gradient(to right, #780206, #061161)' },
  wrapper: { background: 'radial-gradient(circle, rgba(32,25,25,1) 0%, rgba(31,28,28,1) 16%, rgba(0,0,0,1) 100%)' },

  container: {
    display: 'grid',

    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas: '"hpj cards" "kbf cards"',
  
    gridColumnGap: '15px',
  
    maxWidth: '850px',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  icon: {
    fill: whiteText,

    minWidth: '130px',
    maxWidth: '320px',
    width: '55%'
  },

  hpj: {
    gridArea: 'hpj',
    flexGrow: 1,
  
    width: 'min-content',

    '> svg': {
      extend: 'icon',
      cursor: 'pointer'
    },

    '> svg:hover': { fill: 'red' }
  },

  kbf: {
    display: 'flex',

    gridArea: 'kbf',

    '> svg': { extend: 'icon' }
  },

  cards: {
    gridArea: 'cards',
    display: 'flex',
  
    justifyContent: 'flex-end',
  
    margin: '5%',

    '> * > *[type="black"]': {
      left: 10,
      transform: 'rotateZ(5deg)'
    },

    '> * > *[type="white"]': { transform: 'rotateZ(-10deg)' }
  }
});

export default Header;