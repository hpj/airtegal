import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { shareRef } from '../screens/game.js';

import getTheme, { opacity } from '../colors.js';

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
    
    if (import.meta.env.MODE === 'test' && params.has('highlights'))
    {
      const entries = [];

      entries.push([ 'Test?', 'Yes' ]);
      entries.push([ 'Test?', 'Yes' ]);
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
    const { maxEntries, locale } = this.props;

    const { entries } = this.state;

    if (!entries?.length)
      return <div/>;
    
    return <div id={ 'match-highlights' } className={ styles.container } style={ { direction: locale.direction } }>
      {
        entries.slice(0, maxEntries)
          .map(e => fillTheBlanks(e[0], e.slice(1)))
          // eslint-disable-next-line security/detect-object-injection
          .map((e, k) => <div key={ k } className={ styles.entry } onClick={ () => this.share(entries[k]) }>
            <div>
              {
                e.split('\n').map((t, i) =>
                  <span key={ i } style = { { borderBottom: i % 2 ? '2px solid' : undefined } }>
                    { t }
                  </span>)
              }
            </div>

            <ShareIcon className={ styles.icon }/>
          </div>)
      }
    </div>;
  }
}

MatchHighlights.propTypes =
{
  maxEntries: PropTypes.number.isRequired,
  translation: PropTypes.func,
  locale: PropTypes.object
};

const styles = createStyle({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    
    justifyContent: 'center',

    gap: '25px',
    margin: '25px'
  },

  entry: {
    cursor: 'pointer',
    display: 'flex',

    alignItems: 'center',
    
    color: opacity(colors.blackText, 0.75),

    width: 'fit-content',
    
    border: `2px ${opacity(colors.greyText, 0.25)} solid`,

    padding: '25px',
    
    '> :first-child > span': {
      padding: '6px 0'
    },
    
    ':active': {
      transform: 'scale(0.95)'
    }
  },

  icon: {
    flexGrow: 1,
    
    minWidth: '16px',
    height: '16px',

    margin: '0 15px'
  }
});

export default withTranslation(MatchHighlights);
