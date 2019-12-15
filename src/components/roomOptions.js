import React from 'react';

import PropTypes from 'prop-types';

import i18n from '../i18n.js';

import { socket } from '../screens/game.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

const colors = getTheme();

class RoomOptions extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      loadingHidden: true,
      errorMessage: ''
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
    this.setState({
      options: roomData.options,
      masterId: roomData.master
    });
  }

  showErrorMessage(err)
  {
    this.setState({ errorMessage: err });
  }

  matchRequest()
  {
    // show a loading indictor
    this.loadingVisibility(true);

    this.props.sendMessage('matchRequest')
      .then(() =>
      {
        // hide the loading indictor
        setTimeout(() => this.loadingVisibility(false), 2500);
      })
      .catch((err) =>
      {
        // hide the loading indictor (after 2.5s to allow animations to end)
        this.loadingVisibility(false);

        // show an error message
        this.showErrorMessage(i18n(err) || err);
      });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  render()
  {
    const isThisMaster = this.state.masterId === socket.id;
    
    const isAllowed =
      process.env.NODE_ENV === 'development' ||
      (
        this.state.players &&
        this.state.players.length >= 3 &&
        this.state.roomState !== 'match'
      );

    return (
      <div className={ styles.container }>

        <div style={ {
          display: (this.state.loadingHidden) ? 'none' : ''
        } } className={ styles.loading }
        >
          <div className={ styles.loadingSpinner }></div>
        </div>

        <div className={ styles.error } style={ {
          display: (this.state.errorMessage) ? '' : 'none'
        } } onClick={ () => this.showErrorMessage('') }>
          <div>{ this.state.errorMessage }</div>
        </div>

        {/* <div style={ { overflow: 'hidden', fontWeight: 100 } }>{ JSON.stringify(this.state.options) }</div> */}

        {/* <div>Win Method</div>
        <div>First to 10 Points</div>

        <div>Round Options</div>
        <div>2:00 Countdown</div>

        <div>Packs</div>
        <div>Default</div> */}

        <div className={ styles.button } allowed={ isAllowed.toString() } style={ {
          display: (isThisMaster) ? '' : 'none'
        } } onClick={ this.matchRequest.bind(this) }>{ i18n('start') }</div>
      </div>
    );
  }
}

RoomOptions.propTypes = {
  sendMessage: PropTypes.func.isRequired
};

const styles = createStyle({
  container: {
    position: 'relative',
    backgroundColor: colors.whiteBackground,

    userSelect: 'none',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    top: '-200%',
    width: '100%',
    height: '100%',

    padding: '0 0 0 30px',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      padding: '30px 15px 15px 15px',

      width: 'calc(100% - 30px)',
      height: 'calc(100% - 45px)'
    }
  },

  loading: {
    zIndex: 1,

    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    justifyContent: 'center',
    
    backgroundColor: colors.whiteBackground,

    top: 0,
    width: '100%',
    height: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      top: 'auto',
      width: 'calc(100% - 30px)',
      height: 'calc(100% - 45px)'
    }
  },

  loadingSpinner: {
    backgroundColor: 'transparent',

    paddingBottom: '30px',
    width: '30px',

    border: `10px ${colors.blackText} solid`,

    animation: createAnimation({
      keyframes: `
      from { transform:rotate(0deg); }
      to { transform:rotate(360deg); }
      `,
      duration: '2s',
      timingFunction: 'linear',
      iterationCount: 'infinite'
    }),

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {

    }
  },

  error: {
    extend: 'loading',
    cursor: 'pointer',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    textTransform: 'capitalize',

    fontSize: 'calc(6px + 0.4vw + 0.4vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  button: {
    display: 'flex',
    
    cursor: 'pointer',
    justifyContent: 'center',
    
    width: '50%',
    padding: '10px',
    margin: '10px auto 0 auto',

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

export default RoomOptions;