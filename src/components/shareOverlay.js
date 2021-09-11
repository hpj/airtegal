import React from 'react';

import PropTypes from 'prop-types';

import CloseIcon from 'mdi-react/CloseBoldIcon';
import WaitingIcon from 'mdi-react/LoadingIcon';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ClipboardTextIcon';

import DownloadIcon from 'mdi-react/DownloadIcon';

import { createAnimation, createStyle } from 'flcss';

import { sendMessage } from '../utils.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

const colors = getTheme();

class ShareOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      url: ''
    };

    this.download = this.download.bind(this);
    this.share = this.share.bind(this);
    this.copy = this.copy.bind(this);

    this.hide = this.hide.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keyup', this.hide);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keyup', this.hide);
  }

  /**
  * @param { { template: string, items: string[], black: string, white: string[] } } data
  */
  async shareEntry(data)
  {
    const response = await sendMessage('share', { data });

    this.setState({
      url: `${process.env.API_ENDPOINT}/share/${response}`
    });
  }

  hide(e)
  {
    if (e instanceof KeyboardEvent && e.key !== 'Escape')
      return;
    
    this.setState({
      url: undefined
    });
  }

  // istanbul ignore next
  download()
  {
    //
  }

  // istanbul ignore next
  share()
  {
    // navigator.share({
    //   title: 'Share Room URL',
    //   text: translation('join-me'),
    //   url: `${location.protocol}//${location.host}${location.pathname}?join=${this.state.roomData?.id}`
    // }).catch(console.warn);
  }

  // istanbul ignore next
  copy()
  {
    // navigator.clipboard?.writeText(this.props.share.url)
    //   .then(() => addNotification(gettranslation('share-copied-to-clipboard')))
    //   .catch(console.warn);

    try
    {
      // if (document.execCommand('copy'))
      // addNotification(translation('share-copied-to-clipboard'));
    }
    catch
    {
      //
    }
  }

  render()
  {
    const { url } = this.state;
    
    const { translation, locale } = this.props;

    // TODO add a close fucking button

    return url ? <div className={ styles.wrapper }>

      <div className={ styles.container }>
        <img src={ process.env.NODE_ENV === 'test' ? '/assets/card.png' : url }className={ styles.image }/>

        <div className={ styles.url } data-value={ url }>
          { url }
          <WaitingIcon/>
        </div>

        <div className={ styles.buttons } style={ { direction: locale.direction } }>
          {
            navigator.share ? <div className={ styles.button } onClick={ this.share }>
              <div>Share</div>
              <ShareIcon/>
            </div> : <div className={ styles.button } onClick={ this.copy }>
              <div>Copy</div>
              <CopyIcon/>
            </div>
          }
     
          <div className={ styles.button } onClick={ this.download }>
            <div>Download</div>
            <DownloadIcon/>
          </div>
        </div>
      </div>
    </div> : <div/>;
  }
}

ShareOverlay.propTypes = {
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

    display: 'flex',
    position: 'fixed',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    width: '100vw',
    height: '100vh',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  container: {
    maxWidth: '640px',
    width: '40vw'
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
      
      userSelect: 'all',
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
    display: 'grid',
    
    gridTemplateAreas: '. .',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr 1fr',

    gap: '15px',

    '@media screen and (max-width: 700px)': {
      gridTemplateAreas: '"." "."',
      gridTemplateRows: '1fr 1fr',
      gridTemplateColumns: '1fr'
    }
  },

  button: {
    display: 'flex',
    cursor: 'pointer',

    flexGrow: 1,
    alignItems: 'center',

    color: colors.blackText,
    border: '1px solid',
    borderColor: opacity(colors.roomBackground, 0.95),

    padding: '15px 10px',

    '> :nth-child(1)': {
      flexGrow: 1,
      margin: '0 10px'
    },

    '> :nth-child(2)': {
      width: '16px',
      height: '16px',
      margin: '0 10px'
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

export default withTranslation(ShareOverlay);
