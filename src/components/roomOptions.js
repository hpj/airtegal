import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import autoSize from 'autosize-input';

import i18n, { locale } from '../i18n.js';

import { socket } from '../screens/game.js';

import AutoSizeInput from '../components/autoSizeInput.js';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from '../flcss.js';

import { requestRoomData } from './roomOverlay.js';

const colors = getTheme();

const wrapperRef = createRef();

class RoomOptions extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      loadingHidden: true,
      errorMessage: '',

      dirtyOptions: undefined
    };

    // bind functions that are use as callbacks

    this.onRoomData = this.onRoomData.bind(this);

    this.clearDirtyOptions = this.clearDirtyOptions.bind(this);

    this.editRequest = this.editRequest.bind(this);
    this.matchRequest = this.matchRequest.bind(this);

    requestRoomData().then((roomData) => this.onRoomData(roomData));
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
    if (!roomData)
      return;
    
    // if dirty options is undefined
    // or if the real room options were edited
    if (!this.state.dirtyOptions || roomData.reason.message === 'options-edit')
      this.clearDirtyOptions(roomData.options);
    
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

  clearDirtyOptions(options)
  {
    this.setState({
      dirtyOptions: options
    }, () =>
    {
      // force all inputs to auto resize
      const inputs = document.querySelectorAll('#options-input');

      inputs.forEach((elem) => autoSize(elem));
    });
  }

  checkValidity()
  {
    const inputs = document.querySelectorAll('#options-input');

    for (let i = 0; i < inputs.length; i++)
    {
      // eslint-disable-next-line security/detect-object-injection
      if (!inputs[i].validity.valid)
        return false;
    }

    return true;
  }

  editRequest()
  {
    const { sendMessage } = this.props;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('edit', { options: this.state.dirtyOptions })
      .then(() =>
      {
        // hide the loading indictor
        this.loadingVisibility(false);
      })
      .catch((err) =>
      {
        // hide the loading indictor
        this.loadingVisibility(false);

        // show an error message
        this.showErrorMessage(i18n(err) || err);
      });
  }

  matchRequest()
  {
    const { sendMessage } = this.props;

    // show a loading indictor
    this.loadingVisibility(true);

    sendMessage('matchRequest')
      .then(() =>
      {
        // hide the loading indictor (after 2.5s to allow animations to end)
        setTimeout(() => this.loadingVisibility(false), 2500);
      })
      .catch((err) =>
      {
        // hide the loading indictor
        this.loadingVisibility(false);

        // show an error message
        this.showErrorMessage(i18n(err) || err);
      });
  }

  loadingVisibility(visible)
  {
    this.setState({ loadingHidden: visible = !visible });
  }

  scrollTo(options)
  {
    if (wrapperRef.current)
      wrapperRef.current.scrollTo(options);
  }

  onGameModeChange(value)
  {
    this.setState({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        gameMode: value
      }
    });
  }

  onWinMethodChange(value)
  {
    this.setState({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        winMethod: value
      }
    });
  }

  onRandosChange(value)
  {
    this.setState({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        match: {
          ...this.state.dirtyOptions.match,
          randos: value
        }
      }
    });
  }

  render()
  {
    const { dirtyOptions, options } = this.state;

    const isMaster = this.state.masterId === socket.id;

    const isValid = this.checkValidity();

    const isDirty = JSON.stringify(this.state.dirtyOptions) !== JSON.stringify(this.state.options);
    
    const isAllowed =
      process.env.NODE_ENV === 'development' ||
      (
        this.state.players &&
        this.state.players.length >= 3 &&
        this.state.roomState !== 'match'
      );

    if (!this.state.dirtyOptions)
      return <div/>;

    return (
      <div ref={ wrapperRef } className={ styles.wrapper }>

        <div style={ { display: (this.state.loadingHidden) ? 'none' : '' } } className={ styles.loading }>
          <div className={ styles.loadingSpinner }></div>
        </div>

        <div className={ styles.error } style={ { display: (this.state.errorMessage) ? '' : 'none' } } onClick={ () => this.showErrorMessage('') }>
          <div>{ this.state.errorMessage }</div>
        </div>

        <div className={ styles.container } style={ { display: (this.state.loadingHidden && !this.state.errorMessage) ? '' : 'none' } }>

          {
            this.props.children
          }

          {
            (this.state.options) ?
              <div>

                {/* Game Mode */}

                <div className={ styles.dirty } style={ { display: (isDirty) ? '' : 'none' } }>{ i18n('changes-not-applied') }</div>

                <div className={ styles.title }>{ i18n('game-mode') }</div>

                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.gameMode === 'judge' && dirtyOptions.gameMode !== options.gameMode).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.gameMode === 'judge').toString() }
                    onClick={ () => this.onGameModeChange('judge') }
                  />

                  { i18n('judge')  }
                </div>

                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.gameMode === 'democracy' && dirtyOptions.gameMode !== options.gameMode).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.gameMode === 'democracy').toString() }
                    onClick={ () => this.onGameModeChange('democracy') }
                  />

                  { i18n('democracy')  }
                </div>

                
                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.gameMode === 'king' && dirtyOptions.gameMode !== options.gameMode).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.gameMode === 'king').toString() }
                    onClick={ () => this.onGameModeChange('king') }
                  />

                  { i18n('king')  }
                </div>

                {/* Win Method */}

                <div className={ styles.title }>{ i18n('win-method') }</div>

                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.winMethod === 'points' && dirtyOptions.winMethod !== options.winMethod).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.winMethod === 'points').toString() }
                    onClick={ () => this.onWinMethodChange('points') }
                  />

                  <div>{ i18n('first-to-points-1') }</div>
                  
                  <AutoSizeInput
                    required
                    type='number'
                    min='3'
                    max='16'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.pointsToCollect }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          pointsToCollect: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('first-to-points-2') }</div>
                </div>

                
                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.winMethod === 'limited' && dirtyOptions.winMethod !== options.winMethod).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.winMethod === 'limited').toString() }
                    onClick={ () => this.onWinMethodChange('limited') }
                  />

                  <div>{ i18n('max-rounds-1') }</div>

                  <AutoSizeInput
                    required
                    type='number'
                    min='3'
                    max='30'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.maxRounds }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          maxRounds: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('max-rounds-2') }</div>
                </div>

                
                <div className={ styles.pick } master={ isMaster.toString() } dirty={ (dirtyOptions.winMethod === 'timer' && dirtyOptions.winMethod !== options.winMethod).toString() }>
                  <div
                    className={ styles.checkbox }
                    ticked={ (dirtyOptions.winMethod === 'timer').toString() }
                    onClick={ () => this.onWinMethodChange('timer') }
                  />

                  <div>{ i18n('max-time-1') }</div>

                  <AutoSizeInput
                    required
                    type='number'
                    minutes={ true }
                    min='5'
                    max='30'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.maxTime }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          maxTime: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('max-time-2') }</div>
                </div>

                {/* Match Options */}

                <div className={ styles.title }>{ i18n('match-options') }</div>

                <div className={ styles.field } dirty={ (dirtyOptions.match.maxPlayers !== options.match.maxPlayers).toString() }>
                  <AutoSizeInput
                    required
                    type='number'
                    min='3'
                    max='16'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.maxPlayers }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          maxPlayers: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('max-players') }</div>
                </div>

                <div className={ styles.field } dirty={ (dirtyOptions.round.maxTime !== options.round.maxTime).toString() }>
                  <AutoSizeInput
                    required
                    type='number'
                    minutes={ true }
                    min='1'
                    max='5'
                    maxLength={ 1 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.round.maxTime }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        round: {
                          ...dirtyOptions.round,
                          maxTime: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('round-countdown') }</div>
                </div>

                <div className={ styles.field } dirty={ (dirtyOptions.match.startingHandAmount !== options.match.startingHandAmount).toString() }>
                  <AutoSizeInput
                    required
                    type='number'
                    min='3'
                    max='12'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.startingHandAmount }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          startingHandAmount: value
                        }
                      }
                    }, resize) }
                  />

                  <div>{ i18n('hand-cap') }</div>
                </div>

                
                <div className={ styles.field } dirty={ (dirtyOptions.match.blankProbability !== options.match.blankProbability).toString() }>

                  <AutoSizeInput
                    required
                    type='number'
                    min='0'
                    max='25'
                    maxLength={ 2 }
                    id='options-input'
                    master={ isMaster.toString() }
                    className={ styles.input }
                    placeholder={ i18n('options-placeholder') }
                    value={ dirtyOptions.match.blankProbability }
                    onUpdate={ (value, resize) => this.setState({
                      dirtyOptions: {
                        ...dirtyOptions,
                        match: {
                          ...dirtyOptions.match,
                          blankProbability: value
                        }
                      }
                    }, resize) }
                  />

                  <div className={ styles.inputSuffix }>{ '%' }</div>
                  <div>{ i18n('blank-probability') }</div>
                </div>

                <div className={ styles.field } master={ isMaster.toString() } dirty={ (dirtyOptions.match.randos !== options.match.randos).toString() }>
                  <div style={ { margin: '0 5px' } }>{ i18n('randos') }</div>

                  <div className={ styles.choice } choice={ (dirtyOptions.match.randos === true).toString() } onClick={ () => this.onRandosChange(true) }>{ i18n('yes') }</div>
                  <div className={ styles.choice } choice={ (dirtyOptions.match.randos === false).toString() } onClick={ () => this.onRandosChange(false) }>{ i18n('no') }</div>
                </div>

                {/* Card Packs */}

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
                
                <div
                  className={ styles.button }
                  master={ isMaster.toString() }
                  valid={ isValid.toString() }
                  allowed={ isDirty.toString() }
                  onClick={ this.editRequest }>
                  { i18n('apply') }
                </div>

                <div
                  className={ styles.button }
                  master={ isMaster.toString() }
                  allowed={ isAllowed.toString() }
                  onClick={ this.matchRequest }>
                  { i18n('start') }
                </div>
              </div> : <div/>
          }
        </div>
      </div>
    );
  }
}

RoomOptions.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node ]),
  sendMessage: PropTypes.func.isRequired
};

const styles = createStyle({
  wrapper: {
    position: 'absolute',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    userSelect: 'none',
    overflowX: 'hidden',
    overflowY: 'scroll',

    fontWeight: '700',
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    width: '100%',
    height: '100%',

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

  container: {
    direction: locale.direction,
    maxWidth: '80%',
    margin: '0 auto',

    '@media screen and (max-width: 470px)': {
      maxWidth: 'unset'
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
    '@media screen and (max-width: 1080px)': {
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
    })
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
    margin: '15px auto 15px auto',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,
    
    border: `1px ${colors.blackText} solid`,
    borderRadius: '5px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.blackBackground
    },

    '[master="false"]': {
      display: 'none'
    },

    '[allowed="false"]': {
      pointerEvents: 'none',

      color: colors.greyText,
      backgroundColor: colors.whiteBackground,
      
      border: `1px ${colors.greyText} solid`
    },

    '[dirty="true"][valid="false"]': {
      pointerEvents: 'none',

      color: colors.whiteText,
      backgroundColor: colors.red,
      
      border: `1px ${colors.red} solid`
    }
  },

  dirty: {
    textAlign: 'center',
    fontStyle: 'italic',
    
    padding: '10px'
  },

  title: {
    padding: '20px 25px'
  },

  pick: {
    display: 'flex',
    alignItems: 'center',

    padding: '0 25px 8px 25px',

    '[dirty="true"]': {
      fontStyle: 'italic',

      ':after': {
        display: 'block',
        content: '"*"'
      }
    },

    '[master="false"] > div': {
      pointerEvents: 'none'
    },

    '[master="false"] > div:after': {
      width: '20px',
      height: '20px',

      borderRadius: 0
    }
  },

  checkbox: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    width: '20px',
    height: '20px',

    borderRadius: '5px',
    border: `2px solid ${colors.blackText}`,

    margin: '0 10px',

    ':after':
    {
      display: 'block',
      content: '""',

      width: '10px',
      height: '10px',

      backgroundColor: colors.blackText,
      borderRadius: '10px'
    },

    '[ticked="false"]:after':
    {
      display: 'none'
    }
  },

  field: {
    display: 'flex',
    alignItems: 'center',

    padding: '0 25px 8px 25px',

    '[dirty="true"]': {
      fontStyle: 'italic',

      ':after': {
        display: 'block',
        content: '"*"'
      }
    }
  },

  choice: {
    margin: '0 5px',
    
    '[choice="true"]': {
      borderColor: colors.blackText,
      borderBottom: '2px solid',

      margin: '0 5px -2px 5px'
    }
  },

  input: {
    MozAppearance: 'textfield',
    appearance: 'textfield',

    direction: 'ltr',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: '0 5px -2px 5px',
    padding: 0,
    border: 0,

    borderColor: colors.blackText,
    borderBottom: '2px solid',

    '::placeholder': {
      color: colors.red
    },

    ':focus': {
      'outline': 'none'
    },

    ':not(:valid)':
    {
      color: colors.red,
      borderColor: colors.red
    },

    '[master="false"]':
    {
      borderBottom: 0,
      pointerEvents: 'none'
    },

    '::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    },

    '::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  },

  inputSuffix: {
    margin: (locale.direction === 'ltr') ? '0 5px -2px -5px': '0 -5px -2px 5px',

    borderBottom: '2px solid',
    borderColor: colors.blackText,

    'input:placeholder-show ~ %this': {
      color: colors.red,
      borderColor: colors.red
    },

    'input:not(:valid) ~ %this': {
      color: colors.red,
      borderColor: colors.red
    },

    'input[master="false"] ~ %this': {
      borderBottom: 0
    }
  },

  packs: {
    display: 'grid',
    
    gridTemplateColumns: 'repeat(auto-fill, calc(80px + 1vw + 1vh))',
    justifyContent: 'space-around',
    
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

    lineHeight: 'calc(15px + 0.5vw + 0.5vh)',

    width: 'min-content',
    height: '100%'
  }
});

export default RoomOptions;