import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import LoadingIcon from 'mdi-react/LoadingIcon';

import QrScanner from 'qr-scanner';

import { createAnimation, createStyle } from 'flcss';

import stack from '../stack.js';

import getTheme, { opacity as alpha } from '../colors.js';

import { sendMessage } from '../utils.js';

import Interactable from './interactable.js';

import Icon from '../../public/assets/icon-dark.svg';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

/**
* @type { React.RefObject<HTMLVideoElement> }
*/
const videoRef = createRef();

class CodeOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      svg: '',
      loading: false,
      visible: false,
      scan: false,
      opacity: 0
    };

    /**
    * @type { QrScanner }
    */
    this.qrScanner = null;

    this.decode = this.decode.bind(this);
  }

  componentDidMount()
  {
    this.qrScanner = new QrScanner(videoRef.current, this.decode, undefined, undefined, 'environment');
  }

  componentWillUnmount()
  {
    this.qrScanner.destroy();
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  async show({ url, scan })
  {
    try
    {
      this.setState({
        svg: '',
        scan: scan ?? false,
        loading: true,
        visible: true
      }, () =>
      {
        stack.register(this.back);
  
        interactableRef.current?.snapTo({ index: 1 });
      });

      if (scan)
      {
        await this.qrScanner.start();

        // hide loading state when the video feed starts
        videoRef.current.addEventListener('play', () => this.setState({ loading: false }), { once: true });
      }
      else if (url)
      {
        const svg = await sendMessage('qr', { text: url });
  
        this.setState({
          svg,
          loading: false
        });
      }
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
      scan: false,
      visible: false
    }, () => this.qrScanner.stop());
  }

  /**
  * @param { string } result
  */
  decode(result)
  {
    const url = `${location.protocol}//${location.host}/play`;

    if (result.startsWith(url))
      window.location.assign(result);
  }

  render()
  {
    const { size } = this.props;
    
    const { svg, loading, visible, scan, opacity } = this.state;

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

        triggers={ ({ y }) => y >= size.height * 0.1 ? 0 : undefined }

        onMovement={ onMovement }
        onSnapEnd={ onSnapEnd }
      >
        <video ref={ videoRef } className={ styles.scanner }/>
        
        <div className={ styles.container }>

          <div className={ styles.handler }>
            <div/>
          </div>

          {
            !loading && !scan ? <div className={ styles.qr }>
              <div dangerouslySetInnerHTML={ { __html: svg } }/>
              <Icon/>
            </div> : undefined
          }

          {
            loading ? <div className={ styles.waiting }>
              <LoadingIcon/>
            </div> : undefined
          }

          {
            scan && !loading ? <div className={ styles.indicator }/> : undefined
          }
        </div>
      </Interactable>
    </div>;
  }
}

CodeOverlay.propTypes = {
  size: PropTypes.object,
  join: PropTypes.func.isRequired
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
      backgroundColor: alpha(colors.theme === 'dark' ? '#404040' : colors.whiteBackground, 0.95),

      width: '100vw',
      height: '100vh'
    }
  },

  scanner: {
    opacity: 0.25,

    position: 'fixed',
    objectFit: 'fill',

    width: '100%',
    height: '100%'
  },

  container: {
    zIndex: 1,
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

  indicator: {
    width: '25vw',
    height: '25vw',

    minWidth: '150px',
    minHeight: '150px',
    maxWidth: '300px',
    maxHeight: '300px',

    margin: '8vh 0',
    border: `2px ${colors.theme === 'dark' ? '#0e0e0e' : colors.blackText} dashed`
  },

  qr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    width: '128px',
    height: '128px',

    margin: '8vh 0',

    '> :nth-child(1)': {
      position: 'absolute',

      '> svg > :nth-child(1)': {
        opacity: 0
      },
  
      '> svg > :nth-child(2)': {
        stroke: colors.theme === 'dark' ? '#0e0e0e' : colors.blackText
      }
    },

    '> :nth-child(2)': {
      zIndex: 2,
      width: '32px',
      height: '32px',

      '> g > g > rect': {
        strokeWidth: '8px !important',
        stroke: `${colors.theme === 'dark' ? '#0e0e0e' : colors.blackText} !important`,
        fill: `${alpha(colors.theme === 'dark' ? '#404040' : colors.whiteBackground, 0.95)} !important`
      }
    }
  },

  waiting: {
    display: 'flex',
    justifyContent: 'center',

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
