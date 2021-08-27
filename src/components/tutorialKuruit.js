import React, { useRef, useState, useEffect } from 'react';

import { createStyle } from 'flcss';

import DiscordIcon from 'mdi-react/DiscordIcon';

import getTheme from '../colors.js';

import { useTranslation } from '../i18n.js';

const colors = getTheme();

const Tutorial = () =>
{
  const { locale, translation } = useTranslation();

  /**
  * @type { React.MutableRefObject<HTMLDivElement> }
  */
  const containerRef = useRef();

  const [ index, setIndex ] = useState(0);
  const [ auto, setAuto ] = useState(true);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      let next = index + 1;

      if (next > 4)
        next = 0;

      if (!auto)
        clearInterval(interval);
      else
        scroll(next, true);
    }, 5000);

    return () => clearInterval(interval);
  });

  const scroll = (offset, auto) =>
  {
    offset = Math.max(0, Math.min(4, offset));

    containerRef.current?.scrollTo({
      behavior: 'smooth',
      left: locale.direction === 'rtl' ? -(offset * 300) : offset * 300
    });

    setAuto(auto);
    setIndex(offset);
  };

  return <div className={ styles.wrapper }>
    <div className={ styles.title }>{ translation('how-to-kuruit') }</div>

    <div ref={ containerRef } className={ styles.container } style={ { direction: locale.direction } }>
      <div className={ styles.item }>
        <img src={ '/assets/perfer-voice-chat.png' }/>
        <div>{ `1.\n${translation('perfer-voice-chat')}` }</div>
      </div>

      <div className={ styles.item }>
        <img src={ '/assets/pick-a-card.png' }/>
        <div>{ `2.\n${translation('pick-a-card')}` }</div>
      </div>
      
      <div className={ styles.item }>
        <img src={ '/assets/write-a-card.png' }/>
        <div>{ `3.\n${translation('write-a-card')}` }</div>
      </div>

      <div className={ styles.item }>
        <img src={ '/assets/judge-a-card.png' }/>
        <div>{ `4.\n${translation('judge-a-card')}` }</div>
      </div>

      <div className={ styles.item }>
        <img src={ '/assets/join-our-discord.png' }/>
        <div>{ `5.\n${translation('join-our-discord')}` }</div>
        <a className={ styles.button } href={ 'https://herpproject.com/discord' }>
          <DiscordIcon/>
        </a>
      </div>
    </div>

    <div className={ styles.navagation }>
      <div onClick={ () => scroll(index - 1, false) }>
        { `< ${translation('previous')}` }
      </div>

      <div onClick={ () => scroll(index + 1, false) }>
        { `${translation('next')} >` }
      </div>
    </div>
  </div>;
};

const styles = createStyle({
  wrapper: {
    width: '300px',
    margin: '0 15px'
  },

  container: {
    display: 'flex',
    direction: 'row',
    overflow: 'hidden'
  },

  title: {
    color: colors.whiteText,
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',
    margin: '25px 0'
  },

  item: {
    display: 'flex',
    flexDirection: 'column',

    '> img': {
      margin: '15px 0',
      filter: colors.theme === 'light' ? 'invert(1)' : undefined
    },
  
    '> div': {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      color: colors.blackText,
      fontSize: 'calc(8px + 0.5vw + 0.5vh)'
    }
  },

  button: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',

    width: '35%',
    color: colors.blackText,

    padding: '10px',
    border: `1px solid ${colors.blackText}`,
    borderRadius: '100vw',

    margin: '25px 0',

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

  navagation: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '5vh 0',

    '> *': {
      cursor: 'pointer',

      ':active': {
        transform: 'scale(0.95)'
      }
    }
  }
});

export default Tutorial;