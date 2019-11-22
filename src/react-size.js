import React, { createRef, forwardRef } from 'react';

import { ResizeObserver } from 'resize-observer';

export default (WrappedComponent, config) =>
{
  config = config || {};

  class WithSize extends React.Component
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
      // eslint-disable-next-line react/prop-types
      const { forwardedRef, ...rest } = this.props;

      return (
        <div style={ { width: '100%', height: '100%' } } ref={ this.ref }>
          <WrappedComponent ref={ forwardedRef } size={ this.state.size } { ...rest }/>
        </div>
      );
    }
  }

  return forwardRef((props, ref) =>
  {
    return <WithSize { ...props } forwardedRef={ ref }/>;
  });
};