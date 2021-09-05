import React, { useRef, useState, useEffect } from 'react';

import { createStyle } from 'flcss';

import CloseIcon from 'mdi-react/CloseBoldIcon';
import DiscordIcon from 'mdi-react/DiscordIcon';

import getTheme, { opacity } from '../colors.js';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

const Tutorial = () =>
{
  /**
  * @type { React.MutableRefObject<HTMLDivElement> }
  */
  const tutorialRef = useRef();

  const storageKey = 'airtegal-kuruit-tutorial';
  
  const { locale, translation } = useTranslation();

  const [ visible, setVisibility ] = useState(false);
  
  const [ index, setIndex ] = useState(0);

  // init effect
  useEffect(() =>
  {
    const params = new URL(document.URL)?.searchParams;

    if (process.env.NODE_ENV === 'test' && params?.has('quiet'))
      return;

    // because the warning starts hidden
    // we need to check if the user didn't accept the warning already
    // if they didn't then we assume it's the first time they open the page and show them the warning
    if (!localStorage.getItem(storageKey))
      setVisibility(true);
  });

  // interval effect
  useEffect(() =>
  {
    if (process.env.NODE_ENV === 'test')
      return;

    const interval = setInterval(() =>
    {
      const length = 5;

      const next = index + 1;

      if (next > length || !visible)
      {
        clearInterval(interval);
      }
      else
      {
        tutorialRef.current.childNodes.item(next).scrollIntoView({ behavior: 'smooth' });

        setIndex(next);
      }
    }, 1500);

    return () => clearInterval(interval);
  });

  const dismiss = () =>
  {
    setVisibility(false);

    localStorage.setItem(storageKey, false);
  };

  return visible ?
    <div className={ styles.wrapper }>
      <div id={ 'kuruit-tutorial' } className={ styles.container } style={ { direction: locale.direction } }>

        <div ref={ tutorialRef }>

          <div className={ styles.item }>
            <div>{ translation('adults-only-title') }</div>
            <img src={ '/assets/adults-only.png' }/>
            <div>{ translation('adults-only') }</div>
          </div>

          <div className={ styles.item }>
            <div>{ translation('perfer-voice-chat-title') }</div>
            <img src={ '/assets/perfer-voice-chat.png' }/>
            <div>{ translation('perfer-voice-chat') }</div>
          </div>

          <div className={ styles.item }>
            <div>{ translation('pick-a-card-title') }</div>
            <img src={ '/assets/pick-a-card.png' }/>
            <div>{ translation('pick-a-card') }</div>
          </div>

          <div className={ styles.item }>
            <div>{ translation('write-a-card-title') }</div>
            <img src={ '/assets/write-a-card.png' }/>
            <div>{ translation('write-a-card') }</div>
          </div>

          <div className={ styles.item }>
            <div>{ translation('judge-a-card-title') }</div>
            <img src={ '/assets/judge-a-card.png' }/>
            <div>{ translation('judge-a-card') }</div>
          </div>

          <div className={ styles.item }>
            <div>{ translation('join-our-discord-title') }</div>
            <img src={ '/assets/join-our-discord.png' }/>
            <div>{ translation('join-our-discord') }</div>

            <div className={ styles.buttons }>
              <div onClick={ dismiss }>
                <CloseIcon/>
              </div>
              <a href={ 'https://herpproject.com/discord' }>
                <DiscordIcon/>
              </a>
            </div>

          </div>
        </div>
      
      </div>
    </div> : <div/>;
};

const styles = createStyle({
  wrapper: {
    zIndex: 99,

    display: 'flex',
    position: 'fixed',

    alignItems: 'center',
    justifyContent: 'center',

    userSelect: 'none',
    backgroundColor: opacity(colors.whiteBackground, '0.95'),

    textTransform: 'capitalize',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    width: '100vw',
    height: '100vh'
  },

  container: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',

    color: colors.blackText,
    
    width: 'calc(300px + 10vw)',
    height: '100%',

    margin: '0 5vw',
    overflow: 'auto',

    '> :nth-child(1)': {
      display: 'flex'
    },

    '::-webkit-scrollbar':
    {
      height: '6px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '6px',
      boxShadow: `inset 0 0 6px 6px ${colors.handScrollbar}`
    }
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    
    width: '300px',
    padding: '0 5vw',

    '> :nth-child(1)': {
      margin: '25px 0',
      fontSize: 'calc(12px + 0.15vw + 0.15vh)'
    },

    '> :nth-child(2)': {
      width: '210px',
      margin: '15px auto',
      filter: colors.theme === 'light' ? 'invert(1)' : undefined
    },

    '> :nth-child(3)': {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      fontSize: 'calc(12px + 0.15vw + 0.15vh)'
    }
  },

  buttons: {
    display: 'flex',

    '> *': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
  
      color: colors.blackText,
      
      border: `1px solid ${colors.blackText}`,
  
      '> svg': {
        width: '16px',
        height: '16px'
      },
  
      ':hover': {
        color: colors.whiteBackground,
        backgroundColor: colors.blackText
      },
  
      ':active': {
        transform: 'scale(0.95)'
      }
    },

    '> :nth-child(1)': {
      margin: '25px 0',
      padding: '10px 4vw'
    },

    '> :nth-child(2)': {
      margin: '25px',
      padding: '10px 2.5vw',
      borderRadius: '100vw'
    }
  }
});

export default Tutorial;