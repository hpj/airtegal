import React from 'react';

import PropTypes from 'prop-types';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

class TimedBlock extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      progress: 0
    };

    this.maxTime = 30000;
  }

  componentDidMount()
  {
    const { resolvePromise } = this.props;

    const startTimestamp = Date.now();

    const progress = () =>
    {
      const timePassed = Date.now() - startTimestamp;

      if (timePassed >= this.maxTime)
      {
        resolvePromise();
      }
      else
      {
        this.setState({
          progress: timePassed
        }, () => requestAnimationFrame(progress));
      }
    };

    this.interval = requestAnimationFrame(progress);
  }

  componentWillUnmount()
  {
    if (this.interval)
      cancelAnimationFrame(this.interval);
  }

  render()
  {
    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>

          <div className={ styles.text }>{ i18n('ad-block-detected', (((this.maxTime - this.state.progress) % 60000) / 1000).toFixed(0)) }</div>

          <div style={ { width: `${(100 * (this.maxTime - this.state.progress)) / this.maxTime}%` } } className={ styles.progressBar }/>

        </div>
      </div>
    );
  }
}

TimedBlock.propTypes = {
  resolvePromise: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    zIndex: 40,
    position: 'absolute',
    
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    userSelect: 'none',
    
    backgroundColor: colors.whiteBackground,

    width: 'calc(100vw - 30px)',
    height: 'calc(100vh - 30px)',

    padding: '15px'
  },

  container: {
    maxWidth: '450px',
    width: '100%',

    direction: locale.direction
  },

  text: {
    fontWeight: '700',
    fontSize: 'calc(12px + 0.4vw + 0.4vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    padding: '15px 0',

    color: colors.blackText
  },

  progressBar: {
    backgroundColor: colors.blackText,

    width: '100%',
    height: '7px'
  }
});

export default TimedBlock;
