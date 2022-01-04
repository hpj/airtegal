import React, { createRef } from 'react';

import { createStyle } from 'flcss';

import stack from '../stack.js';

import { sendMessage } from '../utils.js';

import Interactable from './interactable.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

const colors = getTheme();

/**
* @type { React.RefObject<HTMLInputElement> }
*/
const inputRef = createRef();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

class UsernameOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      visible: false,
      username: '',
      opacity: 0,
      index: 0
    };
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  show(username)
  {
    this.setState({
      visible: true,
      username
    }, () =>
    {
      stack.register(this.back);
      
      interactableRef.current?.snapTo({ index: 1 });
      
      inputRef.current?.focus();
    });
  }

  hide()
  {
    if (!this.state.visible)
      return;

    stack.unregister(this.back);
    
    this.setState({
      visible: false
    });
  }

  render()
  {
    const { visible, opacity } = this.state;
    
    const { size, translation, locale } = this.props;

    const onMovement = ({ y }) =>
    {
      this.setState({
        opacity: 1 - (y / size.height)
      });
    };

    const onSnapEnd = index =>
    {
      if (index === 0)
        this.hide();
    };

    return <div className={ styles.wrapper } data-visible={ visible }>
      <div style={ { opacity } }/>

      <Interactable
        ref={ interactableRef }
        
        style={ {
          display: 'flex',
          position: 'fixed',

          alignItems: 'center',
          justifyContent: 'center',

          width: '100vw',
          height: '100vh'
        } }

        dragEnabled={ true }
        
        verticalOnly={ true }

        frame={ { pixels: Math.round(size.height * 0.05), every: 8 } }
        
        boundaries={ {
          top: 0,
          bottom: size.height
        } }
        
        initialPosition={ { y: size.height } }

        resistance={ { y: size.height * 0.05 } }
        
        snapPoints={ [ { y: size.height }, { y: 0 } ] }

        triggers={ ({ y }) => y >= size.height * 0.1 ? 0 : undefined }

        onMovement={ onMovement }
        onSnapEnd={ onSnapEnd }
      >
        <div className={ styles.container } style={ { direction: locale.direction } }>
          
          <div className={ styles.handler }>
            <div/>
          </div>

          <div className={ styles.title }>
            { translation('username-prefix') }
          </div>

          <input
            required
            type={ 'text' }
            ref={ inputRef }
            id={ 'username-input' }
            className={ styles.input }
            style={ { direction: locale.direction } }
            maxLength={ 18 }
            value={ this.state.username }
            placeholder={ translation('placeholder') }
            onChange={ e =>
            {
              const value = e.target.value;
              const username = value.replace(/\s+/g, ' ');
              const blur = value.replace(/\s+/g, ' ').trim();

              if (blur?.length)
              {
                this.props.setUsername(blur);
                
                localStorage.setItem('username', blur);
                
                sendMessage('username', { username: blur });
              }

              this.setState({
                username
              });
            } }
          />

        </div>
      </Interactable>
    </div>;
  }
}

const styles = createStyle({
  wrapper: {
    zIndex: 4,
    position: 'fixed',
    
    width: '100vw',
    height: '100vh',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[data-visible="false"]': {
      display: 'none'
    },

    '> :nth-child(1)': {
      position: 'absolute',
      backgroundColor: opacity(colors.whiteBackground, '0.95'),

      width: '100vw',
      height: '100vh'
    }
  },

  container: {
    color: colors.blackText,
    
    minWidth: '210px',
    maxWidth: '420px',
    width: '80vw'
  },

  handler: {
    display: 'flex',
    justifyContent: 'center',
    margin: '15px',

    '> div': {
      cursor: 'pointer',
      backgroundColor: opacity(colors.blackText, 0.5),
  
      width: 'calc(35px + 2.5%)',
      height: '6px',
      borderRadius: '6px'
    }
  },

  title: {
    margin: '0 5px'
  },

  input: {
    width: '100%',

    cursor: 'text',

    color: colors.blackText,
    backgroundColor: colors.transparent,

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: '5px 0',
    padding: '10px 5px',
    border: 0,

    borderBottom: `2px ${colors.blackText} solid`,

    '::placeholder': {
      color: colors.greyText
    },

    ':focus': {
      'outline': 'none'
    }
  }
});

export default withTranslation(UsernameOverlay);
