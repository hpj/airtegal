
import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import Lottie from 'lottie-react';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

import { withTranslation } from '../i18n.js';

import confettiAnimation from '../animations/confetti.json';

const colors = getTheme();

class Card extends React.Component
{
  constructor()
  {
    super();

    this.focused = false;

    this.state = {
      content: undefined
    };

    /**
    * @type { React.RefObject<HTMLTextAreaElement>}
    */
    this.textareaRef = createRef();
  }

  componentDidMount()
  {
    this.resize = this.resize.bind(this);
        
    // workaround: text area not resizing when card first appears on field
    setTimeout(this.resize, 10);
    setTimeout(this.resize, 250);
    setTimeout(this.resize, 500);

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
  }

  resize()
  {
    const textarea = this.textareaRef.current;

    if (!textarea)
      return;

    textarea.style.height = '0';
    textarea.style.overflowY = 'hidden';

    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.overflowY = 'auto';
  }

  onChange(e)
  {
    const { locale } = this.props;

    this.setState({
      content: e.target.value.replace(locale.blank, '').replace(/\s+/g, ' ')
    }, () => this.resize());
  }

  render()
  {
    const {
      content,
      style, self,
      owner, blank,
      type, onClick,
      locale, translation
    } = this.props;

    const input = this.state.content;

    let { allowed, hidden, winner, share } = this.props;

    allowed = allowed ?? false;

    hidden = hidden ?? false;
    winner = winner ?? false;
    share = share ?? false;

    return <div className={ styles.wrapper } style={ style }>
      {
        winner && self ?
          <Lottie className={ styles.confetti } loop={ false } animationData={ confettiAnimation }/> : undefined
      }

      <div
        type={ type }
        allowed={ ((allowed || share) && !hidden).toString() }
        winner={ winner.toString() }
        className={ styles.container }
        onClick={ e =>
        {
          e.preventDefault();
          e.stopPropagation();

          onClick(this);
        } }
      >
        {
          hidden ? <div className={ styles.hidden } type={ type } style={ { direction: locale.direction } }>
            <div>{ translation('kuruit') }</div>
          </div> : undefined
        }

        {
          !hidden ? <div className={ styles.card } type={ type } style={ { direction: locale.direction } }>
            <textarea
              ref={ this.textareaRef }
              className={ blank ? styles.input : styles.content }
              style={ { textAlign: locale.direction === 'ltr' ? 'left' : 'right' } }

              value={ input ?? content }

              maxLength={ 105 }
              placeholder={ blank ? translation('blank') : undefined }

              onClick={ e =>
              {
                e.preventDefault();
                e.stopPropagation();

                onClick(this);
                
                this.focused = true;
              } }

              onBlur={ () => this.focused = false }

              onChange={ e =>
              {
                this.resize();
                this.onChange(e);
              } }
            />
          </div> : undefined
        }

        <div
          className={ styles.bottom }
          style={ { direction: locale.direction } }
        >
          {
            hidden ? '' :
              self && type === 'white' ? translation('this-card-is-yours') :
                owner && type === 'white' ? owner :
                  blank ? translation('blank') : translation('kuruit')
          }

          <ShareIcon className={ styles.share } style={ {
            width: share ? undefined : 0
          } } />
        </div>
      </div>
    </div>;
  }
}

Card.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
  style: PropTypes.object,
  onClick: PropTypes.func,
  self: PropTypes.bool,
  owner: PropTypes.string,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired,
  hidden: PropTypes.bool,
  allowed: PropTypes.bool,
  blank: PropTypes.bool,
  content: PropTypes.string,
  winner: PropTypes.bool,
  disabled: PropTypes.bool,
  share: PropTypes.bool
};

const hoverAnimation = createAnimation({
  keyframes: {
    '0%': {
      transform: 'translateY(-10px)'
    },
    '50%': {
      transform: 'translateY(-5px)'
    },
    '100%': {
      transform: 'translateY(-10px)'
    }
  }
});

const floatAnimation = createAnimation({
  keyframes: {
    to: {
      transform: 'translateY(-10px)'
    }
  }
});

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    position: 'relative',
    flex: '0 0 calc(115px + 2vw + 2vh)',
    width: 'calc(115px + 2vw + 2vh)'
  },

  container: {
    borderRadius: '10px',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '10px 10px 0',
    boxShadow: '0 0 0 0',

    transition: 'box-shadow 0.25s ease',

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

    '[type="white"][allowed="true"][winner="false"]:hover': {
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
    alignItems: 'center',
    justifyContent: 'center',

    userSelect: 'none',
    fontSize: 'calc(8px + 0.4vw + 0.4vh)',
    
    width: '100%',
    minHeight: 'calc((115px + 2vw + 2vh) * 0.985)',
    height: 'auto',

    '> div': {
      margin: '45px 0 0'
    }
  },

  card: {
    display: 'flex',

    userSelect: 'none',
  
    width: '100%',
    height: 'auto',

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
    cursor: 'pointer',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    resize: 'none',
    overflow: 'hidden auto',

    minHeight: 'calc((115px + 2vw + 2vh) * 0.985)',

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

  bottom: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    
    minHeight: '25px',
    padding: '10px 0',

    userSelect: 'none',
    overflow: 'hidden',

    fontSize: 'calc(5px + 0.4vw + 0.4vh)'
  },

  share: {
    color: colors.whiteCardForeground,

    width: 'calc(12px + 0.25vw + 0.25vh)',
    height: 'calc(12px + 0.25vw + 0.25vh)',
    margin: 'auto 5px',

    transition: 'width 0.25s ease'
  },

  confetti: {
    zIndex: -1,
    position: 'absolute',
    
    pointerEvents: 'none',
    
    width: '150%',
    left: '-25%',
    top: '-35%'
  }
});

export default withTranslation(Card);