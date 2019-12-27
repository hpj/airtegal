import React from 'react';

import PropTypes from 'prop-types';

import i18n, { locale } from '../i18n.js';

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
      players: roomData.players,
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

  formatMs(milliseconds)
  {
    const minutes = Math.floor(milliseconds / 60000);

    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);

    return `${minutes}:${(seconds < 10) ? '0' : ''}${seconds}`;
  }

  render()
  {
    if (!this.state.options || !this.state.players)
      return <div/>;

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

        <div className={ styles.title }>{ i18n('game-mode') }</div>

        <div className={ styles.pick }>
          <div><div/></div>
          <div>{ i18n('judgement-mode') }</div>
        </div>

        <div className={ styles.title }>{ i18n('win-method') }</div>

        <div className={ styles.pick }>
          <div><div/></div>

          <div style={ { padding: 0 } } className={ styles.field }>

            <div>{ i18n('first-to-points-1') }</div>
            <div allowed={ isThisMaster.toString() } className={ styles.input }>{ this.state.options.match.pointsToCollect }</div>
            <div>{ i18n('first-to-points-2') }</div>

          </div>
        </div>

        <div className={ styles.title }>{ i18n('round-options') }</div>

        <div className={ styles.field }>

          <div allowed={ isThisMaster.toString() } className={ styles.input }>{ `${this.formatMs(this.state.options.round.maxTime)}` }</div>
          <div>{ i18n('round-countdown') }</div>

        </div>

        <div className={ styles.title }>{ i18n('card-packs') }</div>

        <div className={ styles.packs }>
          {
            this.state.options.match.availablePacks.map((pack) =>
            {
              return <div key={ pack.id } style={ {
                color: pack.foreground_color,
                backgroundImage: `url(${pack.background_url})`,
                backgroundColor: pack.background_url
              } } className={ styles.pack }>
                <div className={ styles.packName }>
                  { pack.display_name }
                </div>
              </div>;
            })
          }
        </div>

        <div className={ styles.start } allowed={ isAllowed.toString() } style={ {
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
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    userSelect: 'none',
    overflowX: 'hidden',
    overflowY: 'scroll',

    fontWeight: '700',
    fontSize: 'calc(6px + 0.5vw + 0.5vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    top: '-200%',
    maxWidth: '80%',
    width: 'calc(100% - 38px)',
    height: '100%',

    margin: '0 auto',
    padding: '0 0 0 30px',

    // for the portrait overlay
    '@media screen and (max-width: 980px)': {
      margin: '15px auto 0 auto',
      padding: '30px 15px 15px 15px',

      width: 'calc(100% - 30px)',
      height: 'calc(100% - 60px)'
    },

    '::-webkit-scrollbar':
    {
      width: '8px'
    },

    '::-webkit-scrollbar-thumb':
    {
      borderRadius: '8px',
      boxShadow: `inset 0 0 8px 8px ${colors.optionsScrollbar}`
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
      height: 'calc(100% - 60px)'
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

  start: {
    display: 'flex',
    
    cursor: 'pointer',
    justifyContent: 'center',
    
    width: '50%',

    padding: '10px',
    margin: '35px auto 15px auto',

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
  },

  title: {
    fontSize: 'calc(8px + 0.5vw + 0.5vh)',

    direction: locale.direction,

    padding: '35px 35px 20px 35px'
  },

  pick: {
    display: 'flex',
    alignItems: 'center',

    direction: locale.direction,

    padding: '0 25px',

    '>:nth-child(1)': {
      display: 'flex',

      justifyContent: 'center',
      alignItems: 'center',

      width: '20px',
      height: '20px',

      borderRadius: '5px',
      border: `2px solid ${colors.blackText}`,

      margin: '0 10px',

      '> *': {
        backgroundColor: colors.blackText,

        borderRadius: '10px',
        width: '10px',
        height: '10px'
      }
    }
  },

  field: {
    display: 'flex',
    alignItems: 'center',

    direction: locale.direction,

    padding: '0 30px'
  },

  input: {
    borderBottom: `2px ${colors.blackText} solid`,
    margin: '0 5px',

    '[allowed="false"]': {
      borderBottom: 0
    }
  },

  packs: {
    display: 'grid',
    
    gridTemplateColumns: 'repeat(auto-fill, calc(80px + 1vw + 1vh))',
    justifyContent: 'space-around',
    
    direction: locale.direction,

    padding: '0 35px',
    gridGap: '0 5px',

    '> *': {
      width: 'calc(80px + 1vw + 1vh)',
      margin: '0 0 10px 0'
    }
  },

  pack: {
    position: 'relative',

    display: 'flex',
    justifyContent: 'center',

    height: 'fit-content',

    color: colors.whiteText,
    backgroundColor: colors.blackBackground,

    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',

    borderRadius: '10px',

    ':before': {
      content: '""',
      display: 'block',
    
      paddingBottom: '135%'
    }
  },

  packName: {
    position: 'absolute',

    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',

    width: 'min-content',
    height: '100%'
  }
});

export default RoomOptions;