import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import getTheme from '../colors.js';

import { withI18n } from '../i18n.js';

import { fillTheBlanks } from '../utils';

import { StoreComponent } from '../store.js';

import { shareEntry } from './shareOverlay.js';

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
  shareEntry(entry)
  {
    shareEntry(entry[0], entry.slice(1));
  }

  render()
  {
    if (!this.state.entries?.length)
      return <div/>;

    const { locale, i18n } = this.props;
    
    return <div id={ 'match-highlights' } className={ styles.container } style={ { direction: locale.direction } }>
      <div className={ styles.title }>{ i18n('match-highlights') }</div>
      {
        this.state.entries.slice(0, 3)
          .map(e => fillTheBlanks(e[0], e.slice(1)))
          // eslint-disable-next-line security/detect-object-injection
          .map((e, k) => <div key={ k } className={ styles.entry } onClick={ () => this.shareEntry(this.state.entries[k]) }>
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
  i18n: PropTypes.func,
  locale: PropTypes.object
};

const styles = createStyle({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 25px'
  },

  title: {
    padding: '20px 0'
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
    
    ':hover': {
      margin: '20px -10px 20px -10px'
    }
  },

  icon: {
    color: colors.blackText,

    width: 'calc(12px + 0.2vw + 0.2vh)',
    height: 'calc(12px + 0.2vw + 0.2vh)',
    
    margin: '0 8px'
  }
});

export default withI18n(MatchHighlights);
