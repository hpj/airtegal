/* eslint-disable react/prop-types */

import React, { Component, PureComponent } from 'react';

import PropTypes from 'prop-types';

const defaultAnchor = { x: 0.5, y: 0.5 };
const defaultBorderColor = '#f00';
const defaultBorderStyle = 'solid';
const defaultBorderWidth = 1;

const optionalStyleProps = {
  borderColor: PropTypes.string,
  borderStyle: PropTypes.string,
  borderWidth: PropTypes.number,
  elementId: PropTypes.string,
  zIndex: PropTypes.number
};

export default class LineTo extends Component
{
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount()
  {
    this.fromAnchor = this.parseAnchor(this.props.fromAnchor);
    this.toAnchor = this.parseAnchor(this.props.toAnchor);
    this.delay = this.parseDelay(this.props.delay);
  }

  componentDidMount()
  {
    this.delay = this.parseDelay(this.props.delay);

    if (typeof this.delay !== 'undefined')
      this.deferUpdate(this.delay);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps)
  {
    if (nextProps.fromAnchor !== this.props.fromAnchor)
      this.fromAnchor = this.parseAnchor(this.props.fromAnchor);

    if (nextProps.toAnchor !== this.props.toAnchor)
      this.toAnchor = this.parseAnchor(this.props.toAnchor);

    this.delay = this.parseDelay(nextProps.delay);

    if (typeof this.delay !== 'undefined')
      this.deferUpdate(this.delay);
  }

  componentWillUnmount()
  {
    if (this.t)
    {
      clearTimeout(this.t);

      this.t = null;
    }
  }

  shouldComponentUpdate()
  {
    // Always update component if the parent component has been updated.
    // The reason for this is that we would not only like to update
    // this component when the props have changed, but also when
    // the position of our target elements has changed.
    // We could return true only if the positions of `from` and `to` have
    // changed, but that may be expensive and unnecessary.
    return true;
  }

  // Forced update after delay (MS)
  deferUpdate(delay)
  {
    if (this.t)
      clearTimeout(this.t);
    
    this.t = setTimeout(() => this.forceUpdate(), delay);
  }

  parseDelay(value)
  {
    if (typeof value === 'undefined')
      return value;
    else if (typeof value === 'boolean' && value)
      return 0;

    const delay = parseInt(value, 10);

    if (isNaN(delay) || !isFinite(delay))
      throw new Error(`LinkTo could not parse delay attribute "${value}"`);

    return delay;
  }

  parseAnchorPercent(value)
  {
    const percent = parseFloat(value) / 100;

    if (isNaN(percent) || !isFinite(percent))
      throw new Error(`LinkTo could not parse percent value "${value}"`);
    
    return percent;
  }

  parseAnchorText(value)
  {
    // Try to infer the relevant axis.
    switch (value)
    {
    case 'top':
      return { y: 0 };
    case 'left':
      return { x: 0 };
    case 'middle':
      return { y: 0.5 };
    case 'center':
      return { x: 0.5 };
    case 'bottom':
      return { y: 1 };
    case 'right':
      return { x: 1 };
    }

    return null;
  }

  parseAnchor(value)
  {
    if (!value)
      return defaultAnchor;

    const parts = value.split(' ');

    if (parts.length > 2)
      throw new Error('LinkTo anchor format is "<x> <y>"');

    const [ x, y ] = parts;

    return Object.assign({}, defaultAnchor,
      x ? this.parseAnchorText(x) || { x: this.parseAnchorPercent(x) } : {},
      y ? this.parseAnchorText(y) || { y: this.parseAnchorPercent(y) } : {}
    );
  }

  findElement(elementId)
  {
    return document.getElementById(elementId);
  }

  detect()
  {
    const { from, to, size, within = '' } = this.props;

    const a = this.findElement(from);
    const b = this.findElement(to);

    if (!a || !b)
      return false;

    const anchor0 = this.fromAnchor;
    const anchor1 = this.toAnchor;

    const box0 = a.getBoundingClientRect();
    const box1 = b.getBoundingClientRect();

    let offsetX = window.pageXOffset;
    let offsetY = window.pageYOffset;

    if (within)
    {
      const p = document.body.getElementsByClassName(within)[0];
      const boxp = p.getBoundingClientRect();

      offsetX -= boxp.left + (window.pageXOffset || document.documentElement.scrollLeft);
      offsetY -= boxp.top + (window.pageYOffset || document.documentElement.scrollTop);
    }

    const x0 = Math.round(box0.left + box1.width * anchor0.x + offsetX);
    const x1 = Math.round(box1.left + box1.width * anchor1.x + offsetX);

    const y0 = Math.round(box0.top + box1.height * anchor0.y + offsetY);
    const y1 = Math.round(box1.top + box1.height * anchor1.y + offsetY);

    if (x0 > x1)
    {
      return [ { x0, y0: y1, x1, y1 } ];
    }
    else
    {
      return [ { x0, y0, x1: 0, y1: y0 }, { x0: size.width, y0: y1, x1, y1 } ];
    }
  }

  render()
  {
    const points = this.detect();

    if (!points)
      return <div/>;
    
    return <div>
      {
        points.map((value, i) => <Line key={ i } { ...value } { ...this.props } />)
      }
    </div>;
  }
}

LineTo.propTypes = Object.assign({}, {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  within: PropTypes.string,
  fromAnchor: PropTypes.string,
  toAnchor: PropTypes.string,
  delay: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ])
}, optionalStyleProps);

export class Line extends PureComponent
{
  componentDidMount()
  {
    // Append rendered DOM element to the container the
    // offsets were calculated for
    this.within.appendChild(this.el);
  }

  componentWillUnmount()
  {
    this.within.removeChild(this.el);
  }

  findElement(className)
  {
    return document.getElementsByClassName(className)[0];
  }

  render()
  {
    const { x0, y0, x1, y1, within = '' } = this.props;

    this.within = within ? document.body.getElementsByClassName(within)[0] : document.body;

    const dy = y1 - y0;
    const dx = x1 - x0;

    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);

    const positionStyle = {
      position: 'absolute',
      top: `${y0}px`,
      left: `${x0}px`,
      width: `${length}px`,
      zIndex: Number.isFinite(this.props.zIndex)
        ? String(this.props.zIndex)
        : '1',
      transform: `rotate(${angle}deg)`,
      // Rotate around (x0, y0)
      transformOrigin: '0 0',
      margin: 0,
      padding: 0
    };

    const defaultStyle = {
      borderTopColor: this.props.borderColor || defaultBorderColor,
      borderTopStyle: this.props.borderStyle || defaultBorderStyle,
      borderTopWidth: this.props.borderWidth || defaultBorderWidth
    };

    const props = {
      className: this.props.className,
      style: Object.assign({}, defaultStyle, positionStyle)
    };

    // We need a wrapper element to prevent an exception when then
    // React component is removed. This is because we manually
    // move the rendered DOM element after creation.
    return (
      <div className="react-lineto-placeholder">
        <div
          ref={ (el) =>
          {
            this.el = el;
          } }
          { ...props }
        />
      </div>
    );
  }
}

Line.propTypes = Object.assign({}, {
  x0: PropTypes.number.isRequired,
  y0: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired,
  y1: PropTypes.number.isRequired
}, optionalStyleProps);