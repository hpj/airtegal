
import React, { useState } from 'react';

import PropTypes from 'prop-types';

import SubmitIcon from 'mdi-react/KeyboardReturnIcon';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import i18n, { locale } from '../i18n.js';

import AutoSizeInput from './autoSizeInput.js';

const colors = getTheme();

/**
* @param { { description: string, allowed: boolean, onSubmit: () => void } } param0
*/
const Box = ({ description, allowed, onSubmit }) =>
{
  if (allowed && !description)
    allowed = false;

  const [ content, setContent ] = useState(allowed ? '' : description);
  
  return <div className={ styles.container }>
    {
      allowed ? <div className={ styles.items }>{ description }</div> : undefined
    }

    <AutoSizeInput
      required
      className={ styles.input }
      placeholder={ i18n('blank') }
      type={ 'text' }
      value={ allowed ? content : i18n('qassa') }
      disabled={ !allowed }
      onUpdate={ (value, resize, blur) =>
      {
        const c = value.replace(locale.blank, '').replace(/\s+/g, ' ');

        setContent(blur ? c.trim() : c);
      } }
    />

    <SubmitIcon className={ styles.icon } onClick={ () => onSubmit(content) }/>
  </div>;
};

Box.propTypes = {
  description: PropTypes.string,
  allowed: PropTypes.bool,
  onSubmit: PropTypes.func
};

const styles = createStyle({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto 1fr',

    gridTemplateAreas: '"items icon" "content icon"',

    backgroundColor: colors.blackCardBackground,
    
    width: 'auto',
    minWidth: 'calc(165px + 2vw + 2vh)',
    height: '55px',

    padding: '25px',
    margin: '35px 25px',
    borderRadius: '10px'
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

    margin: '15px 0 0 10px',
    padding: 0,
    border: 0,

    ':focus': {
      'outline': 'none'
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

  icon: {
    cursor: 'pointer',

    gridArea: 'icon',
    color: colors.whiteText,
    
    width: '0',
    height: '0',
    padding: '0',
    margin: 'auto',

    transition: 'width 0.25s, height 0.25s, padding 0.25s, transform 0.15s',
    borderRadius: '100%',

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