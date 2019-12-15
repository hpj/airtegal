
import React from 'react';
import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

class Card extends React.Component
{
  render()
  {
    const { content, type, allowed, highlighted, hidden, onClick } = this.props;

    return (
      <div className={ styles.wrapper }>
        {
          (hidden) ?
            <div className={ styles.hidden } type={ type }>
              <div>{ i18n('kuruit-bedan-fash5') }</div>
            </div>
            :
            <div onClick={ onClick } className={ styles.container } type={ type } allowed={ allowed } highlighted={ highlighted }>
      
              <div className={ styles.content }>{content}</div>
              <p className={ styles.bottom }>{ i18n('kuruit-bedan-fash5') }</p>
              
            </div>
        }
      </div>
    );
  }
}

const hoverAnimation = createAnimation({
  options: {
    returnNameOnly: true
  },
  keyframes: `0% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(-10px);
  }`
});

const floatAnimation = createAnimation({
  options: {
    returnNameOnly: true
  },
  keyframes: `100% {
    transform: translateY(-10px);
  }`
});

Card.propTypes = {
  content: PropTypes.string,
  allowed: PropTypes.string,
  highlighted: PropTypes.string,
  hidden: PropTypes.bool,
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

  hidden: {
    position: 'absolute',

    display: 'flex',

    direction: locale.direction,
    justifyContent: 'center',
    alignItems: 'center',
    
    top: 0,
    width: '100%',
    height: '100%',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',
    borderRadius: '10px',

    '> div': {
      width: 'min-content',
      lineHeight: '135%'
    },

    '[type="white"]': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground
    },

    '[type="black"]': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    }
  },

  container: {
    position: 'absolute',

    display: 'grid',
    gridTemplateRows: '1fr auto',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"content" "bottom"',

    direction: locale.direction,
  
    top: 0,
    width: '100%',
    height: '100%',
  
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',
    borderRadius: '10px',

    '[highlighted="true"]': {
      boxShadow: `5px 5px 0px 0px ${colors.whiteCardHighlight}`,

      animationName: `${floatAnimation}, ${hoverAnimation}`,

      animationDuration: '.3s, 1.5s',
      animationDelay: '0s, .3s',
      animationTimingFunction: 'ease-out, ease-in-out',
      animationIterationCount: '1, infinite',
      animationFillMode: 'forwards',
      animationDirection: 'normal, alternate'
    },

    '[allowed="true"]:hover': {
      animationName: `${floatAnimation}, ${hoverAnimation}`,

      animationDuration: '.3s, 1.5s',
      animationDelay: '0s, .3s',
      animationTimingFunction: 'ease-out, ease-in-out',
      animationIterationCount: '1, infinite',
      animationFillMode: 'forwards',
      animationDirection: 'normal, alternate'
    },

    '[type="black"]': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    },

    '[type="white"]': {
      color: colors.whiteCardForeground,
      backgroundColor: colors.whiteCardBackground
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