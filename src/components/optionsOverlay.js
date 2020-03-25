import React from 'react';

import PropTypes from 'prop-types';

import Select from 'react-select';

import Brightness2Icon from 'mdi-react/Brightness2Icon';
import Brightness5Icon from 'mdi-react/Brightness5Icon';

import getTheme, { detectDeviceIsDark } from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locales, locale, setLocale } from '../i18n.js';

const colors = getTheme();

class OptionsOverlay extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      options: {
        darkTheme: detectDeviceIsDark()
      },
      dirty: {
        darkTheme: detectDeviceIsDark()
      }
    };

    // bind functions that are use as callbacks

    // this.apply = this.apply.bind(this);
  }

  apply()
  {
    //
  }

  switchTheme(value)
  {
    // reverse current setting
    if (!value)
      localStorage.setItem('forceDark', 'false');
    else
      localStorage.setItem('forceDark', 'true');

    // refresh page
    location.reload();

    // this.setState({
    //   dirty: {
    //     ...this.state.dirty,
    //     darkTheme: value
    //   }
    // });
  }

  render()
  {
    const { hide } = this.props;

    let { options } = this.props;

    if (!options)
      options = { active: false };

    // const isDirty = JSON.stringify(this.state.dirty) !== JSON.stringify(this.state.options);
  
    return (
      <div enabled={ options.active.toString() } className={ styles.wrapper }>
        <div className={ styles.holder }/>

        <div className={ styles.container }>

          <div className={ styles.options }>

            <div className={ styles.choice }>
              <div className={ styles.title }>{ i18n('theme') }</div>

              <Brightness5Icon active={ (this.state.dirty.darkTheme === false).toString() } onClick={ () => this.switchTheme(false) } className={ styles.icon }/>
              <Brightness2Icon active={ (this.state.dirty.darkTheme === true).toString() } onClick={ () => this.switchTheme(true) } className={ styles.icon }/>
            </div>

            <div className={ styles.choice }>
              <div className={ styles.title }>{ i18n('region') }</div>

              <Select
                className={ styles.select }
                classNamePrefix='react-select-2'
                noOptionsMessage={ () => i18n('no-options') }
                defaultValue={ locale }
                isRtl={ locale.direction === 'rtl' }
                isSearchable={ true }
                options={ locales }
                onChange={ (locale) => setLocale(locale.value) }
                theme={ theme => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: colors.whiteText
                  }
                }) }
              />
            </div>
          </div>

          <div className={ styles.buttons }>
            {/* <div className={ styles.button } enabled={ isDirty.toString() } onClick={ hide } >
              { i18n('save') }
            </div> */}

            <div className={ styles.button } enabled={ 'true' } onClick={ hide }>
              { i18n('close') }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

OptionsOverlay.propTypes = {
  options: PropTypes.object,
  hide: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    zIndex: 4,
    position: 'fixed',
    display: 'flex',

    justifyContent: 'center',

    top: 0,
    left: 0,

    width: 'calc(100vw + 18px)',
    height: '100vh',

    '[enabled="false"]': {
      pointerEvents: 'none'
    }
  },

  holder: {
    opacity: 0.85,
    backgroundColor: colors.holder,

    width: '100%',
    height: '100%',

    transition: 'opacity 0.25s',
    transitionTimingFunction: 'ease-in-out',

    'div[enabled="false"] > %this': {
      opacity: 0
    }
  },

  container: {
    position: 'absolute',
    display: 'grid',

    gridTemplateRows: '1fr auto',

    userSelect: 'none',

    color: colors.blackText,
    backgroundColor: colors.shareBackground,

    borderRadius: '10px',

    maxWidth: '490px',

    top: '25vh',
    width: '70vw',
    height: '50vh',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    transition: 'top 0.25s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    'div[enabled="false"] > %this': {
      top: '100vh'
    }
  },

  choice: {
    display: 'flex',

    direction: locale.direction,
    alignItems: 'center',

    margin: '25px'
  },

  title: {
    flexGrow: 1
  },

  icon: {
    width: 'calc(12px + 0.55vw + 0.55vh)',
    height: 'calc(12px + 0.55vw + 0.55vh)',

    fill: colors.blackText,
    backgroundColor: colors.transparent,

    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',

    margin: '0 5px',

    transform: 'rotateZ(0deg) scale(1)',
    transition: 'transform 0.25s, background-color 0.25s, fill 0.25s',

    '[active="true"]': {
      pointerEvents: 'none',
      backgroundColor: colors.whiteBackground,

      transform: 'rotateZ(22deg)'
    },

    ':hover': {
      fill: colors.whiteText,
      backgroundColor: colors.blackBackground,

      transform: 'rotateZ(22deg)'
    },

    ':active': {
      transform: 'scale(0.95) rotateZ(22deg)'
    }
  },

  select: {
    flexGrow: 1,
    margin: '0 5px',

    ':focus': {
      outline: colors.whiteText
    },

    ' .react-select-2__option': {
      cursor: 'pointer'
    },

    ' .react-select-2__option--is-selected': {
      backgroundColor: colors.greyText,

      ':active': {
        backgroundColor: colors.greyText
      }
    },
    '.react-select-2__input': {
      color: colors.greyText
    },

    ' .react-select-2__control': {
      cursor: 'pointer',

      background: 'none',
      borderColor: colors.greyText,
      outline: colors.greyText
    },

    ' .react-select-2__control:hover:not(.react-select-2__control--is-focused)': {
      borderColor: colors.greyText,
      outline: colors.greyText
    },

    ' .react-select-2__control--is-focused:hover': {
      borderColor: colors.transparent,
      outline: colors.transparent
    },

    ' .react-select-2__control:focus': {
      borderColor: colors.transparent,
      outline: colors.transparent
    },

    ' .react-select-2__control--is-focused': {
      background: colors.whiteBackground,
      boxShadow: 'none',
      borderColor: colors.transparent,
      outline: colors.transparent
    },

    ' .react-select-2__single-value': {
      color: colors.greyText
    },

    ' .react-select-2__indicator-separator': {
      backgroundColor: colors.greyText
    },

    ' .react-select-2__indicator': {
      color: colors.greyText
    },

    ' .react-select-2__indicator:hover': {
      color: colors.whiteBackground
    }
  },

  buttons: {
    display: 'flex',

    direction: locale.direction,

    userSelect: 'none',

    margin: '15px'
  },

  button: {
    cursor: 'pointer',
    textAlign: 'center',
    flexGrow: 1,

    '[enabled="false"]': {
      cursor: 'default',
      pointerEvents: 'none',

      color: colors.greyText
    }
  }
});

export default OptionsOverlay;
