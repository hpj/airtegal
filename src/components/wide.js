
import React from 'react';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

import { withTranslation } from '../i18n.js';

const colors = getTheme();

class Wide extends React.Component
{
  render()
  {
    const { float, content } = this.props;

    return <div className={ styles.wrapper }>
      <div className={ `${styles.container} ${float && process.env.NODE_ENV !== 'test' ? styles.float : undefined}` }>
        { content }
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
    userSelect: 'none',
    position: 'relative',
    marginBottom: '35vh',
    width: '100%'
  },

  container: {
    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(12px + 0.25vw + 0.25vh)',
    
    textAlign: 'center',
    
    color: colors.blackCardForeground
  },

  float: {
    animationName: `${floatAnimation}, ${hoverAnimation}`,
    animationDuration: '.3s, 1.5s',
    animationDelay: '0s, .3s',
    animationTimingFunction: 'ease-out, ease-in-out',
    animationIterationCount: '1, infinite',
    animationFillMode: 'forwards',
    animationDirection: 'normal, alternate'
  }
});

export default withTranslation(Wide);