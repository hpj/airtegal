import React from 'react';

import PropTypes from 'prop-types';

import CopyIcon from 'mdi-react/ContentCopyIcon';

import RedditIcon from 'mdi-react/RedditIcon';
import FacebookIcon from 'mdi-react/FacebookIcon';
import TwitterIcon from 'mdi-react/TwitterIcon';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import i18n from '../i18n.js';

import { getStore } from '../store.js';

const colors = getTheme();

/**
* @param { string } black
* @param { string[] } white
*/
export function shareEntry(black, white)
{
  const b64 = (str) =>
  {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      (match, p1) =>
      {
        return String.fromCharCode('0x' + p1);
      }));
  };

  const obj = { black, white };

  const data = b64(JSON.stringify(obj)).replace('/', '_').replace('+', '-');

  const shareURL = `${process.env.API_ENDPOINT}/share/${data}`;
  const pictureURL = `${process.env.API_ENDPOINT}/picture/${data}.png`;

  if (navigator.share)
  {
    navigator.share({
      title: 'Airtegal',
      text: i18n('hashtag-airtegal'),
      url: shareURL
    }).catch(() =>
    {
      //
    });
  }
  else
  {
    getStore().set({
      share: { active: true, url: shareURL, img: pictureURL }
    });
  }
}

class ShareOverlay extends React.Component
{
  constructor()
  {
    super();

    // bind functions that are use as callbacks

    this.copyURL = this.copyURL.bind(this);

    this.shareOnFacebook = this.shareOnFacebook.bind(this);
    this.shareOnTwitter = this.shareOnTwitter.bind(this);
    this.shareOnReddit = this.shareOnReddit.bind(this);

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

  hide(e)
  {
    const { hide } = this.props;

    if (!(e instanceof KeyboardEvent))
      hide();
    else if (e.key === 'Escape')
      hide();
  }

  copyURL()
  {
    const { share, addNotification } = this.props;

    navigator.clipboard.writeText(share.url);
    
    addNotification(i18n('share-copied-to-clipboard'));
  }

  shareOnFacebook()
  {
    const { share } = this.props;

    const url = `https://www.facebook.com/dialog/share?app_id=196958018362010&href=${share.url}&hashtag=${encodeURIComponent(i18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  shareOnTwitter()
  {
    const { share } = this.props;

    const url = `https://twitter.com/intent/tweet?url=${share.url}&text=${encodeURIComponent(i18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  shareOnReddit()
  {
    const { share } = this.props;

    const url = `https://www.reddit.com/submit?url=${share.url}&title=${encodeURIComponent(i18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  render()
  {
    let { share } = this.props;

    if (!share)
      share = { active: false };

    return (
      <div enabled={ share.active.toString() } className={ styles.wrapper }>
        <div enabled={ share.active.toString() } className={ styles.holder }/>

        <div enabled={ share.active.toString() } className={ styles.container }>
          <img src={ share.img } className={ styles.image }/>

          <div className={ styles.url }>
            <div className={ styles.urlText }>{ share.url }</div>
            <CopyIcon className={ styles.urlCopy } onClick={ this.copyURL }/>
          </div>

          <div className={ styles.buttons }>
            <FacebookIcon onClick={ this.shareOnFacebook } className={ styles.social }/>
            <TwitterIcon onClick={ this.shareOnTwitter } className={ styles.social }/>
            <RedditIcon onClick={ this.shareOnReddit } className={ styles.social }/>
          </div>

          <div className={ styles.close } onClick={ this.hide }>
            { i18n('close') }
          </div>
        </div>
      </div>
    );
  }
}

ShareOverlay.propTypes = {
  addNotification: PropTypes.func.isRequired,
  share: PropTypes.object,
  hide: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    zIndex: 4,
    position: 'fixed',
    display: 'flex',

    justifyContent: 'center',

    top: 0,
    left: 0,

    width: 'calc(100vw + 18px)',
    height: '100vh',

    '[enabled="false"]': {
      pointerEvents: 'none'
    }
  },

  holder: {
    opacity: 0.85,
    backgroundColor: colors.holder,

    width: '100%',
    height: '100%',

    transition: 'opacity 0.25s',
    transitionTimingFunction: 'ease-in-out',

    '[enabled="false"]': {
      opacity: 0
    }
  },

  container: {
    position: 'absolute',
    display: 'grid',

    gridTemplateRows: '60% 1fr auto 1fr',

    color: colors.blackText,
    backgroundColor: colors.shareBackground,

    opacity: 1,
    borderRadius: '10px',

    maxWidth: '490px',

    top: '25vh',
    width: '70vw',
    height: '50vh',
    
    overflow: 'hidden',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    transition: 'top 0.25s, opacity 0.25s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    '[enabled="false"]': {
      opacity: 0,
      top: '100vh'
    }
  },

  image: {
    backgroundColor: colors.shareUrlBackground,

    width: '75%',
    height: '90%',

    objectFit: 'cover',
    borderRadius: '10px',

    margin: 'auto'
  },

  url: {
    display: 'flex',
    alignItems: 'center',

    backgroundColor: colors.whiteBackground,

    overflow: 'hidden',

    borderRadius: '5px',
    margin: '5px 15px'
  },

  urlText: {
    display: 'flex',
    alignItems: 'center',

    userSelect: 'all',

    color: colors.blackText,
    backgroundColor: colors.shareUrlBackground,

    height: '100%',

    overflow: 'hidden',
    padding: '0 0 0 10px'
  },

  urlCopy: {
    cursor: 'pointer',

    width: '24px',
    height: '100%',

    padding: '0 10px',

    ':active': {
      transform: 'scale(0.85)'
    }
  },

  buttons: {
    display: 'flex',
    margin: '5px 15px'
  },

  social: {
    cursor: 'pointer',

    color: colors.blackText,

    width: '16px',
    height: '16px',

    padding: '5px',
    margin: '0 5px',
    borderRadius: '100%',

    ':active': {
      transform: 'scale(0.9)'
    }
  },

  close: {
    cursor: 'pointer',
    userSelect: 'none',

    margin: 'auto'
  }
});

export default ShareOverlay;
