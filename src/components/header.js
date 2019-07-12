import React from 'react';

import InlineSVG from 'svg-inline-react';
import Card from './card.js';

import gameLogo from '../../build/kbf.svg';
import hpjLogoHorizontal from '../../build/hpj-logo-ar-horizontal.svg';

import cards from '../../cards.json';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const Header = () =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <InlineSVG className={styles.hpj} src={hpjLogoHorizontal}></InlineSVG>
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

  hpj: {
    gridArea: 'hpj',
    flexGrow: 1,

    minWidth: '100px',
    maxWidth: '150px',
    width: '80%',
    height: '100%',

    '> svg': {
      width: '100%',
      height: '100%',
      
      fill: colors.whiteText,

      cursor: 'pointer'
    },

    ':hover > svg': { fill: colors.accentColor }
  },

  kbf: {
    display: 'flex',
    gridArea: 'kbf',

    minWidth: '95px',
    maxWidth: '185px',
    width: '80%',
    height: '100%',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    }
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