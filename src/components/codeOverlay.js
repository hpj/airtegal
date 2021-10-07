import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import LoadingIcon from 'mdi-react/LoadingIcon';

import { createAnimation, createStyle } from 'flcss';

import stack from '../stack.js';

import getTheme, { opacity } from '../colors.js';

import { sendMessage } from '../utils.js';

import Interactable from './interactable.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

class CodeOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      svg: '',
      visible: false,
      opacity: 0
    };
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  scan()
  {
    //
  }

  async show(url)
  {
    try
    {
      this.setState({
        svg: '',
        visible: true
      }, () =>
      {
        stack.register(this.back);
  
        interactableRef.current?.snapTo({ index: 1 });
      });

      const svg = await sendMessage('qr', { text: url });

      this.setState({
        svg: process.env.NODE_ENV !== 'test' ? svg : '<img width="128" src="/icons/128.png"></img>'
      });
    }
    catch (e)
    {
      console.warn(e);
    }
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
    const { svg, visible, opacity } = this.state;
    
    const { size } = this.props;

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

        snapPoints={ [ { y: size.height }, { y: 0 } ] }

        triggers={ [ { y: size.height * 0.1, index: 0 } ] }

        onMovement={ onMovement }
        onSnapEnd={ onSnapEnd }
      >
        
        <div className={ styles.container }>

          <div className={ styles.handler }>
            <div/>
          </div>

          <div className={ styles.qr } dangerouslySetInnerHTML={ { __html: svg } }/>

          <div className={ styles.waiting }>
            <LoadingIcon/>
          </div>
        </div>
      </Interactable>
    </div>;
  }
}

CodeOverlay.propTypes = {
  size: PropTypes.object
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
  wrapper: {
    zIndex: 50,
    position: 'fixed',

    width: '100vw',
    height: '100vh',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[data-visible="false"]': {
      display: 'none'
    },

    '> :nth-child(1)': {
      position: 'absolute',
      backgroundColor: opacity(colors.theme === 'dark' ? '#404040' : colors.whiteBackground, 0.95),

      width: '100vw',
      height: '100vh'
    }
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  handler: {
    display: 'flex',
    justifyContent: 'center',
    
    width: '100%',
    height: 'min-content',

    margin: 'auto 15px 15px',

    '> div': {
      cursor: 'pointer',
      backgroundColor: colors.theme === 'dark' ? '#0e0e0e' : colors.blackText,
  
      width: 'calc(35px + 2.5%)',
      height: '6px',
      borderRadius: '6px'
    }
  },

  qr: {
    ':not(:empty)': {
      width: '128px',
      height: '128px',
      margin: '8vh 0'
    },

    ':empty ~ div': {
      display: 'flex',
      justifyContent: 'center'
    },

    '> svg > :nth-child(1)': {
      opacity: 0
    },

    '> svg > :nth-child(2)': {
      stroke: colors.theme === 'dark' ? '#0e0e0e' : colors.blackText
    }
  },

  waiting: {
    display: 'none',

    width: '128px',
    height: '128px',
    
    margin: '8vh 0',

    '> svg': {
      color: colors.theme === 'dark' ? '#0e0e0e' : colors.blackText,
      animation: waitingAnimation,

      width: '48px',
      height: '48px'
    }
  }
});

export default CodeOverlay;
