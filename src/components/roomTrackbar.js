import React from 'react';

import PropTypes from 'prop-types';

import i18n, { locale } from '../i18n.js';

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

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);
  }

  componentDidMount()
  {
    socket.on('roomData', this.onRoomData);
  }

  componentWillUnmount()
  {
    socket.off('roomData', this.onRoomData);
  }

  onRoomData(roomData)
  {
    if (roomData.counter)
    {
      // clear the pervious countdown
      if (this.countdownInterval)
        clearInterval(this.countdownInterval);

      // if counter is number
      // then it's a countdown
      if (typeof roomData.counter === 'number')
      {
        this.countdown = Date.now() + roomData.counter;

        // set a 1s interval
        this.countdownInterval = setInterval(() =>
        {
          const remaining = this.countdown - Date.now();

          if (remaining >= 0)
          {
            this.setState({ counter: this.formatMs(remaining) });
          }
          else
          {
            this.setState({ counter: this.formatMs(0) });

            clearInterval(this.countdownInterval);
          }
        }, 1000);

        // update the counter immediately since the first interval won't execute immediately
        this.setState({ counter: this.formatMs(roomData.counter) });
      }
      // if not display it as is
      else
      {
        this.setState({ counter: roomData.counter });
      }
    }

    this.setState({
      roomState: roomData.state,
      maxPlayers: roomData.options.match.maxPlayers,
      players: roomData.players,
      playerProperties: roomData.playerProperties,
      masterId: roomData.master
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
      .catch((err) => this.showErrorMessage(i18n(err) || err));
  }

  formatMs(milliseconds)
  {
    const minutes = Math.floor(milliseconds / 60000);

    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);

    return `${minutes}:${(seconds < 10) ? '0' : ''}${seconds}`;
  }

  render()
  {
    if (!this.state.players)
      return (<div></div>);

    const isMatch = (this.state.roomState === 'match');

    const isThisMaster = this.state.masterId === socket.id;

    const isAllowed = (this.state.players.length >= 3 || process.env.NODE_ENV === 'development');

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

          <div className={ styles.status }>{ this.state.counter }</div>

          <div className={ styles.players }>
            {
              this.state.players.map((playerId) =>
              {
                const isMaster = playerId === this.state.masterId;
                const isJudge = this.state.playerProperties[playerId].state === 'judging';
                const isPlayer = this.state.playerProperties[playerId].state === 'playing';

                return <div className={ styles.player } key={ playerId }>

                  <div className={ styles.led } match={ isMatch.toString() } master={ isMaster.toString() } judge={ isJudge.toString() } player={ isPlayer.toString() }></div>

                  <div className={ styles.name }>{ this.state.playerProperties[playerId].username }</div>

                  <div>{ this.state.playerProperties[playerId].score }</div>

                </div>;
              })
            }
          </div>

          <div className={ styles.info }>
            <div className={ styles.button } allowed={ isAllowed.toString() } style={ {
              display: (isThisMaster && !isMatch) ? '' : 'none'
            } } onClick={ this.matchRequest.bind(this) }>{ i18n('start') }</div>

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
    zIndex: 3,
    gridArea: 'side',

    backgroundColor: colors.whiteBackground,

    maxWidth: 180,
    width: '100%',

    borderRadius: '0 15px 15px 0',
    padding: '10px 10px 20px 20px'

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
    
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

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
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  status: {
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    margin: '0 0 0 auto',
    padding: '0 0 15px 0'
  },

  players: {
    width: '100%',
    height: '100%',

    overflowX: 'hidden',
    overflowY: 'scroll',

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.lobbyScrollbar}`
    }
  },

  player: {
    display: 'grid',

    direction: locale.direction,

    alignItems: 'center',

    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto',
    gridTemplateAreas: '"status players buttons"',
    
    padding: '0 10px'
  },

  led: {
    width: '10px',
    height: '10px',
    
    borderRadius: '10px',
    
    '[match="false"][master="true"]': {
      backgroundColor: colors.master
    },

    '[match="true"][judge="true"]': {
      backgroundColor: colors.judge
    },

    '[match="true"][player="true"]': {
      backgroundColor: colors.player
    }
  },

  name: {
    padding: '5px',
    margin: '0 auto',

    wordBreak: 'break-all',
    fontSize: 'calc(6px + 0.35vw + 0.35vh)'
  },

  button: {
    display: 'flex',
    
    cursor: 'pointer',
    justifyContent: 'center',
    
    padding: '15px',
    margin: '10px 0 0 0',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    
    border: `1px ${colors.blackText} solid`,
    borderRadius: '5px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    '[allowed="false"]': {
      cursor: 'default',

      color: colors.greyText,
      backgroundColor: colors.whiteBackground,
      
      border: `1px ${colors.greyText} solid`
    }
  }
});

export default Trackbar;