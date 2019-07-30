import React, { createRef } from 'react';

import { ResizeObserver } from 'resize-observer';

export default (WrappedComponent, config) =>
{
  config = config || {};

  return class extends React.Component
  {
    constructor()
    {
      super();

      this.ref = createRef();
      this.ro = new ResizeObserver(this.updateSize.bind(this));

      this.state = {
        size: {}
      };
    }

    componentDidMount()
    {
      this.ro.observe(this.ref.current);
    }

    updateSize()
    {
      const rect = this.ref.current.getBoundingClientRect();

      if (config.keepSize)
      {
        if (rect.width <= 0)
          rect.width = this.state.size.width;

        if (rect.height <= 0)
          rect.height = this.state.size.height;
      }

      this.setState({ size: rect });
    }

    render()
    {
      return (
        <div ref={this.ref} style={{ width: '100%', height: '100%' }}>
          <WrappedComponent size={this.state.size} { ...this.props }/>
        </div>
      );
    }
  };
};