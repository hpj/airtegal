
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InlineSVG from 'svg-inline-react';
import gameLogo from '../../build/kbf-logo-ar.svg';

import './card.css';

/**
* @augments { Component<{ content: string, type: "white" | "black" }> }
*/
class Card extends Component
{
  render()
  {
    return (
      <div className='card wrapper'>
        <div className='card container' type={this.props.type}>
          <div className='card content'>{this.props.content}.</div>
          <InlineSVG className='card bottom' src={gameLogo}></InlineSVG>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  content: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

export default Card;