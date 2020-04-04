import React from 'react';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

import Card from './card.js';
import { shareEntry } from './shareOverlay.js';

const colors = getTheme();

class MatchReport extends React.Component
{
  constructor()
  {
    super();
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
    const entires = [
      [
        { type: 'black', content: 'blah' },
        { type: 'white', content: 'blah' },
        { type: 'white', content: 'blah' }
      ]
    ];

    return (
      <div className={ styles.container }>

        <div className={ styles.title }>
          { i18n('match-report') }
        </div>

        {/* TODO share cards */}
        
        <div className={ styles.entries }>
          {
            entires.map((entry, i) =>
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
    borderRadius: '5px',

    boxShadow: `5px 5px 0px ${colors.greyText}`
  },

  title: {
    color: colors.greyText,
    padding: '10px'
  },

  entries: {
    display: 'flex',
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
      width: 'calc(85px + 1vw + 1vh)',
      minHeight: 'calc((85px + 1vw + 1vh) * 1.15)',
      height: 'auto'
    }
  }
});

export default MatchReport;
