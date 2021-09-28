import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { shareRef } from '../screens/game.js';

import getTheme from '../colors.js';

import { withTranslation } from '../i18n.js';

import { fillTheBlanks } from '../utils';

import { StoreComponent } from '../store.js';

const colors = getTheme();

class MatchHighlights extends StoreComponent
{
  constructor()
  {
    super({
      entries: []
    });

    this.clearEntries = this.clearEntries.bind(this);
  }

  componentDidMount()
  {
    const params = new URL(document.URL).searchParams;
    
    if (process.env.NODE_ENV === 'test' && params.has('highlights'))
    {
      const entries = [];

      entries.push([ 'Test?', 'Yes' ]);
      entries.push([ 'Green, ______ and ______.', 'Red', 'Blue' ]);
      entries.push([ 'انا وحش مصر ___ رقم خسمة و_____.', 'فشخ', 'عشرين' ]);

      entries.push([ 'Invalid?', 'Invalid' ]);
      entries.push([ 'Invalid?', 'Invalid' ]);

      this.setState({ entries });
    }
  }

  stateWhitelist(changes)
  {
    if (changes?.entries)
      return true;
  }

  clearEntries()
  {
    this.store.set({
      entries: []
    });
  }

  /**
  * @param { string[] } entry
  */
  share(entry)
  {
    shareRef.current?.shareEntry({
      black: entry[0],
      white: entry.slice(1)
    });
  }

  render()
  {
    const { locale } = this.props;

    const { entries } = this.state;

    if (!entries?.length)
      return <div/>;
    
    return <div id={ 'match-highlights' } className={ styles.container } style={ { direction: locale.direction } }>
      {
        entries.slice(0, 3)
          .map(e => fillTheBlanks(e[0], e.slice(1)))
          // eslint-disable-next-line security/detect-object-injection
          .map((e, k) => <div key={ k } className={ styles.entry } onClick={ () => this.share(entries[k]) }>
            {
              e.split('\n').map((t, i) =>
                <span
                  key={ i }
                  style = { {
                    padding: '3px 0',
                    borderBottom: i % 2 ? '2px solid' : undefined
                  } }
                >
                  { t }
                </span>)
            }

            <ShareIcon className={ styles.icon }/>
          </div>)
      }
    </div>;
  }
}

MatchHighlights.propTypes =
{
  translation: PropTypes.func,
  locale: PropTypes.object
};

const styles = createStyle({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 25px'
  },

  entry: {
    cursor: 'pointer',
    display: 'flex',

    width: 'fit-content',
    
    alignItems: 'center',
    whiteSpace: 'pre-wrap',

    color: colors.blackText,
    
    margin: '20px 0',
    transition: 'margin 0.25s ease',
    
    ':active': {
      transform: 'scale(0.95)'
    }
  },

  icon: {
    color: colors.blackText,

    width: 'calc(12px + 0.2vw + 0.2vh)',
    height: 'calc(12px + 0.2vw + 0.2vh)',
    
    margin: '0 15px'
  }
});

export default withTranslation(MatchHighlights);
