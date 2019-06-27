import React from 'react';

import InlineSVG from 'svg-inline-react';

import gameLogo from '../../build/kbf-logo-ar.svg';
import hpjLogo from '../../build/hpj-logo-ar-horizontal.svg';

import './header.css';

class Header extends React.Component
{
  render()
  {
    return (
      <div className='header container'>
        <InlineSVG className='header hpj' src={hpjLogo}></InlineSVG>
        <InlineSVG className='header kbf' src={gameLogo}></InlineSVG>
      </div>
    );
  }
}

export default Header;