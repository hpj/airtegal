import React from 'react';

import { Link } from 'react-router-dom';

import PropTypes from 'prop-types';

import { createStyle, createAnimation } from 'flcss';

import getTheme from '../colors.js';

import Warning from '../components/warning.js';

import { withTranslation } from '../i18n.js';

import { fillTheBlanks } from '../utils.js';

const colors = getTheme();

class Homepage extends React.Component
{
  constructor()
  {
    super();
    
    this.state = {
      item: '',
      data: []
    };

    this.interval = undefined;

    window.scrollTo(0, 0);

    this.randomItem = this.randomItem.bind(this);
  }

  componentDidMount()
  {
    // disable any dragging functionality in the app
    window.addEventListener('dragstart', this.disableDrag);
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

  onLocaleChange(translation)
  {
    const data = [];

    translation('combos')
      .forEach(({ card, combos }) =>
        data.push(fillTheBlanks(card.content, combos.map(c => c.content))));

    this.interval = setInterval(this.randomItem, 3500);
    
    this.randomItem(data);
  }

  randomItem(data)
  {
    data = data ?? this.state.data;

    // istanbul ignore next
    if (!data.length)
    {
      clearInterval(this.interval);
    }
    else if (process.env.NODE_ENV === 'test')
    {
      this.setState({ item: data[0], data });
    }
    // istanbul ignore next
    else
    {
      const item = data.splice(Math.floor(Math.random() * data.length), 1)[0];

      this.setState({ item, data });
    }
  }

  render()
  {
    const { item } = this.state;

    const { locale, translation } = this.props;

    return <div id={ 'homepage' }>
      <Warning id={ 'adults-warning' } storageKey={ 'airtegal-adults-warning' }>
        { `${translation('airtegal-adults-warning')}` }
      </Warning>

      <div className={ styles.container }>
        <div className={ styles.header } style={ { direction: locale.direction } }>
          <div className={ styles.airtegal }>{ translation('airtegal') }</div>
          <a className={ styles.button } href={ 'https://herpproject.com/airtegal/terms' }>{ translation('terms-and-conditions') }</a>
          <a className={ styles.button } href={ 'https://herpproject.com/airtegal/privacy' }>{ translation('privacy-policy') }</a>
        </div>

        <span key={ +new Date() } className={ styles.main } style={ { direction: locale.direction } }>
          {
            item?.split('\n')
              .map((t, i) => <span
                key={ i }
                className={ styles.content }
                style={ {
                  paddingBottom: locale.direction === 'ltr' ? '5px' : '15px',
                  borderBottom: i % 2 ? '4px solid' : undefined
                } }
              >
                { t }
              </span>)
          }
        </span>

        <div className={ styles.footer } style={ { direction: locale.direction } }>
          <Link className={ styles.play } to={ 'play' }>
            { translation('play') }
          </Link>
          <div className={ styles.hpj }>
            <a className={ styles.button } href={ 'https://herpproject.com' }>{ translation('hpj') }</a>
          </div>
        </div>
      </div>
    </div>;
  }
}

Homepage.propTypes =
{
  translation: PropTypes.func,
  locale: PropTypes.object
};

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
    alignItems: 'center'
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
    margin: 'auto 20vw'
  },

  content: {
    color: colors.whiteText,
    fontSize: 'calc(22px + 0.4vw + 0.4vh)'
  },
  
  footer: {
    display: 'flex',
    flexWrap: 'wrap'
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

export default withTranslation(Homepage);