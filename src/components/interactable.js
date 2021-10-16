import React from 'react';

import PropTypes from 'prop-types';

/**
* @typedef { Object } Props
* @property { React.HTMLAttributes<HTMLDivElement> } style
*
* @property { boolean } dragEnabled
* @property { boolean } verticalOnly
* @property { boolean } horizontalOnly
*
* @property { { pixels: number, every: number } } frame
*
* @property { { x: number, y: number } } initialPosition
* @property { { left: number, right: number, top: number, bottom: number } } boundaries
* @property { { x: number, y: number} } resistance
* @property { (delta: { x: number, y: number }) => number } triggers
* @property { { x: number, y: number, draggable: boolean }[] } snapPoints
*
* @property { ({ x: number, y: number }) => void } onMovement
* @property { (index: number) => void } onSnapStart
* @property { (index: number) => void } onSnapEnd
*
* @extends { React.Component<Props> }
*/
class Interactable extends React.Component
{
  /**
  * @param { Props } props
  */
  constructor(props)
  {
    super();

    this.state = {
      x: props.initialPosition?.x ?? 0,
      y: props.initialPosition?.y ?? 0
    };

    this.animating = false;
    
    this.lastSnapIndex = 0;
    
    this.isMouseDown = false;
    
    this.isBeingDragged = false;

    this.dragStart = {
      x: 0,
      y: 0
    };

    this.dragDiff = {
      x: 0,
      y: 0
    };

    this.lastPoint = {
      clientX: 0,
      clientY: 0,
      x: 0,
      y: 0
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDrag = this.onDrag.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }
  
  componentWillUnmount()
  {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
  
  /**
  * @param { React.MouseEvent<HTMLDivElement, MouseEvent> } e
  */
  onMouseDown(e)
  {
    if (e.button === 0)
    {
      this.isMouseDown = true;

      this.onDragStart({
        touches: [ {
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY
        } ]
      });
    }
  }

  /**
  * @param { MouseEvent } e
  */
  onMouseMove(e)
  {
    if (!this.isMouseDown)
      return;
      
    this.onDrag({
      touches: [ {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY
      } ]
    });
  }

  /**
  * @param { MouseEvent } e
  */
  onMouseUp(e)
  {
    if (e.button === 0)
    {
      if (this.isMouseDown)
        this.onDragEnd();
      
      this.isMouseDown = false;
    }
  }

  /**
  * @param { React.TouchEvent<HTMLDivElement } e
  */
  onDragStart(e)
  {
    const { clientX, clientY } =  e.touches[0];

    this.dragStart = {
      x: clientX,
      y: clientY
    };
  }

  /**
  * @param { React.TouchEvent<HTMLDivElement } e
  */
  onDrag(e)
  {
    const { resistance, verticalOnly, horizontalOnly } = this.props;

    const { left, right, top, bottom } = this.props.boundaries;

    const { clientX, clientY, pageX, pageY } =  e.touches[0];

    const dragEnabled = this.props.dragEnabled ?? true;

    if (dragEnabled && !this.isBeingDragged && !this.animating)
    {
      if (horizontalOnly && resistance?.x && this.lastPoint.clientX - this.dragStart.x >= resistance.x)
        this.isBeingDragged = true;
      else if (verticalOnly && resistance?.y && this.lastPoint.clientY - this.dragStart.y >= resistance.y)
        this.isBeingDragged = true;
      else if (!resistance?.x && !resistance?.y)
        this.isBeingDragged = true;

      this.dragDiff = {
        x: clientX - this.state.x,
        y: clientY - this.state.y
      };
    }

    const x = pageX - this.dragDiff.x;
    const y = pageY - this.dragDiff.y;

    this.lastPoint = {
      clientX,
      clientY,
      x: verticalOnly ? this.state.x : Math.max(Math.min(x, right ?? x), left ?? x),
      y: horizontalOnly ? this.state.y : Math.max(Math.min(y, bottom ?? y), top ?? y)
    };

    if (this.isBeingDragged)
    {
      this.setState(this.lastPoint, () => this.props.onMovement?.({ x: this.state.x, y: this.state.y }));
    }
  }

  onDragEnd()
  {
    const { verticalOnly, horizontalOnly, triggers, snapPoints } = this.props;
    
    if (!snapPoints?.length || !this.isBeingDragged)
      return;

    const distance = p =>
    {
      if (horizontalOnly)
        return p.x ?? 0;
      else if (verticalOnly)
        return p.y ?? 0;
      else
        return p.x ?? p.y ?? 0;
    };
    
    if (typeof triggers === 'function')
    {
      const index = triggers({
        x: this.lastPoint.clientX - this.dragStart.x,
        y: this.lastPoint.clientY - this.dragStart.y
      });

      // trigger a snap to the triggered point
      this.snapTo({ index: index ?? this.lastSnapIndex });
    }
    else
    {
      let closetDistance, closetIndex;

      // find the closest point to the last known drag location (using distance)
      Object.values(snapPoints).forEach((point, i) =>
      {
        if (point.draggable === false)
          return;
      
        const d = distance({
          x: Math.abs(Math.round(this.lastPoint.x) - point.x),
          y: Math.abs(Math.round(this.lastPoint.y) - point.y)
        });
  
        if (closetIndex === undefined || d < closetDistance)
        {
          closetIndex = i;
          closetDistance = d;
        }
      });

      // trigger a snap to the closest point
      this.snapTo({ index: closetIndex });
    }

    // reset state

    this.isMouseDown = false;
    
    this.isBeingDragged = false;

    this.dragStart = {
      x: 0,
      y: 0
    };

    this.dragDiff = {
      x: 0,
      y: 0
    };

    this.lastPoint = {
      clientX: 0,
      clientY: 0,
      x: 0,
      y: 0
    };
  }

  /**
  * @param { { index: number, point: { x: number, y: number }} } param0
  */
  snapTo({ index, point })
  {
    const { snapPoints } = this.props;

    if (this.props.verticalOnly && index === this.lastSnapIndex &&
      // eslint-disable-next-line security/detect-object-injection
      this.state.y === snapPoints[index].y)
      return;

    if (this.props.horizontalOnly && index === this.lastSnapIndex &&
      // eslint-disable-next-line security/detect-object-injection
      this.state.x === snapPoints[index].x)
      return;
    
    // eslint-disable-next-line security/detect-object-injection
    if ((!snapPoints?.[index] && !point) || this.animating)
      return;
    
    const { x, y } = this.state;

    const target = {
      // eslint-disable-next-line security/detect-object-injection
      x: Math.round(snapPoints[index]?.x ?? point?.x ?? x),
      // eslint-disable-next-line security/detect-object-injection
      y: Math.round(snapPoints[index]?.y ?? point?.y ?? y)
    };

    const frame = this.props.frame ?? { pixels: 2, every: 5 };
    
    // get the duration it would take to reach target point based on the frame properties
    const xDuration = Math.abs((target.x - x) * (frame.every / frame.pixels));
    const yDuration = Math.abs((target.y - y) * (frame.every / frame.pixels));
    
    // longest duration
    const duration = xDuration >= yDuration ? xDuration : yDuration;

    // get pixels per frame based on the longest duration
    const xPerFrame = (target.x - x) / (duration / frame.every);
    const yPerFrame = (target.y - y) / (duration / frame.every);

    const leftRight = target.x > x ? 'right' : 'left';
    const upDown = target.y > y ? 'down' : 'up';

    let counter = 0;

    const animate = () =>
    {
      const { x, y } = this.state;

      if (counter >= duration)
      {
        this.setState(target, () =>
        {
          this.animating = false;

          this.props.onMovement?.(target);

          this.props.onSnapEnd?.call(undefined, index);
        });

        return;
      }

      counter = counter + frame.every;

      this.setState({
        x: leftRight === 'right' ? Math.min(target.x, x + xPerFrame) : Math.max(target.x, x + xPerFrame),
        y: upDown === 'down' ? Math.min(target.y, y + yPerFrame) : Math.max(target.y, y + yPerFrame)
      }, () =>
      {
        setTimeout(animate, frame.every);
        
        this.props.onMovement?.({ x: this.state.x, y: this.state.y });
      });
    };

    this.animating = true;
    
    this.lastSnapIndex = index;

    this.props.onSnapStart?.(index);

    if (process.env.NODE_ENV === 'test')
      counter = duration * 2;

    animate();
  }

  render()
  {
    const { x, y } = this.state;

    const { children } = this.props;

    return <div
      style={ {
        position: 'absolute',

        ...this.props.style,

        left: x,
        top: y
      } }

      onMouseDown={ this.onMouseDown }
      onDragStart={ e => e.preventDefault() }

      onTouchStart={ this.onDragStart }
      onTouchMove={ this.onDrag }
      onTouchEnd={ this.onDragEnd }
    >
      { children }
    </div>;
  }
}

Interactable.propTypes = {
  style: PropTypes.object,
  
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node ]),
  
  dragEnabled: PropTypes.bool,

  verticalOnly: PropTypes.bool,
  horizontalOnly: PropTypes.bool,

  frame: PropTypes.object,

  initialPosition: PropTypes.object,
  boundaries: PropTypes.object,
  resistance: PropTypes.object,
  snapPoints: PropTypes.arrayOf(PropTypes.object),
  triggers: PropTypes.func,

  onMovement: PropTypes.func,
  onSnapStart: PropTypes.func,
  onSnapEnd: PropTypes.func
};

export default Interactable;