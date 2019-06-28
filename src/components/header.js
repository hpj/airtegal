import React from 'react';

import InlineSVG from 'svg-inline-react';
import Card from './card.js';

import gameLogo from '../../build/kbf-logo-ar.svg';
import hpjLogo from '../../build/hpj-logo-ar-horizontal.svg';

import cards from '../../cards.json';

import './header.css';

class Header extends React.Component
{
  render()
  {
    return (
      <div className='header wrapper'>
        <div className='header container'>
          <InlineSVG className='header hpj' src={hpjLogo}></InlineSVG>
          <InlineSVG className='header kbf' src={gameLogo}></InlineSVG>

          <div className="header cards">
            <Card type="black" content={cards.black}></Card>
            <Card type="white" content={cards.white}></Card>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;