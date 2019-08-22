import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import PatreonIcon from 'mdi-react/PatreonIcon';
import InlineSVG from 'svg-inline-react';

import { API_URI } from '../index.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

import hpjLogo from '../../build/hpj-logo-ar.svg';

import Header from '../components/header.js';

const Homepage = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'Kuruit Bedan Fash5';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div>
      <Header></Header>

      <div className={qaStyles.wrapper}>
        <div className={qaStyles.container}>
          <p className={qaStyles.question}>
            كروت بضان فشخ ايه؟
          </p>

          <p className={qaStyles.answer}>
            اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود وباقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك في ايدهم.
          </p>

          <p className={qaStyles.question}>
            ويبقي مين هيرب بروجيكت دي؟
          </p>

          <p className={qaStyles.answer}>
            هيرب بروجكت هي شركة سوفتيور وترفية وتعليم مصرية بدات في 2015 بنطور منتجات ل السوق الغربي اغلب الوقت.
            <br/>
            بس اللعبة دي هي اول محاولة منا لدخول السوق المصري بهدف رفع مستوي حجات كثير في مصر من تحت الارض و هيبقي لنا حملات كثير في مصر الفترة الجيه.
          </p>

          <p className={qaStyles.question}>
            بس اللعبه بتشجع علي العنصرية والكراهية والاهانة؟
          </p>

          <p className={qaStyles.answer}>
            كل الكروت ال في اللعبه تم اقتراحها والتصويت عليها من المجتمع.
            <br/>
            لحماية حرية التعبير والرائ بموجب المادة رقم 19 من الإعلان العالمي لحقوق الإنسان
            ولحماية الحقوق الفكرية لصانعي الكروت هيرب بروجكت لن تتدخل في عمليه الاقتراح والتصويت
            لمعلومات اكثر ممكن تقرأ سياسة الخصوصية والشروط والاحكام.
            <br/>
            يعني بختصار ده مجتمعك و دي حقيقته من غير صفافير وحيطان اسمنت
            و لو انت شايف دي مشكله في انت بتشتكي ل الناس الغلط.
          </p>
        </div>
      </div>
    
      <div className={playStyles.wrapper}>
        <div className={playStyles.container}>
          {
            (API_URI) ?
              <Link className={playStyles.title} to='/play'>العب</Link> :
              <p className={playStyles.title}>السيرفر خارج الخدمة</p>
          }
        </div>
      </div>

      <div className={footerStyles.wrapper}>
        <div className={footerStyles.container}>
          <a className={footerStyles.hpj} href='https://herpproject.com'>
            <InlineSVG src={hpjLogo}></InlineSVG>
          </a>
          <a className={footerStyles.patreon} href='https://www.patreon.com/hpj'>
            <PatreonIcon/>
            BECOME A PATRON
          </a>
          <div className={footerStyles.sitemap}>
            <Link className={footerStyles.use} to='/terms'>الشروط والاحكام</Link>
            _
            <Link className={footerStyles.privacy} to='/privacy'>سياسة الخصوصية</Link>
          </div>
          <p className={footerStyles.copyright}>
            يتوفر هذا الموقع واللعبة تحت
            حقوق الطبع والنشر 2019-2020 ل هيرب بروجيكت.
          </p>
        </div>
      </div>
    </div>
  );
};

const qaStyles = createStyle({
  wrapper: {
    backgroundColor: colors.whiteBackground
  },

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

    '+ p': {
      margin: '20px 0 3px 0'
    }
  }
});

const playStyles = createStyle({
  wrapper: {
    background: 'linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%)'
  },

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

    padding: '5% 12%',

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

const footerStyles = createStyle({
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