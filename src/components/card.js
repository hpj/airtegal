
import React from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';

import gameLogo from '../../build/kbf-logo-ar.svg';

import './styles/card.css';

/** @param { { content: string, type: 'black' | 'white' } } param0
*/
const Card = ({
  content,
  type
}) =>
{
  return (
    <div className='card wrapper'>
      <div className='card container' type={type}>
        <div className='card content'>{content}</div>
        <InlineSVG className='card bottom' src={gameLogo}></InlineSVG>
      </div>
    </div>
  );
};

Card.propTypes = {
  content: PropTypes.string.isRequired,
  type: PropTypes.oneOf([ 'white', 'black' ]).isRequired
};

export default Card;