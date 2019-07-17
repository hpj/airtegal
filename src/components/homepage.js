import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import jsonp from 'jsonp';
// import io from 'socket.io-client';

import PatreonIcon from 'mdi-react/PatreonIcon';
import InlineSVG from 'svg-inline-react';

import Placeholder from './placeholder.js';
import Header from './header.js';

import { createStyle } from '../flcss.js';

import hpjLogo from '../../build/hpj-logo-ar.svg';

import * as colors from '../colors.js';

const Homepage = () =>
{
  const [ country, setCountry ] = useState('');
  const [ error, setError ] = useState('');
  
  // on url change
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';
    
    window.scrollTo(0, 0);

    // const socket = io('https://localhost:3000/');

    jsonp('https://geoip-db.com/jsonp', { name: 'callback' }, (err, response) =>
    {
      if (err)
      {
        setError(err.message);
        
        return;
      }
  
      setCountry(response.country_name);
    });
  }, [ window.location ]);

  if (country && country === 'Egypt')
  {
    return (
      <div>
        <Header></Header>
  
        <div className={qaStyles.wrapper}>
          <div className={qaStyles.container}>
            <p className={qaStyles.question}>
              يعني ايه كروت بضان فشخ؟
            </p>
  
            <p className={qaStyles.answer}>
              اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود وباقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك في ايدهم.
            </p>
  
            <p className={qaStyles.question}>
              ليه اللعبه عنصرية و بتشجع علي الكراهية؟
            </p>
  
            <p className={qaStyles.answer}>
              كل الكروت ال في اللعبه تم اقتراحها والتصويت عليها من المجتمع.
              <br/>
              لحماية حرية التعبير والرائ بموجب المادة رقم 19 من الإعلان العالمي لحقوق الإنسان
              ولحماية الحقوق الفكرية لصانعي الكروت هيرب بروجكت لن تتدخل في عمليه الاقتراح والتصويت.
              <br/>
              لمعلومات اكثر ممكن تقرأ سياسة الخصوصية والشروط والاحكام.
            </p>
          </div>
        </div>
      
        <div className={pStyles.wrapper}>
          <div className={pStyles.container}>
            <p className={pStyles.title}>
              !قريباً
            </p>
          </div>
        </div>
  
        <div className={bStyles.wrapper}>
          <div className={bStyles.container}>
            <a className={bStyles.hpj} href='https://herpproject.com'>
              <InlineSVG src={hpjLogo}></InlineSVG>
            </a>
            <a className={bStyles.patreon} href='https://www.patreon.com/hpj'>
              <PatreonIcon/>
              BECOME A PATRON
            </a>
            <div className={bStyles.sitemap}>
              <Link className={bStyles.use} to='/tac/'>الشروط والاحكام</Link>
              _
              <Link className={bStyles.privacy} to='/pt/'>سياسة الخصوصية</Link>
            </div>
            <p className={bStyles.copyright}>
              تتوفر
              Cards Against Humanity
              تحت رخصة
              Creative Commons BY-NC-SA 2.0
              هذا يعني انة يمكننا استخدام اللعبة واعادة خلطها ومشاركتها مجاناً
              لكن لا يمكن لنا تحقيق اي ربح مادي منها
              او استخدام اسمها دون اذن.
            </p>
          </div>
        </div>
      </div>
    );
  }
  else if (country && country !== 'Egypt')
  {
    return (
      <Placeholder type='not-available'/>
    );
  }
  else if (error)
  {
    return (
      <Placeholder type='error' content={error}/>
    );
  }
  else
  {
    return (
      <Placeholder type='loading'/>
    );
  }
};

const qaStyles = createStyle({
  wrapper: { backgroundColor: colors.whiteBackground },

  container: {
    maxWidth: '850px',

    color: colors.blackText,

    fontFamily: '"Cairo", sans-serif',
    direction: 'rtl',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  question: {
    fontWeight: 700,

    margin: '0 0 3px 0'
  },

  answer: {
    margin: 0,

    '+ p': { margin: '20px 0 3px 0' }
  }
});

const pStyles = createStyle({
  wrapper: { background: 'linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%)' },

  container: {
    display: 'flex',
    justifyContent: 'center',
    
    maxWidth: '850px',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  title: {
    color: colors.whiteText,
    cursor: 'pointer',
    
    border: '3px solid',
    borderColor: colors.whiteText,

    userSelect: 'none',
    pointerEvents: 'none',

    fontWeight: 700,
    fontFamily: '"Cairo", sans-serif',
    fontSize: 'calc(12px + 0.65vw + 0.65vh)',

    padding: '5% 8%',

    ':hover': {
      background: 'linear-gradient(to right, #009fff, #ec2f4b)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',

      borderImage: 'linear-gradient(to right, #009fff, #ec2f4b)',
      borderImageSlice: 1
    }
  }
});

const bStyles = createStyle({
  wrapper: { backgroundColor: colors.blackBackground },

  container: {
    display: 'grid',

    gridTemplateColumns: '50% 50%',
    gridTemplateAreas: '"patreon hpj" "sitemap sitemap" "copyright copyright"',
  
    gridRowGap: '10px',
    
    maxWidth: '850px',

    fontFamily: '"Raleway", "Cairo", sans-serif',
    fontWeight: 700,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',

    justifySelf: 'end',
    cursor: 'pointer',

    minWidth: '100px',
    maxWidth: '132px',
    width: '35%',
    height: '100%',

    '> i > svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    },

    ':hover > i > svg': { fill: colors.accentColor }
  },

  patreon: {
    gridArea: 'patreon',
    justifySelf: 'self-start',

    display: 'flex',
    alignItems: 'center',
    
    width: 'fit-content',
    
    userSelect: 'none',
    cursor: 'pointer',
    
    direction: 'ltr',
    textDecoration: 'none',
    color: colors.whiteText,

    ':hover': { color: colors.accentColor },

    '> svg': { padding: '0 5px 0 0' }
  },

  sitemap: {
    gridArea: 'sitemap',
    display: 'flex',

    justifySelf: 'end',

    userSelect: 'none',
    color: colors.whiteText
  },

  privacy: {
    cursor: 'pointer',
    padding: '0 5px',

    color: colors.whiteText,
    textDecoration: 'none',

    ':hover': { color: colors.accentColor }
  },

  use: { extend: 'privacy' },

  copyright: {
    gridArea: 'copyright',
    
    color: colors.greyText,
    direction: 'rtl',

    margin: 0
  }
});

export default Homepage;