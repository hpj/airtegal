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
* @property { { width: { percent: number, size }, height: { percent: number, size } } } dragArea
* @property { { pixels: number, every: number } } frame
*
* @property { { x: number, y: number } } initialPosition
* @property { { left: number, right: number, top: number, bottom: number } } boundaries
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
    
    this.dragDiff = { x: 0, y: 0 };
    this.lastPoint = { x: 0, y: 0 };

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
    const { x, y } =  this.state;

    const { dragArea } =  this.props;

    const { pageX, clientX, clientY } =  e.touches[0];

    const dragEnabled = this.props.dragEnabled ?? true;
    
    if (
      !dragEnabled || this.animating ||
      pageX > (dragArea?.width.size / 100) * dragArea?.width.percent
      // pageY > (dragArea?.height.size / 100) * dragArea?.height.percent
    )
      return;

    this.isBeingDragged = true;

    this.dragDiff = { x: clientX - x, y: clientY - y };
  }

  /**
  * @param { React.TouchEvent<HTMLDivElement } e
  */
  onDrag(e)
  {
    const { dragEnabled, initialPosition, verticalOnly, horizontalOnly } = this.props;
    
    if (!this.isBeingDragged)
      return;

    // handle dragEnabled being false while isBeingDragged
    if (!dragEnabled)
    {
      this.isBeingDragged = false;

      if (typeof this.lastSnapIndex === 'number')
        this.snapTo({ index: this.lastSnapIndex });
      else
        this.snapTo({ point: initialPosition });

      return;
    }

    const { left, right, top, bottom } = this.props.boundaries;
    
    const { pageX, pageY } =  e.touches[0];

    const x = pageX - this.dragDiff.x;
    const y = pageY - this.dragDiff.y;

    this.setState(this.lastPoint = {
      x: verticalOnly ? this.state.x : Math.max(Math.min(x, right ?? x), left ?? x),
      y: horizontalOnly ? this.state.y : Math.max(Math.min(y, bottom ?? y), top ?? y)
    }, () => this.props.onMovement?.({ x: this.state.x, y: this.state.y }));
  }

  onDragEnd()
  {
    const { verticalOnly, horizontalOnly, snapPoints } = this.props;
    
    if (!snapPoints?.length || !this.isBeingDragged || !this.lastPoint)
      return;

    this.isBeingDragged = false;

    const values = Object.values(snapPoints);

    const distance = (p) =>
    {
      if (horizontalOnly)
        return p.x ?? 0;
      if (verticalOnly)
        return p.y ?? 0;
      else
        return p.x ?? 0 + p.y ?? 0;
    };

    const r = {
      // x: Math.round(this.lastPoint.x + this.dragDiff.x),
      // y: Math.round(this.lastPoint.y + this.dragDiff.y)

      x: Math.round(this.lastPoint.x),
      y: Math.round(this.lastPoint.y)
    };

    let closetDistance, closetIndex;

    // find the closest point to the last known drag location (using distance)
    values.forEach((point, i) =>
    {
      if (point.draggable === false)
        return;
      
      const d = distance({
        x: Math.abs(r.x - point.x),
        y: Math.abs(r.y - point.y)
      });

      if (closetIndex === undefined || d < closetDistance)
      {
        closetIndex = i;
        closetDistance = d;
      }
    });

    // trigger aa snap to the closest point
    this.snapTo({ index: closetIndex });
  }

  /**
  * @param { { index: number, point: { x: number, y: number }} } param0
  */
  snapTo({ index, point })
  {
    const { snapPoints } = this.props;
    
    // eslint-disable-next-line security/detect-object-injection
    if ((!snapPoints?.[index] && !point) || this.animating)
      return;
    
    const { x, y } = this.state;

    const target = {
      // eslint-disable-next-line security/detect-object-injection
      x: Math.round(snapPoints[index].x ?? point?.x ?? x),
      // eslint-disable-next-line security/detect-object-injection
      y: Math.round(snapPoints[index].y ?? point?.y ?? y)
    };

    const frame = this.props.frame ?? { pixels: 2, every: 5 };
    
    // get the duration it would take to reach target point based on the frame properties
    const xDuration = Math.abs((target.x - x) * (frame.every / frame.pixels));
    const yDuration = Math.abs((target.y - y) * (frame.every / frame.pixels));
    
    // longest duration
    const duration = (xDuration >= yDuration) ? xDuration : yDuration;

    // get pixels per frame based on the longest duration
    const xPerFrame = (target.x - x) / (duration / frame.every);
    const yPerFrame = (target.y - y) / (duration / frame.every);

    const leftRight = (target.x > x) ? 'right' : 'left';
    const upDown = (target.y > y) ? 'down' : 'up';

    let counter = 0;

    const animate = () =>
    {
      const { x, y } = this.state;

      if (counter >= duration)
      {
        this.setState(target, () =>
        {
          this.lastPoint = this.animating = false;

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
      onDragStart={ (e) => e.preventDefault() }

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

  dragArea: PropTypes.object,
  frame: PropTypes.object,

  initialPosition: PropTypes.object,
  boundaries: PropTypes.object,
  snapPoints: PropTypes.arrayOf(PropTypes.object),

  onMovement: PropTypes.func,
  onSnapStart: PropTypes.func,
  onSnapEnd: PropTypes.func
};

export default Interactable;