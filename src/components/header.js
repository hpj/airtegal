import React from 'react';

// import { Query } from 'react-apollo';
// import gql from 'graphql-tag';

import InlineSVG from 'svg-inline-react';

import Card from './card.js';

import gameLogo from '../../build/kbf.svg';
import hpjLogo from '../../build/hpj-logo-ar.svg';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

// const GET_CARDS = gql`
// {
//   card {
//     content
//     type
//   }
// }
// `;

const Header = () =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <a className={styles.hpj} href='https://herpproject.com'>
          <InlineSVG src={hpjLogo}></InlineSVG>
        </a>
        <InlineSVG className={styles.kbf} src={gameLogo}></InlineSVG>

        {/* <Query query={GET_CARDS}>
          {({ loading, error, data }) =>
          {
            if (!loading && !error)
            {
              return (
                <div className={styles.cards}>
                  <Card type={data.card[1].type} content={data.card[1].content}></Card>
                  <Card type={data.card[0].type} content={data.card[0].content}></Card>
                </div>
              );
            }
            
            return '';
          }}
        </Query> */}
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
    justifySelf: 'end',

    minWidth: '100px',
    maxWidth: '150px',
    width: '80%',
    height: '100%',

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