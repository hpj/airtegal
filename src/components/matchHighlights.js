import React from 'react';

import Lottie from 'lottie-react';

import { createStyle } from 'flcss';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { shareRef } from '../screens/game.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

import { socket, fillTheBlanks } from '../utils';

import { StoreComponent } from '../store.js';

import confettiAnimation from '../animations/confetti-2.json';

const colors = getTheme();

class MatchHighlights extends StoreComponent
{
  constructor()
  {
    super({
      highScore: 0,
      entries: []
    });
  }

  componentDidMount()
  {
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

  stateWhitelist(changes)
  {
    if (changes?.entries || changes?.highScore)
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
    const { maxEntries, players, translation, locale } = this.props;

    const { highScore, entries } = this.state;

    if (!entries?.length && !highScore)
      return <div/>;

    const highScorers = players
      .filter(({ score }) => score === highScore)
      .map(({ username }) => username)
      .join(translation('and'));

    return (
      <div id={ 'match-highlights' } className={ styles.container } style={ { direction: locale.direction } }>
        {
          highScorers.includes(socket.id) && process.env.NODE_ENV !== 'test' ?
            <Lottie className={ styles.confetti } loop={ true } animationData={ confettiAnimation }/> :
            undefined
        }
        
        <div className={ styles.highScorers }>
          {
            [
              translation('congrats'),
              highScorers,
              translation('highScorers', highScorers.length),
              translation('by'),
              translation('score', highScore, true)
            ].join(' ')
          }
          { '.' }
        </div>
          
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
