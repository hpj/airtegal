import React from 'react';

import Header from './header.js';

import './styles/homepage.css';

const Homepage = () =>
{
  return (
    <div>
      <Header></Header>

      <div className='what wrapper'>
        <div className='what container'>
          <div className='what title'>يعني ايه كروت بضان فشخ؟</div>

          <div className='what info'>
            اللعبه بسيطه. كل دور لاعب بيسال سؤال من كرت اسود, و باقي اللعيبه بيجاوبوا عليه باكثر كرت ابيض بيضحك.
          </div>

          <div className='what title'>ليه اللعبه عنصرية و بتشجع علي الكراهية؟</div>

          <div className='what info'>
            كل الكروت ال في اللعبه تم اقتراحها و التصويت عليها من المجتمع.
            <br/>
            هيرب بروجيكت غير مسئوله عن محتوي الكروت او عن اي ضرر يتم من خلال اختيارات اللاعبين داخل اللعبه.
            <br/>
            و في الاول و الاخر الهدف من اللعبه هو الضحك في ياريت منخدش حاجه جد.
          </div>
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

export default Homepage;