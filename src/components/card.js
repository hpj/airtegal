
import React from 'react';
import PropTypes from 'prop-types';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n from '../i18n/eg-AR.json';

class Card extends React.Component
{
  render()
  {
    const { content, type, onClick } = this.props;

    return (
      <div className={ styles.wrapper }>
        <div onClick={ onClick } className={ styles.container } type={ type }>
  
          <div className={ styles.content }>{content}</div>
          <p className={ styles.bottom }>{ i18n['kuruit-bedan-fash5'] }</p>
          
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  content: PropTypes.string,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  onClick: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    position: 'relative',

    height: 'fit-content',

    ':before': {
      content: '""',
      display: 'block',
    
      paddingBottom: '135%'
    }
  },

  container: {
    position: 'absolute',

    display: 'grid',
    gridTemplateRows: '1fr auto',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"content" "bottom"',

    direction: 'rtl',
  
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

    overflow: 'hidden',
    margin: '10px'
  },

  bottom: {
    gridArea: 'bottom',

    padding: '10px',
    fontSize: 'calc(3px + 0.4vw + 0.4vh)',
    margin: 0
  }
});

export default Card;