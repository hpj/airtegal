
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
    const { owner, content, type, elementId,
      allowed, picked, highlighted, winner, hidden,
      onClick, onMouseEnter, onMouseLeave } = this.props;

    return (
      <div owner={ (owner !== undefined).toString() } className={ styles.wrapper }>
        {
          (hidden) ?
            <div className={ styles.hidden } type={ type }>
              <div>{ i18n('kuruit-bedan-fash5') }</div>
            </div>
            :
            <div
              className={ styles.container }

              onMouseEnter={ onMouseEnter }
              onMouseLeave={ onMouseLeave }
              onClick={ onClick }
              id={ elementId }
              type={ type }
              allowed={ allowed }
              picked={ picked }
              highlighted={ highlighted }
              winner={ winner }
            >
              <div className={ styles.owner }>{owner}</div>
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
  owner: PropTypes.string,
  content: PropTypes.string,
  elementId: PropTypes.string,
  allowed: PropTypes.string,
  picked: PropTypes.string,
  highlighted: PropTypes.string,
  winner: PropTypes.string,
  hidden: PropTypes.bool,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    position: 'relative',

    height: 'fit-content',

    ':before': {
      content: '""',
      display: 'block',
    
      paddingBottom: '135%',

      transition: 'padding-bottom 0.25s',
      transitionTimingFunction: 'ease-out'
    },

    '[owner="true"]:before': {
      paddingBottom: '155%'
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
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"owner" "content" "bottom"',

    direction: locale.direction,
  
    top: 0,
    width: '100%',
    height: '100%',
  
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',
    borderRadius: '10px',

    '[allowed="true"]': {
      cursor: 'pointer'
    },

    '[picked="true"]': {
      boxShadow: `5px 5px 0px 0px ${colors.whiteCardPicked}`,

      animationName: `${floatAnimation}, ${hoverAnimation}`,

      animationDuration: '.3s, 1.5s',
      animationDelay: '0s, .3s',
      animationTimingFunction: 'ease-out, ease-in-out',
      animationIterationCount: '1, infinite',
      animationFillMode: 'forwards',
      animationDirection: 'normal, alternate'
    },

    '[allowed="true"][highlighted="true"]': {
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
    },

    '[winner="true"]': {
      boxShadow: `5px 5px 0 0 ${colors.winner}, 5px 5px 10px 0 ${colors.winner}`
    }
  },

  content: {
    gridArea: 'content',

    display: 'flex',
    justifyContent: 'center',

    overflow: 'hidden',
    margin: '10px'
  },

  owner: {
    gridArea: 'owner',

    fontSize: 'calc(3px + 0.4vw + 0.4vh)',
    margin: '5px 10px',

    ':empty': {
      margin: 0
    }
  },

  bottom: {
    gridArea: 'bottom',

    fontSize: 'calc(3px + 0.4vw + 0.4vh)',
    margin: '10px'
  }
});

export default Card;