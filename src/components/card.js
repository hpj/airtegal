
import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

class Card extends React.Component
{
  constructor()
  {
    super();

    this.textareaRef = createRef();
  }
  componentDidMount()
  {
    // workaround: text area not resizing when card first appears on field

    setTimeout(() => this.resize(), 10);
    setTimeout(() => this.resize(), 250);
    setTimeout(() => this.resize(), 500);

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
    const el = this.textareaRef.current;

    if (!el)
      return;
                  
    el.style.height = '0';
    el.style.overflowY = 'hidden';

    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = 'auto';
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
      self, votes, owner,
      content, style, blank,
      type, disabled, allowed, picked,
      onClick, onChange, shareEntry
    } = this.props;

    let {
      hidden, winner, line
    } = this.props;

    hidden = hidden || false;
    winner = winner || false;

    // reverse lines if direction is right-to-left
    if (locale.direction === 'rtl' && line === 'right')
      line = 'left';
    else if (locale.direction === 'rtl' && line === 'left')
      line = 'right';

    return (
      <div
        className={ styles.wrapper }
        style={ { ...style, display: (disabled) ? 'none' : '' } }
      >
        <div
          className={ styles.container }
          type={ type }
          onClick={ onClick }
          allowed={ allowed }
          winner={ winner.toString() }
        >

          <div visible={ 'true' } className={ styles.votes }>
            {
              this.for(votes).map((v, i) => <div key={ i } className={ styles.vote }/>)
            }
          </div>

          <div line={ (line === 'right' || line === 'both') ? 'right' : 'false' } className={ styles.line }><div/></div>
          <div line={ (line === 'left' || line === 'both') ? 'left' : 'false' } className={ styles.line }><div/></div>

          {
            (hidden)
              ?
              <div className={ styles.hidden } type={ type }>
                <div>{ i18n('airtegal') }</div>
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
    
              </div>
          }

          <div hide={ hidden.toString() } visible={ ((!self && !owner) || type === 'black').toString() } enabled={ ((self === undefined && owner === undefined) || type === 'black').toString() } className={ styles.bottom }>
            {
              (blank) ? i18n('airtegal-blank') : i18n('airtegal-cards')
            }
          </div>

          <div enabled={ ((self !== undefined || owner !== undefined) && type === 'white').toString() } className={ styles.bottom }>
            {
              (self) ? i18n('this-card-is-yours') : owner
            }

            {
              (shareEntry) ?
                <ShareIcon className={ styles.share } onClick={ shareEntry }/> :
                <div/>
            }
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  shareEntry: PropTypes.func,
  allowed: PropTypes.string,
  self: PropTypes.bool,
  owner: PropTypes.string,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  votes: PropTypes.number,
  content: PropTypes.string,
  line: PropTypes.string,
  hidden: PropTypes.bool,
  winner: PropTypes.bool,
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
    borderRadius: '10px',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

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

  line: {
    pointerEvents: 'none',

    display: 'flex',
    position: 'absolute',

    alignItems: 'center',

    width: '100%',
    height: '100%',

    '[line="false"]': {
      display: 'none'
    },

    '[line="left"]': {
      left: '-100%'
    },

    '[line="right"]': {
      left: '100%'
    },

    '> div': {
      backgroundColor: colors.entryLine,
        
      width: '100%',
      height: '12px'
    }
  },

  hidden: {
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    fontSize: 'calc(8px + 0.4vw + 0.4vh)',
    direction: locale.direction,
    
    width: '100%',
    height: '100%',

    userSelect: 'none',

    '> div': {
      position: 'relative',

      top: '15px',
      width: 'min-content',

      lineHeight: '135%'
    }
  },

  card: {
    display: 'grid',
    gridTemplateRows: ' 1fr',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"content"',

    direction: locale.direction,
  
    width: '100%',
    height: '100%',
  
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
    textAlign: (locale.direction === 'ltr') ? 'left' : 'right',

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: 700,

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
    flexWrap: 'wrap',

    '[visible="false"]': {
      display: 'none'
    }
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
    display: 'flex',
    alignItems: 'center',
    
    userSelect: 'none',
    direction: locale.direction,

    fontSize: 'calc(5px + 0.4vw + 0.4vh)',

    margin: 0,
    padding: '0 10px 10px 10px',

    transition: 'padding 0.5s',
    transitionTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',

    '[type="white"] > %this[hide="true"]': {
      color: colors.whiteCardBackground
    },

    '[enabled="false"]': {
      padding: 0
    },

    '[visible="false"]': {
      display: 'none'
    }
  },

  share: {
    cursor: 'pointer',
    fill: colors.whiteCardForeground,

    width: 'calc(14px + 0.3vw + 0.3vh)',
    height: 'calc(14px + 0.3vw + 0.3vh)',

    margin: '0 auto 0 0'
  }
});

export default Card;