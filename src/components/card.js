
import React from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';

import { createStyle } from '../flcss.js';

import gameLogo from '../../build/kbf.svg';

import * as colors from '../colors.js';

/** @param { { content: string, type: 'black' | 'white' } } param0
*/
const Card = ({
  content,
  type
}) =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container} type={type}>
        <div className={styles.content}>{content}</div>
        <InlineSVG className={styles.bottom} src={gameLogo}></InlineSVG>
      </div>
    </div>
  );
};

Card.propTypes = {
  content: PropTypes.string.isRequired,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired
};

const styles = createStyle({
  wrapper: {
    position: 'relative',

    minWidth: '115px',
    maxWidth: '215px',
    width: 'calc(50px + 8vw + 8vh)',

    height: 'fit-content',

    ':before': {
      content: '""',
      display: 'block',
    
      paddingBottom: '130%'
    }
  },

  container: {
    position: 'absolute',

    display: 'grid',
    gridTemplateRows: '1fr auto',
    gridTemplateAreas: '"content" "bottom"',
  
    top: 0,
    width: '100%',
    height: '100%',
  
    borderRadius: '10px',

    '[type="white"]': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground,

      '> * > svg': { fill: colors.blackText }
    },

    '[type="black"]': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground,

      '> * > svg': { fill: colors.whiteText }
    }
  },

  content: {
    gridArea: 'content',
    display: 'flex',
  
    justifyContent: 'center',
    userSelect: 'none',

    fontFamily: 'sans-serif',
    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontWeight: 700,
    
    padding: '7.5%'
  },

  bottom: {
    gridArea: 'bottom',
    padding: '5% 8%',

    '> svg': { width: '18%' }
  }
});

export default Card;