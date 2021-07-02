import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import Brightness2Icon from 'mdi-react/Brightness2Icon';
import Brightness5Icon from 'mdi-react/Brightness5Icon';

// import Select from './select.js';

import getTheme, { detectDeviceIsDark } from '../colors.js';

import { withTranslation } from '../i18n.js';

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

    this.hide = this.hide.bind(this);
    // this.apply = this.apply.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keyup', this.hide);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keyup', this.hide);
  }

  hide(e)
  {
    const { hide } = this.props;

    if (!(e instanceof KeyboardEvent))
      hide();
    else if (e.keyCode === 27)
      hide();
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
    const { locale, translation } = this.props;

    let { options } = this.props;

    if (!options)
      options = { active: false };

    return <div enabled={ options.active.toString() } className={ styles.wrapper }>
      <div enabled={ options.active.toString() } className={ styles.holder }/>

      <div enabled={ options.active.toString() } className={ styles.container }>

        <div className={ styles.options }>

          <div className={ styles.choice } style={ { direction: locale.direction } }>
            <div className={ styles.title }>{ translation('theme') }</div>

            <Brightness5Icon active={ (this.state.dirty.darkTheme === false).toString() } onClick={ () => this.switchTheme(false) } className={ styles.icon }/>
            <Brightness2Icon active={ (this.state.dirty.darkTheme === true).toString() } onClick={ () => this.switchTheme(true) } className={ styles.icon }/>
          </div>

          {/* <div className={ styles.choice } style={ { direction: locale.direction } }>
            <div className={ styles.title }>{ translation('region') }</div>

            <Select
              className={ styles.select }

              defaultIndex={ locales.indexOf(locale) }
              options={ locales }

              onChange={ (locale) => setLocale(locale) }
            />
          </div> */}
        </div>

        <div className={ styles.buttons }>
          {/* <div className={ styles.button } enabled={ isDirty.toString() } onClick={ hide } >
            { translation('save') }
          </div> */}

          <div className={ styles.button } enabled={ 'true' } onClick={ this.hide }>
            { translation('close') }
          </div>
        </div>
      </div>
    </div>;
  }
}

OptionsOverlay.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
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

    transition: 'opacity 0.15s ease-in-out',

    '[enabled="false"]': {
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

    opacity: 1,
    borderRadius: '10px',

    maxWidth: '490px',

    top: '25vh',
    width: '70vw',
    height: '50vh',

    overflow: 'hidden',
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    transition: 'top 0.25s, opacity 0.25s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    '[enabled="false"]': {
      opacity: 0,
      top: '100vh'
    }
  },

  choice: {
    display: 'flex',
    alignItems: 'center',

    margin: '25px'
  },

  title: {
    flexGrow: 1
  },

  icon: {
    width: 'calc(12px + 0.55vw + 0.55vh)',
    height: 'calc(12px + 0.55vw + 0.55vh)',

    color: colors.blackText,
    backgroundColor: colors.transparent,

    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',

    margin: '0 5px',

    transform: 'rotateZ(0deg) scale(1)',
    transition: 'transform 0.25s, background-color 0.25s, color 0.25s',

    '[active="true"]': {
      pointerEvents: 'none',
      backgroundColor: colors.whiteBackground,

      transform: 'rotateZ(22deg)'
    },

    ':hover': {
      color: colors.whiteText,
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

    color: colors.blackText,
    backgroundColor: colors.transparent,

    borderColor: colors.greyText,

    '[shown="true"]': {
      color: colors.blackText,
      backgroundColor: colors.whiteBackground
    }
  },

  buttons: {
    display: 'flex',
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

export default withTranslation(OptionsOverlay);
