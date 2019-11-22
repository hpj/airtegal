import React from 'react';

import PropTypes from 'prop-types';

import CrownIcon from 'mdi-react/CrownIcon';

// import i18n from '../i18n/eg-AR.json';

import { socket } from '../screens/game.js';

import * as colors from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

class Trackbar extends React.Component
{
  constructor()
  {
    super();

    // to avoid a high number of render() calls
    // only update state if the trackbar-related info is changed

    this.state = {
      loadingHidden: true,
      errorHidden: true,
      errorMessage: undefined
    };
  }

  componentDidMount()
  {
    socket.on('roomData', (roomData) =>
    {
      this.setState({
        roomState: roomData.state,
        // TODO maxPlayers is part of the room options (has not been implement yet)
        maxPlayers: 8,
        players: roomData.players,
        masterId: roomData.master
      });
    });
  }

  showErrorMessage(err)
  {
    this.setState({
      errorHidden: false,
      errorMessage: err
    });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  hideErrorMessage()
  {
    this.setState({
      loadingHidden: true,
      errorHidden: true
    });
  }

  matchRequest()
  {
    this.loadingVisibility(true);

    this.props.sendMessage('matchRequest')
      .then(() => this.loadingVisibility(false))
      .catch((err) => this.showErrorMessage(err));
  }

  render()
  {
    if (!this.state.players)
      return (<div></div>);

    const players = this.state.players;
    const playerIds = Object.keys(players);
    
    return (
      <div className={ styles.wrapper }>
        <div className={ styles.container }>

          <div style={ {
            display: (this.state.loadingHidden) ? 'none' : ''
          } } className={ styles.loading }
          >
            <div className={ styles.loadingSpinner } style={ {
              // hide loading spinner if error is visible
              display: (this.state.errorHidden) ? '' : 'none'
            } }></div>

            <div className={ styles.error } style={ {
              display: (this.state.errorHidden) ? 'none' : ''
              // on click hide error message
            } } onClick={ this.hideErrorMessage.bind(this) }>
              <div className={ styles.errorMessage }>{this.state.errorMessage}</div>
            </div>
          </div>

          <div className={ styles.status }>{ playerIds.length }/8</div>

          <div className={ styles.players }>
            {
              playerIds.map((playerId) =>
              {
                const isMaster = (this.state.masterId === playerId).toString();

                return <div className={ styles.player } key={ playerId }>

                  <CrownIcon className={ styles.crownIcon } master={ isMaster }></CrownIcon>

                  <div>{ players[playerId].username }</div>

                  <div>0</div>

                </div>;
              })
            }
          </div>

          <div className={ styles.info }>
            {/* TODO added client-side checks for the ability of starting matches <div className={styles.inform}>Not Enough Players</div> */}

            { /* the start button only visible if the user is the room's master and the room's state is 'lobby' */ }
            <div className={ styles.button } style={ {
              display: (socket.id === this.state.masterId && this.state.roomState === 'lobby') ? '' : 'none'
            } } onClick={ this.matchRequest.bind(this) }>Start</div>

          </div>
        </div>
      </div>
    );
  }
}

Trackbar.propTypes = {
  sendMessage: PropTypes.func.isRequired
};

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
    position: 'relative',

    gridTemplateRows: 'auto 1fr auto',
    gridTemplateAreas: '"status" "players" "buttons"',
    
    width: '100%',
    height: '100%'
    
    // TODO fix the portrait overlay
    // '@media screen and (max-width: 980px)': {
    //   alignItems: 'center'
    // }
  },

  loading: {
    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    justifyContent: 'center',
    
    backgroundColor: colors.whiteBackground,

    borderRadius: '0 15px 15px 0',

    width: '100%',
    height: '100%'
  },

  loadingSpinner: {
    backgroundColor: 'transparent',

    paddingBottom: '15%',
    width: '15%',

    border: `8px ${colors.blackText} solid`,

    animation: createAnimation({
      keyframes: `
      from { transform:rotate(0deg); }
      to { transform:rotate(360deg); }
      `,
      duration: '2s',
      timingFunction: 'linear',
      iterationCount: 'infinite'
    })
  },

  error: {
    backgroundColor: colors.error,
    maxWidth: '60%',

    padding: '6px',
    borderRadius: '5px'
  },

  errorMessage: {
    color: colors.whiteText,
    textTransform: 'capitalize',

    cursor: 'pointer',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
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

  info: {
    
  },

  inform: {
    
  },

  button: {
    
  }
});

export default Trackbar;