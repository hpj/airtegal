
import React, { createRef } from 'react';
import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

class Card extends React.Component
{
  componentDidMount()
  {
    this.sized = false;

    this.textareaRef = createRef();

    // bind functions that are use as callbacks

    this.resize = this.resize.bind(this);

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
  }

  resize()
  {
    if (!this.textareaRef || !this.textareaRef.current)
      return;
    
    const el = this.textareaRef.current;
                  
    el.style.height = '0';
    el.style.overflowY = 'hidden';

    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = 'auto';

    this.sized = true;
  }

  render()
  {
    const {
      owner, content, style, blank, type,
      elementId, disabled, allowed,
      picked, winner, hidden,
      onClick, onChange
    } = this.props;

    if (!this.sized && this.textareaRef && this.textareaRef.current)
      requestAnimationFrame(this.resize);
    
    return (
      <div
        owner={ (owner !== undefined).toString() }
        className={ styles.wrapper }
        style={ { ...style, display: (disabled) ? 'none' : '' } }
      >
        {
          (hidden)
            ?
            <div className={ styles.hidden } type={ type }>
              <div>{ i18n('kuruit-bedan-fash5') }</div>
            </div>
            :
            <div
              className={ styles.container }
              onClick={ onClick }
              id={ elementId }
              type={ type }
              allowed={ allowed }
              winner={ winner }
            >
              <div className={ styles.owner }>{owner}</div>
    
              <textarea
                ref={ this.textareaRef }
                disabled={ (!blank || !picked) }
                className={ (blank && picked) ? styles.input : styles.content }

                maxLength={ 80 }

                value={ content }
                placeholder={ (blank) ? i18n('blank') : undefined }
                onChange={ (e) =>
                {
                  this.resize();

                  if (onChange)
                    onChange(e);
                } }
              />
    
              {
                (blank) ?
                  <p className={ styles.bottom }>{ i18n('kuruit-blank-blank') }</p> :
                  <p className={ styles.bottom }>{ i18n('kuruit-bedan-fash5') }</p>
              }
    
            </div>
        }
      </div>
    );
  }
}

Card.propTypes = {
  owner: PropTypes.string,
  content: PropTypes.string,
  elementId: PropTypes.string,
  disabled: PropTypes.bool,
  allowed: PropTypes.string,
  picked: PropTypes.bool,
  winner: PropTypes.string,
  hidden: PropTypes.bool,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  style: PropTypes.object,
  blank: PropTypes.bool,
  onClick: PropTypes.func,
  onChange: PropTypes.func
};

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

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    position: 'relative',

    height: 'fit-content'
  },

  hidden: {
    display: 'flex',

    direction: locale.direction,
    justifyContent: 'center',
    alignItems: 'center',
    
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

    '[type="black"]': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    },

    '[type="white"]': {
      color: colors.whiteCardForeground,
      backgroundColor: colors.whiteCardBackground
    }
  },

  container: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"owner" "content" "bottom"',

    direction: locale.direction,
  
    width: '100%',
    height: '100%',
  
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',
    borderRadius: '10px',

    paddingTop: 0,
    paddingBottom: 0,

    transition: 'padding-top 0.35s, padding-bottom 0.35s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    '[allowed="true"]': {
      cursor: 'pointer'
    },

    '[allowed="true"]:hover': {
      boxShadow: `5px 5px 0px 0px ${colors.whiteCardPicked}`,

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
    },

    '[type="black"]> textarea': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    },

    '[type="white"]> textarea': {
      color: colors.whiteCardForeground,
      backgroundColor: colors.whiteCardBackground
    }
  },

  input: {
    gridArea: 'content',
    textAlign: 'center',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    resize: 'none',

    overflowX: 'hidden',
    overflowY: 'auto',

    margin: '10px',
    padding: 0,
    border: 0,

    ':focus': {
      'outline': 'none'
    }
  },

  content: {
    extend: 'input',
    pointerEvents: 'none'
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