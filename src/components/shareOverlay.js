import React from 'react';

import PropTypes from 'prop-types';

import RedditIcon from 'mdi-react/RedditIcon';
import FacebookIcon from 'mdi-react/FacebookIcon';
import TwitterIcon from 'mdi-react/TwitterIcon';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import { getI18n, withI18n } from '../i18n.js';

import { getStore } from '../store.js';

const colors = getTheme();

let compress;

import('wasm-brotli')
  .then(brotli => compress = brotli.compress)
  .catch(console.warn);

/**
* @param { string } black
* @param { string[] } white
*/
export async function shareEntry(black, white)
{
  if (!compress)
    return;

  let obj = {};

  if (!white)
    obj = { story: black };
  else
    obj = { black, white };

  const content = new TextEncoder('utf8')
    .encode(JSON.stringify(obj));

  const data = btoa(String.fromCharCode(...compress(content)))
    // base64 has some characters not compatible with urls
    .replace(/\//g, '_').replace(/\+/g, '-');

  const shareURL = `${process.env.API_ENDPOINT}/share/${data}`;
  const pictureURL = `${process.env.API_ENDPOINT}/picture/${data}.png`;

  if (navigator.share)
  {
    navigator.share({
      title: 'Airtegal',
      text: getI18n('hashtag-airtegal'),
      url: shareURL
    }).catch(console.warn);
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

    this.copyURL = this.copyURL.bind(this);

    this.shareOnFacebook = this.shareOnFacebook.bind(this);
    this.shareOnTwitter = this.shareOnTwitter.bind(this);
    this.shareOnReddit = this.shareOnReddit.bind(this);

    this.hide = this.hide.bind(this);
  }

  async componentDidMount()
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

  // istanbul ignore next
  copyURL()
  {
    const { addNotification } = this.props;

    // navigator.clipboard?.writeText(this.props.share.url)
    //   .then(() => addNotification(getI18n('share-copied-to-clipboard')))
    //   .catch(console.warn);

    try
    {
      if (document.execCommand('copy'))
        addNotification(getI18n('share-copied-to-clipboard'));
    }
    catch
    {
      //
    }
  }

  // istanbul ignore next
  shareOnFacebook()
  {
    const { share } = this.props;

    const url = `https://www.facebook.com/dialog/share?app_id=196958018362010&href=${share.url}&hashtag=${encodeURIComponent(getI18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  // istanbul ignore next
  shareOnTwitter()
  {
    const { share } = this.props;

    const url = `https://twitter.com/intent/tweet?url=${share.url}&text=${encodeURIComponent(getI18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  // istanbul ignore next
  shareOnReddit()
  {
    const { share } = this.props;

    const url = `https://www.reddit.com/submit?url=${share.url}&title=${encodeURIComponent(getI18n('hashtag-airtegal'))}`;
  
    const options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
  
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, 'Share', options);
  }

  render()
  {
    const { i18n } = this.props;

    let { share } = this.props;

    if (!share)
      share = { active: false };

    if (process.env.NODE_ENV === 'test')
      share.img = '/assets/card.png';

    return (
      <div enabled={ share.active.toString() } className={ styles.wrapper }>
        <div enabled={ share.active.toString() } className={ styles.holder }/>

        <div enabled={ share.active.toString() } className={ styles.container }>
          <img src={ share.img } className={ styles.image }/>

          <div className={ styles.url } onClick={ this.copyURL }>
            { share.url }
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
  i18n: PropTypes.func,
  locale: PropTypes.object,
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

    transition: 'opacity 0.25s ease-in-out',

    '[enabled="false"]': {
      opacity: 0
    }
  },

  container: {
    position: 'absolute',
    display: 'grid',

    gridTemplateRows: '60% auto 1fr 2fr',

    color: colors.blackText,
    backgroundColor: colors.shareBackground,

    opacity: 1,
    borderRadius: '10px',

    maxWidth: '490px',

    top: '25vh',
    width: '40vw',
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

    width: '90%',
    height: '90%',

    objectFit: 'cover',
    borderRadius: '10px',

    margin: 'auto'
  },

  url: {
    color: colors.blackText,
    backgroundColor: colors.shareUrlBackground,

    width: 'calc(100% - 60px)',
    
    userSelect: 'all',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    margin: '0 auto',
    padding: '10px 15px',
    borderRadius: '5px'
  },

  buttons: {
    display: 'flex',
    alignItems: 'center',

    margin: '5px 15px'
  },

  social: {
    cursor: 'pointer',

    color: colors.blackText,

    width: '16px',
    height: '16px',

    padding: '10px',
    margin: '0 5px',
    borderRadius: '100%',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    ':active': {
      transform: 'scale(0.9)'
    }
  },

  close: {
    display: 'flex',
    cursor: 'pointer',
    
    userSelect: 'none',
    textAlign: 'center',

    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    padding: '5px 0',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    }
  }
});

export default withI18n(ShareOverlay);
