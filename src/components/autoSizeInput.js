import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import autoSize from 'autosize-input';

class AutoSizeInput extends React.Component
{
  constructor()
  {
    super();

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
      value = value * (60 * 1000);

    onUpdate?.((value !== undefined && !Number.isNaN(value)) ? value : '', this.resize);
  }
  
  onBlur(e)
  {
    const { type, minutes, onUpdate } = this.props;

    let value = e.target.value;

    if (type === 'text')
      value = e.target.value.replace(/\s+/g, ' ');
    else if (type === 'number')
      value = parseInt(value);
    
    if (type === 'number' && value > 0 && minutes)
      value = value * (60 * 1000);

    onUpdate?.((value !== undefined && !Number.isNaN(value)) ? value : '', this.resize, true);
  }

  render()
  {
    let { value } = this.props;

    const {
      required, type, minutes, min, max,
      id, master, className, style,
      placeholder, disabled, onSubmit
    } = this.props;

    // change value form ms to minutes
    if (type === 'number' && value > 0 && minutes)
    {
      value = value / (60 * 1000);
    }

    this.oldValue = value;

    return <input
      ref={ this.inputRef }

      disabled={ disabled }
      required={ required }
      type={ type }

      autoComplete={ 'off' }

      min={ min }
      max={ max }

      id={ id }
      master={ master }
      className={ className }
      style={ style }
      
      placeholder={ placeholder }
      value={ value }

      onKeyPress={ (e) =>
      {
        if (e.key === 'Enter')
          onSubmit?.();
      } }
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
  master: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.obj,
  
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.any,

  onUpdate: PropTypes.func,
  onSubmit: PropTypes.func
};

export default AutoSizeInput;
