import React from 'react';

import InlineSVG from 'svg-inline-react';

import Header from './header.js';

import { createStyle } from '../flcss.js';

import hpjLogo from '../../build/hpj-logo-ar-horizontal.svg';

import {
  whiteBackground, blackText, whiteText, blackBackground, greyText
} from '../theme.js';

const Homepage = () =>
{
  return (
    <div className={styles.app}>
      <Header></Header>

      <div className={qaStyles.wrapper}>
        <div className={qaStyles.container}>
          <p className={qaStyles.question}>
            يعني ايه كروت بضان فشخ؟
          </p>

          <p className={qaStyles.answer}>
            اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود, و باقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك.
          </p>

          <p className={qaStyles.question}>
            ليه اللعبه عنصرية و بتشجع علي الكراهية؟
          </p>

          <p className={qaStyles.answer}>
            كل الكروت ال في اللعبه تم اقتراحها و التصويت عليها من المجتمع.
            <br/>
            هيرب بروجيكت غير مسئوله عن محتوي الكروت او عن اي ضرر يتم من خلال اختيارات اللاعبين داخل اللعبه.
            <br/>
            و في الاول و الاخر الهدف من اللعبه هو الضحك في ياريت منخدش حاجه جد.
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
          <InlineSVG className={bStyles.hpj} src={hpjLogo}></InlineSVG>
          <p className={bStyles.copyright}>
            تتوفر
            {'"كروت ضد الانسانية"'}
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

const styles = createStyle({ app: {
  margin: 0,

  direction: 'rtl',
  fontFamily: '"Raleway", "Cairo", sans-serif',
  fontWeight: 900
}});

const qaStyles = createStyle({
  wrapper: { backgroundColor: whiteBackground },

  container: {
    maxWidth: '850px',

    color: blackText,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  question: {
    fontSize: 'calc(9px + 0.65vw + 0.65vh)',
    margin: 0,

  },

  answer: {
    fontSize: 'calc(8px + 0.45vw + 0.45vh)',
    margin: 0,

    '+ p': { margin: '35px 0 0 0' }
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

    fontSize: 'calc(12px + 0.65vw + 0.65vh)',
    fontWeight: '800',

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

    gridTemplateColumns: '1fr auto',
    gridTemplateAreas: '"hpj copyright"',
  
    gridColumnGap: '15px',
    
    maxWidth: '850px',
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  icon: {
    fill: whiteText,

    minWidth: '130px',
    maxWidth: '320px',
    width: '55%'
  },

  hpj: {
    gridArea: 'hpj',

    display: 'flex',
  
    width: 'min-content',

    '> svg': {
      extend: 'icon',
      cursor: 'pointer'
    },

    '> svg:hover': { fill: 'red' }
  },

  copyright: {
    gridArea: 'copyright',
    color: greyText
  }
});

export default Homepage;