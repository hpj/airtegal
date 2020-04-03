import React from 'react';

import PropTypes from 'prop-types';

import CopyIcon from 'mdi-react/ContentCopyIcon';

import RedditIcon from 'mdi-react/RedditIcon';
import FacebookIcon from 'mdi-react/FacebookIcon';
import TwitterIcon from 'mdi-react/TwitterIcon';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n from '../i18n.js';

const colors = getTheme();

class ShareOverlay extends React.Component
{
  constructor()
  {
    super();

    // bind functions that are use as callbacks

    this.copyURL = this.copyURL.bind(this);
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
    else if (e.keyCode === 27)
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
        <div className={ styles.holder }/>

        <div className={ styles.container }>
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

    'div[enabled="false"] > %this': {
      opacity: 0
    }
  },

  container: {
    position: 'absolute',
    display: 'grid',

    gridTemplateRows: '60% 1fr auto 1fr',

    color: colors.blackText,
    backgroundColor: colors.shareBackground,

    borderRadius: '10px',

    maxWidth: '490px',

    top: '25vh',
    width: '70vw',
    height: '50vh',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    transition: 'top 0.25s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    'div[enabled="false"] > %this': {
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
