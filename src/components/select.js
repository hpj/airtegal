import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import DownIcon from 'mdi-react/ChevronDownIcon';

import getTheme from '../colors.js';

const colors = getTheme();

// const inputRef = React.createRef();

class Select extends React.Component
{
  constructor({ options, defaultIndex })
  {
    super();

    this.state = {
      shown: false,
      index: defaultIndex ?? 0,
      options,
      value: options[defaultIndex ?? 0]
    };

    this.toggle = this.toggle.bind(this);
    
    this.onKeyDown = this.onKeyDown.bind(this);
    // this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  /**
  * @param { boolean } force
  */
  toggle(force)
  {
    const { shown, options, value } = this.state;
    
    this.setState({
      shown: (typeof force === 'boolean') ? force : !shown,
      // reset index to current value
      index: options.indexOf(value)

      // reset options incase it was filtered using search
      // options: this.props.options
    }, () =>
    {
      // if (inputRef.current)
      // {
      //   // clear search
      //   inputRef.current.value = '';

      //   // auto-focus on search input
      //   if (this.state.shown)
      //   {
      //     inputRef.current?.focus();
      //   }
      //   else
      //   {
      //     inputRef.current.value = this.state.value;

      //     inputRef.current?.blur();
      //   }
      // }
    });
  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    const { shown, index, options } = this.state;

    if (!shown)
      return;

    e.preventDefault();

    if (e.key === 'Enter')
    {
      if (index < options.length)
        // eslint-disable-next-line security/detect-object-injection
        this.onChange(options[index]);
    }

    else if (e.key === 'Escape')
      this.toggle(false);
   
    else if (e.key === 'ArrowUp')
      this.press(index - 1);
   
    else if (e.key === 'ArrowDown')
      this.press(index + 1);
  }

  press(i)
  {
    const { options } = this.state;

    const length = options.length;

    if (length <= 0)
      return;

    if (i >= length)
      i = 0;
    else if (i <= -1)
      i = length - 1;

    this.setState({
      index: i
    }, () =>
    {
      // scroll to the new highlighted option
      document.body.querySelector(`.${styles.option}[highlighted="true"]`).scrollIntoView({
        block: 'nearest'
      });
    });
  }

  hover(i)
  {
    this.setState({
      index: i
    });
  }

  onSearch()
  {
    // const queryString = inputRef.current?.value;

    // const options = this.getItems(queryString);

    // this.setState({
    //   index: 0,
    //   options
    // });
  }

  onChange(opt)
  {
    const { onChange } = this.props;

    this.setState({
      value: opt
    }, () => this.toggle(false));

    onChange?.call(undefined, opt.value);
  }

  render()
  {
    const { shown, value, options, index } = this.state;

    return <div shown={ shown.toString() } id={ this.props.id } className={ `${styles.container} ${this.props.className ?? ''}` } onClick={ this.toggle }>
      <div className={ styles.current }>
        { value.label }
        {/* <input ref={ inputRef } defaultValue= spellCheck={ false } autoComplete={ 'off' } onInput={ this.onSearch }/> */}
      </div>

      <DownIcon className={ styles.extend }/>

      <div shown={ shown.toString() } className={ styles.block } onClick={ this.toggle }/>

      <div shown={ shown.toString() } className={ `${styles.menu} ${this.props.menuClassName ?? ''}` }>

        <div className={ styles.options }>
          {
            options.map((opt, i) =>
            {
              const highlighted = index === i;

              return <div key={ i }>
                { opt.group ? this.props.formatLabel(opt.group) : <div/> }
                <div
                  highlighted={ highlighted.toString() }
                  id={ (this.props.optionsIdPrefix) ? `${this.props.optionsIdPrefix}-${i + 1}` : '' }
                  className={ `${styles.option} ${this.props.optionClassName ?? ''}` }
                  onMouseOver={ () => this.hover(i) }
                  onClick={ () => this.onChange(opt) }
                >
                  { opt.label }
                </div>
              </div>;
            })
          }
        </div>
      </div>
    </div>;
  }
}

Select.propTypes = {
  id: PropTypes.string,

  className: PropTypes.string,
  menuClassName: PropTypes.string,
  optionClassName: PropTypes.string,
  optionsIdPrefix: PropTypes.string,
  
  defaultIndex: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  formatLabel: PropTypes.func,

  onChange: PropTypes.func
};

const styles = createStyle({
  container: {
    display: 'flex',
    cursor: 'pointer',

    position: 'relative',
    boxSizing: 'border-box',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    
    height: '38px',

    transition: 'all 0.15s',
    
    userSelect: 'none',

    border: `${colors.blackText} 1px solid`,
    borderRadius: '4px',

    '[shown="true"]': {
      color: colors.whiteText,
      backgroundColor: colors.greyText,
      border: 0
    }
  },

  current: {
    flexGrow: 1,
    margin: 'auto 10px',

    fontSize: 'calc(11px + 0.25vw + 0.25vh)',

    '> input': {
      color: colors.blackText,

      font: 'inherit',

      width: '100%',
      height: '100%',

      border: 0,
      outline: 0,
      padding: 0
    }
  },

  extend: {
    minWidth: '24px',
    minHeight: '24px',

    margin: 'auto 8px'
  },

  block: {
    display: 'none',
    position: 'fixed',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.transparent,

    top: 0,
    left: 0,
    
    width: '100vw',
    height: '100vh',

    '[shown="true"]': {
      display: 'block'
    }
  },

  menu: {
    display: 'none',
    position: 'absolute',
    
    overflow: 'auto',

    backgroundColor: colors.whiteBackground,

    top: '100%',

    width: '100%',
    height: 'auto',

    border: `${colors.blackText} 1px solid`,
    borderRadius: '4px',

    margin: '8px 0',
    padding: '8px 0',
    
    boxShadow: `0 0 25px -5px ${colors.greyText}`,

    '[shown="true"]': {
      display: 'block'
    }
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    color: colors.accent,

    height: '25px',

    fontSize: '9px',
    textTransform: 'uppercase',

    padding: '0 15px'
  },

  options: {
    display: 'flex',
    flexDirection: 'column',

    '> div > div': {
      padding: '0 15px'
    }
  },

  option: {
    display: 'flex',
    alignItems: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    fontSize: 'calc(11px + 0.25vw + 0.25vh)',

    height: '40px',

    '[highlighted="true"]': {
      color: colors.whiteText,
      backgroundColor: colors.greyText
    }
  }
});

export default Select;