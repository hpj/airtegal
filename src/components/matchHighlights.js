import React from 'react';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import getTheme, { opacity } from '../colors.js';

import i18n, { locale } from '../i18n.js';

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

    // bind functions that are use as callbacks

    this.clearEntries = this.clearEntries.bind(this);
  }

  componentDidMount()
  {
    const params = new URL(document.URL).searchParams;
    
    if (process.env.NODE_ENV === 'test' && params.has('highlights'))
    {
      const entries = params
        .get('highlights')
        .split('|')
        .map(c => c.split('~'));

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
    if (this.state.entries.length <= 0)
      return <div/>;
    
    return (
      <div id={ 'match-highlights' } className={ styles.container }>
        <div className={ styles.title }>{ i18n('match-highlights') }</div>
        {
          this.state.entries.slice(0, 3)
            .map(e => fillTheBlanks(e[0], e.slice(1)))
            // eslint-disable-next-line security/detect-object-injection
            .map((e, k) => <div className={ styles.entry } key={ k } onClick={ () => this.shareEntry(this.state.entries[k]) }>
              {
                e.split('\n').map((t, i) => <span key={ i } className={ i % 2 ? styles.underline : styles.content }>
                  { t }
                </span>)
              }

              <ShareIcon className={ styles.icon }/>
            </div>)
        }
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    padding: '0 25px',
    direction: locale.direction,
    fontSize: 'calc(6px + 0.4vw + 0.4vh)'
  },

  title: {
    padding: '20px 0'
  },

  entry: {
    cursor: 'pointer',
    position: 'relative',
    color: colors.blackText,
    
    left: 0,
    padding: '0 0 20px',
    transition: 'left 0.35s ease',
    
    ':hover': {
      left: '10px',

      '> svg': {
        opacity: 1,
        width: 'calc(14px + 0.25vw + 0.25vh)'
      }
    }
  },

  icon: {
    opacity: 0,
    position: 'relative',
    color: colors.whiteText,
    backgroundColor: opacity(colors.greyText, 0.25),

    top: '10px',
    left: '-10px',
    width: 'calc(8px + 0.25vw + 0.25vh)',
    height: 'calc(14px + 0.25vw + 0.25vh)',
    
    padding: '8px',
    borderRadius: '100%',
    transition: 'opacity 0.25s ease, width 0.35s ease'
  },

  content: {
    padding: '2px 0'
  },
  
  underline: {
    extend: 'content',
    borderBottom: '3px solid'
  }
});

export default MatchHighlights;
