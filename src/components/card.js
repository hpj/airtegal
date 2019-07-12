
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

    // TODO fix card sizes
    minWidth: '215px',
    maxWidth: '215px',

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
    fontSize: 'calc(12px + 25%)',
    fontWeight: 700,
    
    padding: '7.5%'
  },

  bottom: {
    gridArea: 'bottom',
    padding: '3% 5%',

    '> svg': { width: '15%' }
  }
});

export default Card;