
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

  for(number)
  {
    if (number)
      return Array(number).fill();
    else
      return [];
  }

  render()
  {
    const {
      self, votes,
      owner, content, style, blank, type,
      elementId, disabled, allowed,
      picked, winner, hidden,
      onClick, onChange
    } = this.props;

    if (!this.sized && this.textareaRef && this.textareaRef.current)
      requestAnimationFrame(this.resize);

    return (
      <div
        className={ styles.wrapper }
        style={ { ...style, display: (disabled) ? 'none' : '' } }
      >
        <div
          className={ styles.container }
          type={ type }
          onClick={ onClick }
          id={ elementId }
          allowed={ allowed }
          winner={ winner }
        >

          <div className={ styles.votes }>
            {
              this.for(votes).map((v, i) => <div key={ i } className={ styles.vote }/>)
            }
          </div>

          {
            (hidden)
              ?
              <div className={ styles.hidden } type={ type }>
                <div>{ i18n('kuruit-bedan-fash5') }</div>
              </div>
              :
              <div
                className={ styles.card }
                type={ type }
              >
                <textarea
                  ref={ this.textareaRef }
                  disabled={ (!blank || !picked) }
                  className={ (blank && picked) ? styles.input : styles.content }

                  maxLength={ 105 }

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

          <div className={ styles.owner }>
            {
              (self) ? i18n('this-card-is-yours') : owner
            }
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  indexInEntry: PropTypes.number,
  elementId: PropTypes.string,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  allowed: PropTypes.string,
  self: PropTypes.bool,
  owner: PropTypes.string,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  votes: PropTypes.number,
  content: PropTypes.string,
  winner: PropTypes.string,
  hidden: PropTypes.bool,
  picked: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  blank: PropTypes.bool
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

const voteAnimation = createAnimation({
  duration: '0.5s',
  timingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  fillMode: 'forwards',
  iterationCount: '1',
  keyframes: `100% {
    margin: 10px 10px 5px 10px
  }`
});

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    position: 'relative',

    height: 'fit-content'
  },

  container: {
    overflow: 'hidden',
    borderRadius: '10px',

    '[allowed="true"]': {
      cursor: 'pointer'
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

    '[winner="true"]': {
      boxShadow: `5px 5px 0 0 ${colors.winner}, 5px 5px 10px 0 ${colors.winner}`
    },

    '[type="black"][allowed="true"]:hover': {
      boxShadow: `5px 5px 0px 0px ${colors.blackCardHover}`
    },

    '[type="white"][allowed="true"]:hover': {
      boxShadow: `5px 5px 0px 0px ${colors.whiteCardHover}`
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
    }
  },

  card: {
    display: 'grid',
    gridTemplateRows: ' 1fr auto',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"content" "bottom"',

    direction: locale.direction,
  
    width: '100%',
    height: '100%',
  
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    userSelect: 'none',

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
    minHeight: 'calc(100% - 20px)',

    padding: 0,
    border: 0,

    ':focus': {
      'outline': 'none'
    },

    ':not(:focus)::selection': {
      backgroundColor: colors.transparent
    }
  },

  content: {
    extend: 'input',
    pointerEvents: 'none'
  },

  votes: {
    userSelect: 'none',

    display: 'flex',
    flexWrap: 'wrap'
  },

  vote: {
    width: '10px',
    height: '10px',

    margin: '0',

    animation: voteAnimation,

    borderRadius: '5px',
    backgroundColor: colors.vote
  },

  bottom: {
    gridArea: 'bottom',

    fontSize: 'calc(5px + 0.4vw + 0.4vh)',
    fontWeight: 700,

    margin: '0 10px 10px 10px'
  },

  owner: {
    userSelect: 'none',

    fontSize: 'calc(4px + 0.35vw + 0.35vh)',
    fontWeight: 700,

    padding: '0 10px 10px 10px',

    transition: 'padding 0.5s',
    transitionTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',

    ':empty': {
      padding: 0
    }
  }
});

export default Card;