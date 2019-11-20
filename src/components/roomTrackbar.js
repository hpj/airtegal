import React from 'react';

import CrownIcon from 'mdi-react/CrownIcon';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

class Trackbar extends React.Component
{
  constructor()
  {
    super();

    // to avoid a high number of render() calls
    // only update state if the trackbar-related info is changed

    this.state = {};

    socket.on('room-info', (roomInfo) =>
    {
      this.setState({
        // TODO maxPlayers is part of the room options (has not been implement yet)
        maxPlayers: 8,
        players: roomInfo.players,
        masterId: roomInfo.master
      });
    });
  }

  render()
  {
    if (!this.state.players)
      return (<div></div>);

    const players = this.state.players;
    const playerIds = Object.keys(players);
    
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>

          <div className={styles.status}>{ playerIds.length }/8</div>

          <div className={styles.players}>
            {
              playerIds.map((playerId) =>
              {
                const isMaster = (this.state.masterId === playerId).toString();

                return <div className={styles.player} key={playerId}>

                  <CrownIcon className={styles.crownIcon} master={isMaster}></CrownIcon>

                  <div>{ players[playerId].username }</div>

                  <div>0</div>

                </div>;
              })
            }
          </div>

          <div className={styles.buttons}>Start</div>

        </div>
      </div>
    );
  }
}

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    gridArea: 'side',

    backgroundColor: colors.whiteBackground,

    width: 'calc(100% + 15px)',
    height: '100%',

    borderRadius: '0 15px 15px 0'

    // TODO fix the portrait overlay
    // '@media screen and (max-width: 980px)': {
    //   width: '100%',
    //   height: 'calc(100% + 15px)',

    //   borderRadius: '0 0 15px 15px'
    // }
  },

  container: {
    display: 'grid',

    gridTemplateRows: 'auto 1fr auto',
    gridTemplateAreas: '"status" "players" "buttons"',
    
    width: '100%',
    height: '100%'
    
    // TODO fix the portrait overlay
    // '@media screen and (max-width: 980px)': {
    //   alignItems: 'center'
    // }
  },

  status: {

  },

  players: {
    width: '100%',
    height: '100%'
  },

  player: {
    display: 'grid',

    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto',
    gridTemplateAreas: '"status players buttons"'
  },

  'crownIcon': {
    '[master="false"]': {
      opacity: 0
    }
  },

  buttons: {
    
  }
});

export default Trackbar;