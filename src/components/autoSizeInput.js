import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import autoSize from 'autosize-input';

const inputRef = createRef();

class AutoSizeInput extends React.Component
{
  constructor()
  {
    super();

    // bind functions that are use as callbacks

    this.resize = this.resize.bind(this);

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
    autoSize(inputRef.current);
  }

  onChange(e)
  {
    const { onUpdate } = this.props;

    const value = e.target.value.replace(/\s+/g, ' ');

    if (onUpdate)
      onUpdate(value, this.resize);
  }
  
  onBlur(e)
  {
    const { onUpdate, preference } = this.props;

    const value = e.target.value.replace(/\s+/g, ' ').trim();

    if (onUpdate)
      onUpdate(value, this.resize);

    if (preference)
      localStorage.setItem(preference, value);
  }

  render()
  {
    const {
      required, type, maxLength,
      className, placeholder, value
    } = this.props;

    return <input
      ref={ inputRef }
      required={ required }
      type={ type }
      maxLength={ maxLength }
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
  type: PropTypes.oneOf([ 'text', 'range', 'number' ]),
  maxLength: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  preference: PropTypes.string,
  onUpdate: PropTypes.func
};

export default AutoSizeInput;
