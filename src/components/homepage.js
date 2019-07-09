import React from 'react';

import Header from './header.js';

import { createStyle } from '../flcss.js';

import {
  whiteBackground, blackText
} from '../theme.js';

const Homepage = () =>
{
  return (
    <div className={styles.app}>
      <Header></Header>

      <div className={styles.wrapper}>
        <div className={styles.container}>
          <p className={styles.title}>يعني ايه كروت بضان فشخ؟</p>

          <p className={styles.info}>
            اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود, و باقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك.
          </p>

          <p className={styles.title}>ليه اللعبه عنصرية و بتشجع علي الكراهية؟</p>

          <p className={styles.info}>
            كل الكروت ال في اللعبه تم اقتراحها و التصويت عليها من المجتمع.
            <br/>
            هيرب بروجيكت غير مسئوله عن محتوي الكروت او عن اي ضرر يتم من خلال اختيارات اللاعبين داخل اللعبه.
            <br/>
            و في الاول و الاخر الهدف من اللعبه هو الضحك في ياريت منخدش حاجه جد.
          </p>
        </div>
      </div>
    
      <div className='play wrapper'>
        <div className='play container'>
          {/* TODO the green space wit the play button */}
        </div>
      </div>

    </div>
  );
};

const styles = createStyle({
  app: {
    margin: 0,

    direction: 'rtl',
    fontFamily: '"Raleway", "Cairo", sans-serif',
    fontWeight: 900
  },

  wrapper: { backgroundColor: whiteBackground },

  container: {
    maxWidth: '850px',

    color: blackText,
  
    padding: '5vh 5vw',
    margin: 'auto'
  },

  title: {
    fontSize: 'calc(9px + 0.65vw + 0.65vh)',
    margin: 0,

  },

  info: {
    fontSize: 'calc(8px + 0.45vw + 0.45vh)',
    margin: 0,

    '+ p': { margin: '35px 0 0 0' }
  }
});

export default Homepage;