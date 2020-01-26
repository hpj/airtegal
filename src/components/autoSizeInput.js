import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import autoSize from 'autosize-input';

class AutoSizeInput extends React.Component
{
  constructor()
  {
    super();

    // bind functions that are use as callbacks

    this.resize = this.resize.bind(this);

    this.inputRef = createRef();

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  componentDidMount()
  {
    this.resize();

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.resize);
  }

  resize()
  {
    autoSize(this.inputRef.current);
  }

  onChange(e)
  {
    const { type, minutes, maxLength, onUpdate } = this.props;

    let value = e.target.value;
    
    if (type === 'text')
      value = e.target.value.replace(/\s+/g, ' ');
    else if (type === 'number')
      value = parseInt(value);

    // force max length
    if (value && value.toString().length > maxLength)
    {
      this.inputRef.current.value = this.oldValue;

      requestAnimationFrame(this.resize);

      return;
    }

    if (type === 'number' && value > 0 && minutes)
    {
      value = value * (60 * 1000);
    }

    if (onUpdate)
      onUpdate(value || '', this.resize);
  }
  
  onBlur(e)
  {
    const { type, minutes, preference, onUpdate } = this.props;

    let value = e.target.value;

    if (type === 'text')
      value = e.target.value.replace(/\s+/g, ' ');
    else if (type === 'number')
      value = parseInt(value);
    
    if (type === 'number' && value > 0 && minutes)
    {
      value = value * (60 * 1000);
    }

    if (onUpdate)
      onUpdate(value || '', this.resize);

    if (preference)
      localStorage.setItem(preference, value);
  }

  render()
  {
    let { value } = this.props;

    const {
      required, type, minutes, min, max,
      className, id, placeholder
    } = this.props;

    // change value form ms to minutes
    if (type === 'number' && value > 0 && minutes)
    {
      value = value / (60 * 1000);
    }

    this.oldValue = value;

    return <input
      ref={ this.inputRef }

      required={ required }
      type={ type }

      min={ min }
      max={ max }

      id={ id }
      className={ className }

      placeholder={ placeholder }
      value={ value }

      onChange={ this.onChange }
      onBlur={ this.onBlur }
    />;
  }
}

AutoSizeInput.propTypes = {
  required: PropTypes.bool,
  type: PropTypes.oneOf([ 'text', 'number' ]).isRequired,
  minutes: PropTypes.bool,

  min: PropTypes.string,
  max: PropTypes.string,
  maxLength: PropTypes.number,

  id: PropTypes.string,
  className: PropTypes.string,

  placeholder: PropTypes.string,
  value: PropTypes.any,

  preference: PropTypes.string,
  onUpdate: PropTypes.func
};

export default AutoSizeInput;
