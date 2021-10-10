import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import LoadingIcon from 'mdi-react/LoadingIcon';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ClipboardTextIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';

import CheckIcon from 'mdi-react/CheckIcon';

import { createAnimation, createStyle } from 'flcss';

import stack from '../stack.js';

import { sendMessage } from '../utils.js';

import Interactable from './interactable.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

class ShareOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      url: '',
      copied: false,
      visible: false,
      opacity: 0
    };

    this.download = this.download.bind(this);
    this.share = this.share.bind(this);
    this.copy = this.copy.bind(this);
  }

  /**
  * @param { { black: string, white: string[] } } data
  */
  async shareEntry(data)
  {
    this.setState({
      visible: true
    }, () =>
    {
      stack.register(this.back);

      interactableRef.current?.snapTo({ index: 1 });
    });
    
    const url = await sendMessage('share', { url: process.env.API_ENDPOINT, ...data });

    this.setState({ url });
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  hide()
  {
    if (!this.state.visible)
      return;

    stack.unregister(this.back);
    
    this.setState({
      url: '',
      copied: false,
      visible: false
    });
  }

  // istanbul ignore next
  download()
  {
    const { url } = this.state;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(`${url}?download`, '_blank');
  }

  // istanbul ignore next
  share()
  {
    const { url } = this.state;

    navigator.share?.({
      url,
      title: 'Share'
    }).catch(console.warn);
  }

  // istanbul ignore next
  async copy()
  {
    const { url } = this.state;

    try
    {
      await navigator.clipboard?.writeText(url);

      this.setState({ copied: true });

      clearTimeout(this.copyTimeout);

      this.copyTimeout =
        setTimeout(() => this.setState({ copied: false }), 1500);
    }
    catch (err)
    {
      console.warn(err);
    }
  }

  render()
  {
    const { visible, opacity, copied, url } = this.state;
    
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

        snapPoints={ [ { y: size.height }, { y: 0 } ] }

        resistance={ { y: size.height * 0.05 } }

        triggers={ [ { y: size.height * 0.1, index: 0 } ] }

        onMovement={ onMovement }
        onSnapEnd={ onSnapEnd }
      >
        <div className={ styles.container }>
          
          <div className={ styles.handler }>
            <div/>
          </div>

          <img src={ url } className={ styles.image }/>

          <div className={ styles.url } data-value={ url }>
            { url }
            <LoadingIcon/>
          </div>

          <div className={ styles.buttons } style={ { direction: locale.direction } } data-active={ url.length > 0 }>
              
            <div className={ styles.button } onClick={ this.copy } data-copied={ copied }>
              <div>{ translation('copy') }</div>
              <CopyIcon/>
              <CheckIcon/>
            </div>

            {
              navigator.share ?
                <div className={ styles.button } onClick={ this.share }>
                  <div>{ translation('share') }</div>
                  <ShareIcon/>
                </div> :
                <div className={ styles.button } onClick={ this.download }>
                  <div>{ translation('download') }</div>
                  <DownloadIcon/>
                </div>
            }
          </div>
        </div>
      </Interactable>
    </div>;
  }
}

ShareOverlay.propTypes = {
  size: PropTypes.object,
  translation: PropTypes.func,
  locale: PropTypes.object
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

  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
    objectFit: 'cover'
  },

  url: {
    display: 'flex',
    justifyContent: 'center',

    color: opacity(colors.blackText, 0.5),
    backgroundColor: opacity(colors.roomBackground, 0.95),

    padding: '15px',
    margin: '10px 0',

    '> svg': {
      color: colors.blackText,
      animation: waitingAnimation,

      width: '26px',
      height: '26px'
    },

    ':not([data-value=""])': {
      display: 'block',
      
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',

      '> svg': {
        display: 'none'
      }
    }
  },

  buttons:
  {
    display: 'flex',
    gap: '15px',

    '[data-active="false"]': {
      opacity: 0.25,
      pointerEvents: 'none'
    }
  },

  button: {
    display: 'flex',
    position: 'relative',
    cursor: 'pointer',

    flexGrow: 1,
    alignItems: 'center',

    color: colors.blackText,
    border: '1px solid',
    borderColor: opacity(colors.roomBackground, 0.95),

    padding: '15px 10px',

    '> *': {
      opacity: 1,
      transition: 'opacity 0.15s ease-in'
    },

    '> :nth-child(1)': {
      flexGrow: 1,
      margin: '0 10px'
    },

    '> :nth-child(2)': {
      width: '16px',
      height: '16px',
      margin: '0 10px'
    },

    '> :nth-child(3)': {
      opacity: 0,
      position: 'absolute',

      left: 0,
      width: '100%',
      height: '18px'
    },

    '[data-copied="true"]': {
      '> *': {
        opacity: 0
      },
      '> :nth-child(3)': {
        opacity: 1
      }
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

export default withTranslation(ShareOverlay);
