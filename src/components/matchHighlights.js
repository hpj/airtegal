import React from 'react';

import Lottie from 'lottie-react';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { shareRef } from '../screens/game.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

import { fillTheBlanks } from '../utils';

import { StoreComponent } from '../store.js';

import confettiAnimation from '../animations/confetti-2.json';

const colors = getTheme();

class MatchHighlights extends StoreComponent
{
  constructor()
  {
    super({
      highScore: 0,
      highScorers: [],
      entries: []
    });
  }

  componentDidMount()
  {
    super.componentDidMount();

    const params = new URL(document.URL).searchParams;
    
    if (process.env.NODE_ENV === 'test' && params.has('highlights'))
    {
      const entries = [];

      entries.push([ 'Test?', 'Yes' ]);
      entries.push([ 'Test?', 'Yes' ]);
      entries.push([ 'Test?', 'Yes' ]);
      entries.push([ 'Green, ______ and ______.', 'Red', 'Blue' ]);
      entries.push([ 'انا وحش مصر ___ رقم خسمة و_____.', 'فشخ', 'عشرين' ]);

      entries.push([ 'Invalid?', 'Invalid' ]);
      entries.push([ 'Invalid?', 'Invalid' ]);

      this.setState({
        entries
      });
    }
  }

  stateWillChange(state)
  {
    if (state.roomData?.state === 'match')
    {
      let highScore = 0;
      let highScorers = [];
  
      state.roomData?.players.forEach(({ score }) =>
      {
        if (score > highScore)
          highScore = score;
      });

      highScorers = state.roomData?.players
        .filter(({ score }) => score === highScore)
        .map(({ username }) => username);

      return {
        highScore,
        highScorers
      };
    }
  }

  stateWhitelist(changes)
  {
    if (changes?.entries || changes?.highScore || changes?.highScorers)
      return true;
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
    const { maxEntries, translation, locale } = this.props;

    const { entries, highScore, highScorers } = this.state;

    return (
      <div id={ 'match-highlights' } className={ styles.container } style={ { direction: locale.direction } }>
        {
          highScore > 0 ? <div className={ styles.highScorers }>
            <Lottie
              className={ styles.confetti }
              loop={ process.env.NODE_ENV === 'test' ? false : true }
              initialSegment={ process.env.NODE_ENV === 'test' ? [ 5, 6 ] : undefined }
              animationData={ confettiAnimation }
            />
            {
              [
                translation('congrats'),
                highScorers.join(translation('and')),
                translation('highScorers', highScorers.length),
                translation('by'),
                translation('score', highScore, true)
              ].join(' ')
            }
            { '.' }
          </div> : undefined
        }
        
        {
          entries.slice(0, maxEntries)
            .map(e => fillTheBlanks(e[0], e.slice(1)))
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
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    flexWrap: 'wrap',
    
    justifyContent: 'center',

    gap: '25px',

    ':not(:empty)': {
      margin: '25px'
    }
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

  highScorers: {
    extend: 'entry',
    flexBasis: '100%',
    whiteSpace: 'pre',
    justifyContent: 'center'
  },

  confetti: {
    position: 'absolute',
    pointerEvents: 'none',
    width: '300%',
    height: '300%',
    top: '-100%'
  },

  icon: {
    flexGrow: 1,
    minWidth: '16px',
    height: '16px',
    margin: '0 15px'
  }
});

export default withTranslation(MatchHighlights);
