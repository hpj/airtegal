import React from 'react';

import PatreonIcon from 'mdi-react/PatreonIcon';
import InlineSVG from 'svg-inline-react';

import Header from './header.js';

import { createStyle } from '../flcss.js';

import hpjLogoHorizontal from '../../build/hpj-logo-ar-horizontal.svg';

import {
  whiteBackground, blackText, whiteText,
  blackBackground, greyText, patreonBrand,
  hpjBrand, accentColor
} from '../theme.js';

const Homepage = () =>
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
            اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود, و باقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك في ايدهم.
          </p>

          <p className={qaStyles.question}>
            ليه اللعبه عنصرية و بتشجع علي الكراهية؟
          </p>

          <p className={qaStyles.answer}>
            كل الكروت ال في اللعبه تم اقتراحها و التصويت عليها من المجتمع.
            <br/>
            لحماية القانون الدولي لحرية التعبير و الرأي تحت المادة 19 من العهد الدولي و لحماية الحقوق الفكرية لصانعي الكروت هيرب بروجكت لن تتدخل في عمليه الاقتراح و التصويت.
            <br/>
            لمعلومات اكثر ممكن تقرأ سياسة الخصوصية و الشروط و الاحكام.
          </p>
        </div>
      </div>
    
      <div className={pStyles.wrapper}>
        <div className={pStyles.container}>
          <p className={pStyles.title}>
            العب الان
          </p>
        </div>
      </div>

      <div className={bStyles.wrapper}>
        <div className={bStyles.container}>
          <InlineSVG className={bStyles.hpj} src={hpjLogoHorizontal}></InlineSVG>
          <div className={bStyles.patreon}>
            <PatreonIcon/>
            BECOME A PATRON
          </div>
          <div className={bStyles.sitemap}>
            <div className={bStyles.use}>الشروط و الاحكام</div>
            -
            <div className={bStyles.privacy}>سياسة الخصوصية</div>
          </div>
          <p className={bStyles.copyright}>
            تتوفر
            Cards Against Humanity
            تحت رخصة
            Creative Commons BY-NC-SA 2.0
            هذا يعني انة يمكننا استخدام اللعبة واعادة خلطها و مشاركتها مجاناً
            لكن لا يمكن لنا تحقيق اي ربح مادي منها
            او استخدام اسمها دون اذن.
          </p>
        </div>
      </div>

    </div>
  );
};

const qaStyles = createStyle({
  wrapper: { backgroundColor: whiteBackground },

  container: {
    maxWidth: '850px',

    color: blackText,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  question: {
    fontSize: 'calc(9px + 0.55vw + 0.55vh)',
    margin: '0 0 3px 0'
  },

  answer: {
    fontWeight: 400,

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
    color: whiteText,
    cursor: 'pointer',
    
    border: '3px solid',
    borderColor: whiteText,

    userSelect: 'none',
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
  wrapper: { backgroundColor: blackBackground },

  container: {
    display: 'grid',

    gridTemplateColumns: '50% 50%',
    gridTemplateAreas: '"hpj patreon" "sitemap sitemap" "copyright copyright"',
  
    gridRowGap: '10px',
    
    maxWidth: '850px',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  hpj: {
    gridArea: 'hpj',
    display: 'flex',

    cursor: 'pointer',

    minWidth: '92px',
    maxWidth: '132px',
    width: '35%',
    height: '100%',

    '> svg': {
      width: '100%',
      height: '100%',

      fill: whiteText
    },

    ':hover > svg': { fill: hpjBrand }
  },

  patreon: {
    gridArea: 'patreon',
    display: 'flex',
    alignItems: 'center',
    
    userSelect: 'none',
    cursor: 'pointer',

    direction: 'ltr',
    color: whiteText,

    ':hover': { color: patreonBrand },

    '> svg': { padding: '0 5px 0 0' }
  },

  sitemap: {
    gridArea: 'sitemap',
    display: 'flex',

    userSelect: 'none',
    color: whiteText,
  },

  privacy: {
    cursor: 'pointer',
    padding: '0 5px',

    ':hover': { color: accentColor }
  },

  use: { extend: 'privacy' },

  copyright: {
    gridArea: 'copyright',
    color: greyText,

    margin: 0
  }
});

export default Homepage;