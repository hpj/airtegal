
import React, { useState } from 'react';

import PropTypes from 'prop-types';

import SubmitIcon from 'mdi-react/KeyboardReturnIcon';
import WaitingIcon from 'mdi-react/LoadingIcon';

import { createAnimation, createStyle } from 'flcss';

import getTheme from '../colors.js';

import i18n, { locale } from '../i18n.js';

import AutoSizeInput from './autoSizeInput.js';

const colors = getTheme();

/**
* @param { { description: string, allowed: boolean, onSubmit: () => void } } param0
*/
const Box = ({ description, allowed, onSubmit }) =>
{
  const [ content, setContent ] = useState(allowed && description ? '' : description);
  
  return <div className={ styles.container } waiting={ (!allowed && description !== undefined).toString() }>
    {
      allowed && description ? <div className={ styles.items }>{ description }</div> : undefined
    }

    <AutoSizeInput
      required
      className={ styles.input }
      placeholder={ i18n('blank') }
      type={ 'text' }
      value={ allowed && description ? content : i18n('qassa') }
      disabled={ !allowed || !description }
      onSubmit={ () => onSubmit(content) }
      onUpdate={ (value, resize, blur) =>
      {
        const c = value.replace(locale.blank, '').replace(/\s+/g, ' ');

        setContent(blur ? c.trim() : c);
      } }
    />

    {
      !allowed ? <WaitingIcon className={ styles.waiting }/> : undefined
    }

    {
      allowed ? <SubmitIcon className={ styles.icon } onClick={ () => onSubmit(content) }/> : undefined
    }
  </div>;
};

Box.propTypes = {
  description: PropTypes.string,
  allowed: PropTypes.bool,
  onSubmit: PropTypes.func
};

const waitingAnimation = createAnimation({
  duration: '1s',
  timingFunction: 'ease',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  }
});

const styles = createStyle({
  container: {
    display: 'grid',
    position: 'relative',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto 1fr',

    gridTemplateAreas: '"items icon" "content icon"',

    backgroundColor: colors.blackCardBackground,
    
    width: 'auto',
    minWidth: 'calc(165px + 2vw + 2vh)',
    height: '55px',

    padding: '25px',
    margin: '25px',
    borderRadius: '10px',

    '[waiting="true"] > svg': {
      width: '20px',
      height: '20px',
      padding: '15px'
    },

    '.enter': {
      left: '100vw'
    },
    
    '.enter-active': {
      left: 0,
      transition: 'left 0.25s'
    },

    '.exit': {
      left: 0
    },

    '.exit-active': {
      left: '100vw',
      transition: 'left 0.25s'
    }
  },

  items: {
    gridArea: 'items',
    color: colors.whiteText,

    userSelect: 'none',
    direction: locale.direction,
    textTransform: 'capitalize',

    fontWeight: 700,
    fontSize: 'calc(6px + 0.35vw + 0.35vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  input: {
    gridArea: 'content',
    direction: locale.direction,

    color: colors.whiteText,
    backgroundColor: colors.blackCardBackground,

    fontWeight: 700,
    fontSize: 'calc(9px + 0.35vw + 0.35vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    textTransform: 'capitalize',

    width: '100%',
    minWidth: '35px',
    maxWidth: '65vw',

    padding: 0,
    margin: '10px 0 0',
    border: 0,

    ':focus': {
      'outline': 'none'
    },

    '::placeholder':
    {
      color: colors.greyText
    },

    ':first-child': {
      margin: '0',
      minWidth: '100%',
      textTransform: 'capitalize',
      textAlign: 'center'
    },

    ':not(:disabled):valid ~ svg': {
      width: '20px',
      height: '20px',
      padding: '15px'
    },

    ':not(:focus)::selection': {
      backgroundColor: colors.transparent
    }
  },

  waiting: {
    gridArea: 'icon',
    color: colors.whiteText,

    animation: waitingAnimation,

    width: '0',
    height: '0',
    padding: '0',
    margin: 'auto',

    transition: 'width 0.25s, height 0.25s, padding 0.25s, transform 0.15s'
  },

  icon: {
    cursor: 'pointer',

    gridArea: 'icon',
    color: colors.whiteText,
    
    width: '0',
    height: '0',
    padding: '0',
    margin: 'auto',

    borderRadius: '100%',

    transition: 'width 0.25s, height 0.25s, padding 0.25s, transform 0.15s',

    ':hover': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

export default Box;