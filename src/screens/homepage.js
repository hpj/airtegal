import React from 'react';

import { Link } from 'react-router-dom';

import { createStyle, createAnimation } from 'flcss';

import { ErrorBoundary } from '@sentry/react';

import getTheme from '../colors.js';

import Warning from '../components/warning.js';

import i18n, { locale } from '../i18n.js';

import { fillTheBlanks } from '../utils.js';

const colors = getTheme();

class Homepage extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      index: -1,
      data: []
    };

    this.interval = undefined;

    window.scrollTo(0, 0);

    this.updateIndex = this.updateIndex.bind(this);
  }

  componentDidMount()
  {
    // disable any dragging functionality in the app
    window.addEventListener('dragstart', this.disableDrag);

    i18n('combos')
      .forEach(({ card, combos }) =>
        this.state.data.push(fillTheBlanks(card.content, combos.map(c => c.content))));

    const index = this.randomIndex(this.state.data.length, -1);
    
    this.setState({ data: this.state.data, index },
      () => this.interval = setInterval(this.updateIndex, 4500));
  }

  componentWillUnmount()
  {
    clearInterval(this.interval);

    window.removeEventListener('dragstart', this.disableDrag);
  }

  disableDrag(e)
  {
    e.stopPropagation();
    e.preventDefault();
  }

  randomIndex(length, lastIndex)
  {
    const index = Math.floor(((window.crypto.getRandomValues(new Uint32Array(1))[0]) / 2**32) * length);

    // istanbul ignore else
    if (process.env.NODE_ENV === 'test')
      return 0;
    else if (index === lastIndex)
      return this.randomIndex(length, lastIndex);
    else
      return index;
  }

  updateIndex()
  {
    const { data, index } = this.state;

    this.setState({
      index: this.randomIndex(data.length, index)
    });
  }

  render()
  {
    /**
    * @type { { data: string[] } }
    */
    const { data } = this.state;

    return <ErrorBoundary fallback={ 'An error has occurred' }>
      <div id={ 'homepage' }>
        <Warning
          storageKey={ 'airtegal-adults-warning' }
          text={ i18n('airtegal-adults-warning') }
          button={ i18n('ok') }
        />

        <div className={ styles.container }>
          <div className={ styles.header }>
            <div className={ styles.airtegal }>{ i18n('airtegal') }</div>
            <a className={ styles.button } href={ 'https://herpproject.com/airtegal/terms' }>{ i18n('terms-and-conditions') }</a>
            <a className={ styles.button } href={ 'https://herpproject.com/airtegal/privacy' }>{ i18n('privacy-policy') }</a>
          </div>

          <span className={ styles.main } key={ +new Date() }>
            {
              data?.[this.state.index]?.split('\n')
                .map((t, i) => <span key={ i } className={ i % 2 ? styles.underline : styles.content }>
                  { t }
                </span>)
            }
          </span>

          <div className={ styles.footer }>
            <Link className={ styles.play } to={ 'play' }>
              { i18n('play') }
            </Link>
            <div className={ styles.hpj }>
              <a className={ styles.button } href={ 'https://herpproject.com' }>{ i18n('hpj') }</a>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>;
  }
}

const backgroundAnimation = createAnimation({
  duration: '7.5s',
  direction: 'alternate',
  timingFunction: 'ease',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '100%': {
      backgroundPosition: '100% 50%'
    }
  }
});

const enterAnimation = createAnimation({
  duration: '0.85s',
  timingFunction: 'ease-in-out',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 1,
  keyframes: {
    from: {
      opacity: '0.05'
    },
    to: {
      opacity: '1'
    }
  }
});

const playAnimation = createAnimation({
  duration: '0.8s',
  direction: 'alternate',
  timingFunction: 'ease-in-out',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    from: {
      transform: 'scale(1)'
    },
    to: {
      transform: 'scale(0.75)'
    }
  }
});

const styles = createStyle({
  container: {
    display: 'grid',
    
    gridTemplateColumns: '100%',
    gridTemplateRows: 'min-content 1fr min-content',
    gridTemplateAreas: '"." "." "."',

    userSelect: 'none',

    animation: backgroundAnimation,
    background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',

    backgroundPosition: '0% 50%',
    backgroundSize: '400% 400%',

    width: '100wh',
    height: '100vh',

    fontWeight: 700,
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    direction: locale.direction
  },

  airtegal: {
    color: colors.whiteText,
    fontSize: 'calc(25px + 0.5vw + 0.5vh)',
    padding: '15px 5vw'
  },

  button: {
    cursor: 'pointer',
    color: colors.whiteText,
    
    fontSize: 'calc(8px + 0.25vw + 0.25vh)',
    padding: '0 5vw',

    textDecoration: 'none',

    ':hover': {
      color: colors.accentColor
    }
  },

  main: {
    textAlign: 'center',
    animation: enterAnimation,
    direction: locale.direction,
    margin: 'auto 20vw'
  },

  content: {
    color: colors.whiteText,
    paddingBottom: '15px',
    fontSize: 'calc(22px + 0.4vw + 0.4vh)'
  },
  
  underline: {
    extend: 'content',
    borderBottom: '4px solid'
  },

  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    direction: locale.direction
  },

  play: {
    extend: 'button',
    position: 'relative',
    fontSize: 'calc(16px + 0.25vw + 0.25vh)',

    animation: playAnimation,

    padding: '0',
    margin: '3.5vh auto 2.5vh auto'
  },

  hpj: {
    display: 'flex',
    flexBasis: '100%',
    flexDirection: 'row-reverse',
    padding: '18px 0',

    '> a': {
      fontSize: 'calc(18px + 0.35vw + 0.35vh)'
    }
  }
});

export default Homepage;