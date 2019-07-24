import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// import io from 'socket.io-client';

import PatreonIcon from 'mdi-react/PatreonIcon';
import InlineSVG from 'svg-inline-react';

// import { API_URI } from '../index.js';

import Header from './header.js';

import { createStyle } from '../flcss.js';

import hpjLogo from '../../build/hpj-logo-ar.svg';

import * as colors from '../colors.js';

const Homepage = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';
    
    window.scrollTo(0, 0);

    // const socket = io('API_URI');
  }, [ window.location ]);

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
          {
            (process.env.NODE_ENV === 'production') ? <p className={pStyles.title}>!قريباً</p> : <Link className={pStyles.title} to='/play'>ابدا</Link>
          }
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
            <Link className={bStyles.use} to='/terms'>الشروط والاحكام</Link>
            _
            <Link className={bStyles.privacy} to='/privacy'>سياسة الخصوصية</Link>
          </div>
          <p className={bStyles.copyright}>
            تتوفر كروت
            Cards Against Humanity
            تحت رخصة
            Creative Commons BY-NC-SA 2.0
            هذا يعني انة يمكننا استخدام الكروت والتعديل عليها ومشاركتها مجاناً
            لكن لا يمكن لنا تحقيق اي ربح مادي منها
            او استخدام اسمها ترويجياُ دون اذن.
            <br/>
            لكن يتوفر باقي الموقع واللعبة تحت
            حقوق الطبع والنشر 2019-2020 ل هيرب بروجيكت.
          </p>
        </div>
      </div>
    </div>
  );
};

const qaStyles = createStyle({
  wrapper: { backgroundColor: colors.whiteBackground },

  container: {
    maxWidth: '850px',

    color: colors.blackText,

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
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

    pointerEvents: 'none',
    userSelect: 'none',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontSize: 'calc(12px + 0.65vw + 0.65vh)',

    textDecoration: 'none',

    padding: '5% 8%',

    '[href]': {
      pointerEvents: 'all'
    },

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

    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    fontWeight: 700,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',

    cursor: 'pointer',

    minWidth: '100px',
    maxWidth: '132px',
    width: '35%',
    height: '100%',
    
    margin: '0 0 0 auto',

    '> i > svg': {
      width: '100%',
      height: '100%',

      fill: colors.whiteText
    },

    ':hover > i > svg': { fill: colors.accentColor }
  },

  patreon: {
    gridArea: 'patreon',

    display: 'flex',
    alignItems: 'center',
    
    color: colors.whiteText,
    width: 'fit-content',
    
    userSelect: 'none',
    cursor: 'pointer',
    
    direction: 'ltr',
    textDecoration: 'none',

    margin: '0 auto 0 0',

    ':hover': { color: colors.accentColor },

    '> svg': { padding: '0 5px 0 0' }
  },

  sitemap: {
    gridArea: 'sitemap',
    display: 'flex',

    margin: '0 0 0 auto',

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