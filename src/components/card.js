
import React, { createRef } from 'react';

import TextareaAutosize from 'react-textarea-autosize';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import Lottie from 'lottie-react';

import getTheme from '../colors.js';

import stack from '../stack.js';

import { createStyle, createAnimation } from 'flcss';

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

  static get size()
  {
    const x = 'calc(115px + 2vw + 2vh)';

    return {
      width: x,
      height: x
    };
  }

  static get wide()
  {
    const width = 'calc(325px + 2vw + 2vh)';
    const height = '24px';

    return {
      width,
      height
    };
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
      style, gameMode,
      owner, blank,
      type, onClick,
      locale, translation
    } = this.props;

    let bottom = '';

    const input = this.state.content;

    let { allowed, hidden, winner, share } = this.props;

    allowed = allowed ?? false;

    hidden = hidden ?? false;
    winner = winner ?? false;
    share = share ?? false;

    if (owner && type === 'white')
      bottom = owner;
    else if (gameMode === 'kuruit' && blank && !hidden)
      bottom = translation('blank');
    else if (gameMode === 'kuruit' && !hidden)
      bottom = translation('kuruit');
    else if (gameMode === 'democracy')
      bottom = translation('democracy');

    return <div className={ styles.wrapper } data-gamemode={ gameMode } style={ style }>
      {
        winner ?
          <Lottie
            loop={ false }
            className={ styles.confetti }
            initialSegment={ process.env.NODE_ENV === 'test' ? [ 10, 11 ] : undefined }
            animationData={ confettiAnimation }
          /> : undefined
      }

      <div
        data-type={ type }
        data-gamemode={ gameMode }
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
          hidden ? <div className={ styles.hidden } data-gamemode={ gameMode } data-type={ type } style={ { direction: locale.direction } }>
            <div>{ translation('kuruit') }</div>
          </div> : undefined
        }

        {
          !hidden ? <div className={ styles.card } data-type={ type } style={ { direction: locale.direction } }>
            <TextareaAutosize
              ref={ this.textareaRef }

              className={ styles.content }

              style={ {
                pointerEvents: blank ? 'auto' : 'none',
                textAlign: locale.direction === 'ltr' ? 'left' : 'right'
              } }

              value={ input ?? content }

              maxLength={ 105 }

              placeholder={ blank ? translation('blank') : undefined }
              
              data-type={ type }
              data-gamemode={ gameMode }

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

        <div className={ styles.bottom } data-gamemode={ gameMode } data-type={ type } style={ { direction: locale.direction } }>
          { bottom }
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
    width: Card.size.width,

    '[data-gamemode="democracy"]': {
      width: Card.wide.width
    }
  },

  container: {
    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '15px 10px 0',
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
    },

    '[data-gamemode="democracy"][data-type="black"]': {
      padding: '15px 10px'
    }
  },

  hidden: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    userSelect: 'none',
    fontSize: 'calc(8px + 0.4vw + 0.4vh)',
    
    width: '100%',
    minHeight: Card.size.height,
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

    minHeight: Card.size.height,

    padding: 0,
    border: 0,

    '[data-gamemode="democracy"]': {
      textAlign: 'center !important',
      margin: 'auto'
    },
    
    '[data-gamemode="democracy"][data-type="black"]': {
      minHeight: 'unset'
    },

    '[data-gamemode="democracy"][data-type="white"]': {
      minHeight: Card.wide.height
    },

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

    fontSize: 'calc(5px + 0.4vw + 0.4vh)',


    '[data-gamemode="democracy"][data-type="black"]': {
      display: 'none'
    }
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

export default Card;