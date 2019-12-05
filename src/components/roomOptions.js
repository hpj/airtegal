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

    socket.on('roomData', (roomData) =>
    {
      this.setState({
        options: roomData.options
      });
    });
  }

  render()
  {
    return (
      <div className={ styles.container }>
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
    position: 'relative',
    backgroundColor: colors.whiteBackground,

    top: '-200%',
    width: '100%',
    height: '100%',

    padding: '0 0 0 30px'
  }
});

export default RoomOptions;