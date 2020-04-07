import React from 'react';

import CloseIcon from 'mdi-react/CloseThickIcon';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

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
      entries: [
        [
          { type: 'black', 'content': 'a' },
          { type: 'white', 'content': 'a' }
        ],
        [
          { type: 'black', 'content': 'b' },
          { type: 'white', 'content': 'b' },
          { type: 'white', 'content': 'b' }
        ],
        [
          { type: 'black', 'content': 'b' },
          { type: 'white', 'content': 'b' },
          { type: 'white', 'content': 'b' }
        ],
        [
          { type: 'black', 'content': 'b' },
          { type: 'white', 'content': 'b' },
          { type: 'white', 'content': 'b' },
          { type: 'white', 'content': 'b' }
        ],
        [
          { type: 'black', 'content': 'b' },
          { type: 'white', 'content': 'b' },
          { type: 'white', 'content': 'b' }
        ]
      ]
    });

    // bind functions that are use as callbacks

    this.clearEntries = this.clearEntries.bind(this);
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
        <CloseIcon className={ styles.close } onClick={ this.clearEntries }/>

        <div className={ styles.entries }>
          {
            this.state.entries.map((entry, i) =>
            {
              return <div key={ i } className={ styles.entry }>
                {
                  entry.map((card, i) =>
                  {
                    return <Card
                      key={ i }
                      shareEntry={ (entry.length - 1 === i) ? () => this.shareEntry(entry) : undefined }
                      owner={ (card.type === 'white') ? i18n('airtegal') : undefined }
                      type={ card.type }
                      content={ card.content }/>;
                  })
                }
              </div>;
            })
          }
        </div>
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.handBackground,
    
    margin: '20px 25px',
    padding: '5px 0',
    borderRadius: '5px',

    boxShadow: `5px 5px 0px ${colors.greyText}`
  },

  close: {
    cursor: 'pointer',
    fill: colors.greyText,
    
    width: 'calc(22px + 0.25vw + 0.25vh)',
    height: 'calc(22px + 0.25vw + 0.25vh)',
    
    margin: '5px 10px'
  },

  entries: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',

    overflow: 'hidden',
    margin: '5px'
  },

  entry: {
    display: 'flex',
    direction: locale.direction,
    margin: '0px 30px',

    '> *': {
      zIndex: 0,
      margin: '10px -10px'
    },

    '> * > [type]': {
      boxShadow: `0px 0px 6px 0px ${colors.greyText}`,
      overflow: 'hidden'
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
