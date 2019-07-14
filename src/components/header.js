import React from 'react';

import InlineSVG from 'svg-inline-react';
import Card from './card.js';

import gameLogo from '../../build/kbf.svg';
import hpjLogo from '../../build/hpj-logo-ar.svg';

import cards from '../../cards.json';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

const Header = () =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <InlineSVG className={styles.hpj} src={hpjLogo}></InlineSVG>
        <InlineSVG className={styles.kbf} src={gameLogo}></InlineSVG>

        <div className={styles.cards}>
          <Card type='white' content={cards.white[0]}></Card>
          <Card type='black' content={cards.black[0]}></Card>
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
    justifySelf: 'end',

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

    justifySelf: 'end',

    minWidth: '95px',
    maxWidth: '152px',
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