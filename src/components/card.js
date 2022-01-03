
import React, { createRef } from 'react';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import Lottie from 'lottie-react';

import getTheme from '../colors.js';

import stack from '../stack.js';

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

    this.back = this.back.bind(this);
  }

  back()
  {
    this.textareaRef?.current.blur();
  }

  onChange(e)
  {
    const { locale } = this.props;

    this.setState({
      content: e.target.value.replace(locale.blank, '').replace(/\s+/g, ' ')
    });
  }

  render()
  {
    const {
      content,
      style,
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
        winner && process.env.NODE_ENV !== 'test' ?
          <Lottie className={ styles.confetti } loop={ false } animationData={ confettiAnimation }/> : undefined
      }

      <div
        data-type={ type }
        data-allowed={ (allowed || share) && !hidden }
        data-winner={ winner }
        className={ styles.container }
        onClick={ e =>
        {
          e.preventDefault();
          e.stopPropagation();

          if (blank)
            stack.register(this.back);

          onClick(this);
        } }
      >
        {
          hidden ? <div className={ styles.hidden } style={ { direction: locale.direction } }>
            <div>{ translation('kuruit') }</div>
          </div> : undefined
        }

        {
          !hidden ? <div className={ styles.card } data-type={ type } style={ { direction: locale.direction } }>
            <textarea
              ref={ this.textareaRef }

              className={ styles.content }

              style={ {
                pointerEvents: blank ? 'auto' : 'none',
                textAlign: locale.direction === 'ltr' ? 'left' : 'right'
              } }

              value={ input ?? content }

              maxLength={ 105 }

              placeholder={ blank ? translation('blank') : undefined }

              onKeyDown={ e =>
              {
                if (!this.focused)
                  return;
                
                if (e.code === 'Enter')
                  onClick(this);
              } }

              onClick={ e =>
              {
                this.focused = true;

                e.preventDefault();
                e.stopPropagation();

                if (blank)
                  stack.register(this.back);

                onClick(this);
              } }

              onBlur={ () =>
              {
                this.focused = false;

                this.setState({ content: '' });

                if (blank)
                  stack.unregister(this.back);
              } }

              onChange={ e => this.onChange(e) }
            />
          </div> : undefined
        }

        <div className={ styles.bottom } style={ { direction: locale.direction } }>
          {
            hidden ? '' :
              owner && type === 'white' ? owner :
                blank ? translation('blank') : translation('kuruit')
          }

          <ShareIcon className={ styles.share } style={ {
            width: !share ? 0 : undefined
          } } />
        </div>
      </div>
    </div>;
  }
}

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
    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '10px 10px 0',
    boxShadow: '0 0 0 0',

    transition: 'box-shadow 0.25s ease',

    '[data-allowed="true"]': {
      cursor: 'pointer'
    },

    '[data-allowed="true"]:hover': {
      animationName: `${floatAnimation}, ${hoverAnimation}`,
      animationDuration: '.3s, 1.5s',
      animationDelay: '0s, .3s',
      animationTimingFunction: 'ease-out, ease-in-out',
      animationIterationCount: '1, infinite',
      animationFillMode: 'forwards',
      animationDirection: 'normal, alternate'
    },

    '[data-winner="true"]': {
      boxShadow: `5px 5px 0 0 ${colors.whiteCardHighlight}, 5px 5px 10px 0 ${colors.whiteCardHighlight}`
    },

    '[data-type="black"][data-allowed="true"]:hover': {
      boxShadow: `5px 5px 0px 0px ${colors.blackCardHover}`
    },

    '[data-type="white"][data-allowed="true"][data-winner="false"]:hover': {
      boxShadow: `5px 5px 0px 0px ${colors.whiteCardHover}`
    },

    '[data-type="black"]': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    },

    '[data-type="white"]': {
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

    // override hand overlay pointer events
    pointerEvents: 'auto',

    userSelect: 'none',
  
    width: '100%',
    height: 'auto',

    '[data-type="black"]> textarea': {
      color: colors.blackCardForeground,
      backgroundColor: colors.blackCardBackground
    },

    '[data-type="white"]> textarea': {
      color: colors.whiteCardForeground,
      backgroundColor: colors.whiteCardBackground
    }
  },

  content: {
    cursor: 'pointer',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    resize: 'none',
    overflow: 'hidden',

    height: 'calc((115px + 2vw + 2vh) * 0.985)',

    padding: 0,
    border: 0,

    ':focus': {
      'outline': 'none'
    },

    ':not(:focus)::selection': {
      backgroundColor: colors.transparent
    }
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