
import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

import i18n, { locale } from '../i18n.js';

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
      type, allowed,
      share, onClick
    } = this.props;

    const input = this.state.content;

    let { hidden, winner  } = this.props;

    hidden = hidden ?? false;
    winner = winner ?? false;

    return <div className={ styles.wrapper } style={ style }>
      <div
        type={ type }
        allowed={ (allowed && !hidden)?.toString() ?? 'false' }
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
          hidden ? <div className={ styles.hidden } type={ type }>
            <div>{ i18n('kuruit') }</div>
          </div> : undefined
        }

        {
          !hidden ? <div className={ styles.card } type={ type }>
            <textarea
              ref={ this.textareaRef }
              className={ blank ? styles.input : styles.content }

              value={ input ?? content }

              maxLength={ 105 }
              placeholder={ blank ? i18n('blank') : undefined }

              onClick={ e =>
              {
                e.preventDefault();
                e.stopPropagation();

                onClick(this);
                
                this.focused = true;
              } }

              onFocus={ () => this.focused = true }
              onBlur={ () => this.focused = false }

              onChange={ e =>
              {
                this.resize();
                this.onChange(e);
              } }
            />
          </div> : undefined
        }

        <div hide={ (hidden && type === 'white') ? 'true' : 'false' } visible={ ((!self && !owner) || type === 'black').toString() } enabled={ ((!self && !owner) || type === 'black').toString() } className={ styles.bottom }>
          { blank ? i18n('blank') : i18n('kuruit') }
        </div>

        <div enabled={ ((self === true || owner !== undefined) && type === 'white').toString() } className={ styles.bottom }>
          { self ? i18n('this-card-is-yours') : owner }
          { share ? <ShareIcon className={ styles.share }/> : undefined }
        </div>
      </div>
    </div>;
  }
}

Card.propTypes = {
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
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

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
    direction: locale.direction,
    
    width: '100%',
    minHeight: 'calc((115px + 2vw + 2vh) * 1.15)',
    height: 'auto',

    '> div': {
      margin: '25px 0 0 0'
    }
  },

  card: {
    display: 'grid',
    gridTemplateRows: ' 1fr',
    gridTemplateColumns: '100%',
    gridTemplateAreas: '"content"',

    userSelect: 'none',
    direction: locale.direction,
  
    width: '100%',
    minHeight: 'calc((115px + 2vw + 2vh) * 1.15)',
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
    textAlign: locale.direction === 'ltr' ? 'left' : 'right',

    fontWeight: 700,
    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    resize: 'none',
    overflow: 'hidden auto',

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

  bottom: {
    display: 'flex',
    alignItems: 'center',
    
    userSelect: 'none',
    direction: locale.direction,

    fontSize: 'calc(5px + 0.4vw + 0.4vh)',

    height: 0,

    margin: 0,
    padding: '10px 10px 20px 10px',

    transition: 'padding 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)',

    '[hide="true"]': {
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
    color: colors.whiteCardForeground,
    width: 'calc(14px + 0.3vw + 0.3vh)',
    height: 'calc(14px + 0.3vw + 0.3vh)',
    margin: '0 auto 0 0'
  }
});

export default Card;