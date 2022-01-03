import React from 'react';

import CheckIcon from 'mdi-react/CheckIcon';
import WaitingIcon from 'mdi-react/LoadingIcon';

import { StoreComponent } from '../store.js';

import { withTranslation } from '../i18n.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

const colors = getTheme();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class RoomTrackBar extends StoreComponent
{
  constructor()
  {
    super();
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (changes?.roomData)
      return true;
  }

  render()
  {
    const { locale, translation } = this.props;

    const { roomData } = this.state;

    const match = roomData?.state === 'match';

    const gameMode = roomData?.options.gameMode;

    const Player = ({ turn, username }) => <div className={ styles.player }>

      {
        match ? <>{ turn ? <WaitingIcon className={ styles.waiting }/> : <CheckIcon/> }</> : undefined
      }

      <div className={ styles.name }>{ username }</div>
    </div>;

    //  separate the judge from the rest of the players

    const judges = roomData?.players.filter(id => roomData?.playerProperties[id].state === 'judging').map(id =>
    {
      const player = roomData?.playerProperties[id];

      return <Player key={ id } turn={ roomData?.phase === 'judging' } username={ player?.username }/>;
    });

    const players = roomData?.players.filter(id => roomData?.playerProperties[id].state !== 'judging').map(id =>
    {
      const player = roomData?.playerProperties[id];
        
      return <Player key={ id } turn={ player?.state === 'picking' } username={ player?.username }/>;
    });

    return <div className={ styles.wrapper }>
      <div className={ styles.container } style={ {
        direction: locale.direction,
        flexDirection: gameMode === 'kuruit' ? 'column' : 'column-reverse'
      } }>
        <div>
          {
            judges?.length ? <div className={ styles.title }>
              { translation(gameMode === 'kuruit' ? 'judge' : 'judges') }
            </div> : undefined
          }
          { judges }
        </div>

        <div>
          {
            judges?.length ? <div className={ styles.title }>
              { translation(gameMode === 'kuruit' ? 'players' : 'competitors') }
            </div> : undefined
          }
          { players }
        </div>
      </div>
    </div>;
  }
}

const waitingAnimation = createAnimation({
  duration: '1s',
  timingFunction: 'ease',
  iterationCount: process.env.NODE_ENV === 'test' ? 0 : 'infinite',
  keyframes: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  }
});

const styles = createStyle({
  wrapper: {
    gridArea: 'trackBar',

    backgroundColor: colors.trackBarBackground,
    
    overflow: 'hidden auto',
    
    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      boxShadow: `inset 0 0 8px 8px ${colors.trackBarScrollbar}`
    },

    '@media screen and (max-width: 1080px)': {
      display: 'none'
    }
  },

  container: {
    userSelect: 'none',

    display: 'flex',
    position: 'relative',

    opacity: 0.65,
    
    color: colors.blackText,

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    width: '100%',
    height: 'min-content'
  },

  title: {
    fontSize: 'calc(8px + 0.15vw + 0.15vh)',
    padding: '15px 10px'
  },

  player: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    padding: '15px 10px',

    '> svg': {
      width: 'calc(7px + 0.25vw + 0.25vh)',
      height: 'calc(7px + 0.25vw + 0.25vh)'
    }
  },

  name: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    fontSize: 'calc(6px + 0.35vw + 0.35vh)',

    padding: '0 15px'
  },

  waiting: {
    animation: waitingAnimation
  }
});

export default withTranslation(RoomTrackBar);