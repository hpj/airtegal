import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import QRCode from 'qrcode';

import { createStyle } from 'flcss';

import stack from '../stack.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

import Interactable from './interactable.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

class TutorialOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      dataURL: '',
      visible: false,
      opacity: 0
    };
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  async show(url)
  {
    try
    {
      this.setState({
        visible: true
      }, () =>
      {
        stack.register(this.back);
  
        interactableRef.current?.snapTo({ index: 1 });
      });

      const dataURL = await QRCode.toDataURL(url, {
        color: {
          light: '#ffffff00',
          dark: colors.theme === 'dark' ? '#0e0e0e' : colors.blackText
        },
        width: 128,
        margin: 0
      });

      this.setState({ dataURL });
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
    const { dataURL, visible, opacity } = this.state;
    
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

          <div className={ styles.qr } style={ { backgroundImage: `url(${dataURL})` } }/>
        </div>
      </Interactable>
    </div>;
  }
}

TutorialOverlay.propTypes = {
  size: PropTypes.object,
  translation: PropTypes.func,
  locale: PropTypes.object
};

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
    width: '128px',
    height: '128px',
    margin: '5vh 0'
  }
});

export default withTranslation(TutorialOverlay);
