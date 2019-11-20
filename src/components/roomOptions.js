import React from 'react';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle } from '../flcss.js';

class RoomOptions extends React.Component
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
        options: roomInfo.options
      });
    });
  }

  render()
  {
    return (
      <div className={styles.container}>
        { JSON.stringify(this.state.options) }
        
        {/* <div>Win Method</div>
        <div>First to 10 Points</div>

        <div>Round Options</div>
        <div>2:00 Countdown</div>

        <div>Packs</div>
        <div>Default</div> */}
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.red,

    width: '100%',
    height: '100%',

    paddingLeft: '15px'
  }
});

export default RoomOptions;