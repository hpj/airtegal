import React from 'react';

import getTheme from '../colors.js';

import { createStyle } from 'flcss';

import i18n, { locale } from '../i18n.js';

import { StoreComponent } from '../store.js';

import Card from './card.js';

import { shareEntry } from './shareOverlay.js';

const colors = getTheme();

class MatchReport extends StoreComponent
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
    
    if (process.env.NODE_ENV === 'test' && params.has('report'))
    {
      const entries = params
        .get('report')
        .split('|')
        .map(cards => cards
          .split(',')
          .map((content, i) => ({ type: i === 0 ? 'black' : 'white', content })));

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
  * @param { [] } entry
  */
  shareEntry(entry)
  {
    shareEntry(
      entry[0].content,
      entry.slice(1).map((c) => c.content));
  }

  render()
  {
    if (this.state.entries.length <= 0)
      return <div/>;
    
    return (
      <div className={ styles.container }>
        {
          this.state.entries.slice(0, 2).map((entry, i) =>
          {
            return <div key={ i } className={ styles.entry }>
              {
                entry.map((card, i) =>
                {
                  return <Card
                    key={ i }
                    shareEntry={ (entry.length - 1 === i) ? () => this.shareEntry(entry) : undefined }
                    owner={ (card.type === 'white') ? i18n('airtegal-cards') : undefined }
                    type={ card.type }
                    content={ card.content }/>;
                })
              }
            </div>;
          })
        }
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    height: 'auto',
    maxHeight: '50vh',
    margin: '5vh 0'
  },

  entry: {
    flexBasis: '100%',

    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',

    direction: locale.direction,
    margin: '0px 5vw',

    ':not(:last-child)': {
      margin: '0px 5vw 10vh'
    },

    '> * > [type="black"]': {
      transform: 'rotate(15deg) translate(0, 10px)'
    },

    '> * > [type="white"]': {
      transform: 'rotate(-10deg) translate(15px, 0px)'
    },

    '> *:nth-child(3) > [type="white"]': {
      transform: 'rotate(5deg) translate(20px, 10px)'
    },

    '> * > [type]': {
      overflow: 'hidden',
      boxShadow: `0px 0px 6px 0px ${colors.greyText}`
    },

    '> * > [type] > *': {
      fontSize: 'calc(7px + 0.25vw + 0.25vh)'
    },

    '> * > * > [type] > *': {
      fontSize: 'calc(7px + 0.25vw + 0.25vh)'
    },

    '> * > * > [type]': {
      width: 'calc(95px + 1vw + 1vh)',
      minHeight: 'calc((95px + 1vw + 1vh) * 1.15)',
      height: 'auto'
    }
  }
});

export default MatchReport;
