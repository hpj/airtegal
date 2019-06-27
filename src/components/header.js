import React from 'react';

import InlineSVG from 'svg-inline-react';

import GameLogo from '../../build/logo.svg';

import './header.css';

class Header extends React.Component
{
  render()
  {
    return (
      <div className='header container'>
        <InlineSVG className='header logo' src={GameLogo}></InlineSVG>
      </div>
    );
  }
}

export default Header;