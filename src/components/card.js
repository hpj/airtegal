
import React from 'react';
import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

/** @param { { content: string, type: 'black' | 'white' } } param0
*/
const Card = ({ content, type }) =>
{
  return (
    <div className={styles.wrapper}>
      <div className={styles.container} type={type}>

        <div className={styles.content}>{content}</div>
        <p className={styles.bottom}>كروت بضان فشخ</p>
        
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
  
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',
    borderRadius: '10px',

    '[type="white"]': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground
    },

    '[type="black"]': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    }
  },

  content: {
    gridArea: 'content',
    display: 'flex',
  
    justifyContent: 'center',
    
    padding: '7.5%'
  },

  bottom: {
    gridArea: 'bottom',
    direction: 'rtl',

    padding: '6% 8%',
    fontSize: 'calc(3px + 0.4vw + 0.4vh)',
    margin: 0
  }
});

export default Card;