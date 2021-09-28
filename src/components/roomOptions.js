import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import CheckIcon from 'mdi-react/CheckIcon';
import WaitingIcon from 'mdi-react/LoadingIcon';

import autoSize from 'autosize-input';

import features from '../flags.js';

import { sendMessage } from '../utils.js';

import { StoreComponent } from '../store.js';

import { translation, withTranslation } from '../i18n.js';

import { socket } from '../screens/game.js';

import Select from './select.js';

import AutoSizeInput from '../components/autoSizeInput.js';

import MatchHighlight from './matchHighlights';

import getTheme, { opacity } from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

const colors = getTheme();

const wrapperRef = createRef();

/**
* @type { React.RefObject<MatchHighlight> }
*/
const highlightsRef = createRef();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @extends {React.Component<{}, State>}
*/
class RoomOptions extends StoreComponent
{
  constructor()
  {
    super({
      optionsError: '',
      optionsLoading: false,
      dirtyOptions: undefined
    });

    this.editRequest = this.editRequest.bind(this);
    this.matchRequest = this.matchRequest.bind(this);
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData ||
      changes?.optionsError ||
      changes?.optionsLoading ||
      changes?.dirtyOptions
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    const state = {};

    if (!roomData)
      return;

    const master = roomData.master === socket.id;

    // if dirty options is undefined
    if (master && !this.state.dirtyOptions)
      state.dirtyOptions = roomData.options;
      
    if (!master)
      state.dirtyOptions = roomData.options;

    return state;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } state
  * @param { { roomData: import('./roomOverlay').RoomData } } old
  */
  stateDidChange(state, old)
  {
    const master = state.roomData?.master === socket.id;

    if (JSON.stringify(state.dirtyOptions) !== JSON.stringify(old.dirtyOptions))
    {
      // force all inputs to auto resize
      const inputs = document.querySelectorAll('#room-options-input');

      inputs.forEach(e => autoSize(e));

      if (!master && state.dirtyOptions && old.dirtyOptions)
        this.props.addNotification?.(translation('room-edited'));
    }
  }

  editRequest()
  {
    this.store.set({ optionsLoading: true });

    sendMessage('edit', { options: this.state.dirtyOptions })
      .then(() =>
      {
        // hide the loading indictor
        this.store.set({ optionsLoading: false });
      })
      .catch((err) =>
      {
        this.store.set({
          optionsLoading: false,
          optionsError: translation(err) ?? err
        });
      });
  }
  
  matchRequest()
  {
    // show a loading indictor
    this.store.set({ optionsLoading: true });

    sendMessage('matchRequest', undefined, 60000)
      .then(() =>
      {
        // hide the loading indictor
        // but after 2.5s to allow game's overlay animations to end
        setTimeout(() =>
        {
          this.store.set({ optionsLoading: false });

          highlightsRef.current?.clearEntries();
        }, 2500);
      })
      .catch(err =>
      {
        this.store.set({
          optionsLoading: false,
          optionsError: translation(err) ?? err
        });
      });
  }

  scrollTo(options)
  {
    if (wrapperRef.current)
      wrapperRef.current.scrollTo(options);
  }

  onGameModeChange(value)
  {
    this.store.set({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        gameMode: value
      }
    });
  }

  onEndCondChange(value)
  {
    this.store.set({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        endCondition: value
      }
    });
  }

  onRandosChange(value)
  {
    this.store.set({
      dirtyOptions: {
        ...this.state.dirtyOptions,
        randos: value
      }
    });
  }

  render()
  {
    const { locale, translation } = this.props;

    const {
      roomData,
      optionsLoading,
      optionsError,
      dirtyOptions
    } = this.state;

    const options = roomData?.options;

    const isMaster = roomData?.master === socket.id;
    const isPlayer = roomData?.playerProperties[socket.id] !== undefined;

    const isDirty = JSON.stringify(dirtyOptions) !== JSON.stringify(options);

    const master = roomData?.playerProperties[roomData?.master ?? roomData?.players[0]]?.username;
    
    if (!dirtyOptions)
      return <div/>;

    const gameModes = [];

    if (features.kuruit)
      gameModes.push({ label: translation('kuruit'), value: 'kuruit', group: translation('free-for-all') });

    const GameModes = () =>
    {
      return <div>
        <div className={ styles.title }>{ translation('game-mode') }</div>

        {
          isMaster ?
            <Select
              id={ 'room-options-select-game-mode' }

              className={ dirtyOptions.gameMode !== options.gameMode ? styles.selectDirty : styles.select }

              optionsIdPrefix={ 'room-options-game-mode' }
          
              defaultIndex={ 0 }
              options={ gameModes }

              onChange={ mode => this.onGameModeChange(mode) }
            /> :
            <div className={ styles.gameMode }>{ translation(dirtyOptions.gameMode) }</div>
        }
      </div>;
    };

    const KuruitOptions = () =>
    {
      return <div>
        <div className={ styles.title }>{ translation('match-options') }</div>

        <div className={ styles.pick } data-master={ isMaster } data-dirty={ dirtyOptions.endCondition === 'limited' && (dirtyOptions.endCondition !== options.endCondition || options.maxRounds !== dirtyOptions.maxRounds) }>
          <div
            id={ 'room-options-kuruit-limited' }
            className={ styles.checkbox }
            data-ticked={ dirtyOptions.endCondition === 'limited' }
            onClick={ () => this.onEndCondChange('limited') }
          >
            <CheckIcon className={ styles.mark }/>
          </div>

          <div>{ translation('after') }</div>

          <AutoSizeInput
            required
            type={ 'number' }
            min={ '3' }
            max={ '30' }
            maxLength={ 2 }
            id={ 'room-options-input' }
            data-master={ isMaster }
            className={ styles.input }
            placeholder={ translation('options-placeholder') }
            value={ dirtyOptions.maxRounds }
            onUpdate={ (value, resize) => this.store.set({
              dirtyOptions: {
                ...dirtyOptions,
                maxRounds: value
              }
            }, resize) }
          />

          <div>{ translation('max-rounds', dirtyOptions.maxRounds) }</div>
        </div>

        <div className={ styles.pick } data-master={ isMaster } data-dirty={ dirtyOptions.endCondition === 'timer' && (dirtyOptions.endCondition !== options.endCondition || options.maxTime !== dirtyOptions.maxTime) }>
          <div
            id={ 'room-options-kuruit-timer' }
            className={ styles.checkbox }
            data-ticked={ dirtyOptions.endCondition === 'timer' }
            onClick={ () => this.onEndCondChange('timer') }
          >
            <CheckIcon className={ styles.mark }/>
          </div>

          <div>{ translation('after') }</div>

          <AutoSizeInput
            required
            type={ 'number' }
            minutes={ true }
            min={ '5' }
            max={ '30' }
            maxLength={ 2 }
            id={ 'room-options-input' }
            data-master={ isMaster }
            className={ styles.input }
            placeholder={ translation('options-placeholder') }
            value={ dirtyOptions.maxTime }
            onUpdate={ (value, resize) => this.store.set({
              dirtyOptions: {
                ...dirtyOptions,
                maxTime: value
              }
            }, resize) }
          />

          <div>{ translation('max-time', dirtyOptions.maxTime / 60 / 1000) }</div>
        </div>

        <div style={ { margin: '5px 35px 5px' } }>
          <div className={ styles.field } data-dirty={ dirtyOptions.maxPlayers !== options.maxPlayers }>
            <AutoSizeInput
              required
              type={ 'number' }
              min={ '3' }
              max={ '16' }
              maxLength={ 2 }
              id={ 'room-options-input' }
              data-master={ isMaster }
              className={ styles.input }
              placeholder={ translation('options-placeholder') }
              value={ dirtyOptions.maxPlayers }
              onUpdate={ (value, resize) => this.store.set({
                dirtyOptions: {
                  ...dirtyOptions,
                  maxPlayers: value
                }
              }, resize) }
            />

            <div>{ translation('max-players') }</div>
          </div>

          <div className={ styles.field } data-dirty={ dirtyOptions.roundTime !== options.roundTime }>
            <AutoSizeInput
              required
              type={ 'number' }
              minutes={ true }
              min={ '1' }
              max={ '5' }
              maxLength={ 1 }
              id={ 'room-options-input' }
              data-master={ isMaster }
              className={ styles.input }
              placeholder={ translation('options-placeholder') }
              value={ dirtyOptions.roundTime }
              onUpdate={ (value, resize) => this.store.set({
                dirtyOptions: {
                  ...dirtyOptions,
                  roundTime: value
                }
              }, resize) }
            />

            <div>{ translation('round-countdown') }</div>
          </div>

          <div className={ styles.field } data-dirty={ dirtyOptions.startingHandAmount !== options.startingHandAmount }>
            <AutoSizeInput
              required
              type={ 'number' }
              min={ '3' }
              max={ '12' }
              maxLength={ 2 }
              id={ 'room-options-input' }
              data-master={ isMaster }
              className={ styles.input }
              placeholder={ translation('options-placeholder') }
              value={ dirtyOptions.startingHandAmount }
              onUpdate={ (value, resize) => this.store.set({
                dirtyOptions: {
                  ...dirtyOptions,
                  startingHandAmount: value
                }
              }, resize) }
            />

            <div>{ translation('hand-cap') }</div>
          </div>

          <div className={ styles.field } data-dirty={ dirtyOptions.blankProbability !== options.blankProbability }>

            <AutoSizeInput
              required
              type={ 'number' }
              min={ '0' }
              max={ '25' }
              maxLength={ 2 }
              id={ 'room-options-input' }
              data-master={ isMaster }
              className={ styles.input }
              placeholder={ translation('options-placeholder') }
              value={ dirtyOptions.blankProbability }
              onUpdate={ (value, resize) => this.store.set({
                dirtyOptions: {
                  ...dirtyOptions,
                  blankProbability: value
                }
              }, resize) }
            />

            <div suffix={ 'true' } style={ { margin: locale.direction === 'ltr' ? '0 5px 0 -5px': '0 -5px 0 5px' } }>%</div>
            <div>{ translation('blank-probability') }</div>
          </div>
        
          {
            features.randos ?
              <div className={ styles.field } style={ { margin: '0 5px' } } data-dirty={ dirtyOptions.randos !== options.randos }>
                <div>{ translation('randos') }</div>

                <div id={ 'room-options-rando-yes' } className={ styles.choice } data-choice={ dirtyOptions.randos === true } data-master={ isMaster } onClick={ () => this.onRandosChange(true) }>{ translation('yes') }</div>
                <div id={ 'room-options-rando-no' } className={ styles.choice } data-choice={ dirtyOptions.randos === false } data-master={ isMaster } onClick={ () => this.onRandosChange(false) }>{ translation('no') }</div>
              </div> : undefined
          }
        </div>
      </div>;
    };

    let modeOptions;

    if (dirtyOptions.gameMode === 'kuruit')
      modeOptions = KuruitOptions;

    return <div ref={ wrapperRef } className={ styles.wrapper }>

      {
        optionsLoading ? <div className={ styles.loading }>
          <div/>
        </div> : undefined
      }

      {
        optionsError ? <div className={ styles.error } onClick={ () => this.stote.set({ optionsError: '' }) }>
          { optionsError }
        </div> : undefined
      }

      <div className={ styles.container } style={ { direction: locale.direction } }>

        {
          this.props.children
        }

        <MatchHighlight ref={ highlightsRef }/>

        {
          (!options) ? <div/> :
            <div>
 
              {/* Game Mode Selector */}

              { GameModes() }

              { /* Game Mode Options */ }
                
              { modeOptions() }

              {/* Apply Button */}

              {
                !isMaster && isPlayer ? <div className={ styles.wait }>
                  <div>{ translation('wait-for-room-master', master) }</div>
                  <WaitingIcon/>
                </div> : undefined
              }

              {
                isDirty && isMaster ? <div
                  id={ 'room-options-apply' }
                  className={ styles.button }
                  onClick={ this.editRequest }>
                  { translation('apply') }
                </div> : undefined
              }

              {/* Start Button */}

              {
                !isDirty && isMaster ? <div
                  id={ 'room-options-start' }
                  className={ styles.button }
                  onClick={ this.matchRequest }>
                  { translation('start') }
                </div> : undefined
              }
            </div>
        }
      </div>
    </div>;
  }
}

RoomOptions.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node ]),
  addNotification: PropTypes.func.isRequired
};

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
    maxWidth: '80%',
    margin: '0 auto',

    '@media screen and (max-width: 470px)': {
      maxWidth: 'unset'
    }
  },
  
  loading: {
    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
    height: '100%',

    backgroundColor: colors.whiteBackground,

    '> div': {
      width: '30px',
      height: '30px',

      border: `10px ${colors.blackText} solid`,
      animation: waitingAnimation
    }
  },

  error: {
    extend: 'loading',
    cursor: 'pointer',

    color: colors.blackText,

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif'
  },

  button: {
    display: 'flex',
    
    cursor: 'pointer',
    justifyContent: 'center',
    
    width: '50%',

    padding: '10px',
    margin: '25px auto 25px',

    color: colors.blackText,
    border: `1px solid ${colors.blackText}`,

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  title: {
    padding: '20px 25px'
  },

  wait: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    width: 'fit-content',
    
    margin: '0 auto',
    padding: '25px 25px 5px',

    '> svg': {
      width: '24px',
      height: '24px',
      color: colors.blackText,
      animation: waitingAnimation,
      margin: '10px'
    }
  },


  pick: {
    display: 'flex',
    alignItems: 'center',

    padding: '0 25px 15px',

    '[data-dirty="true"]': {
      fontStyle: 'italic',

      ':after': {
        content: '"*"'
      }
    },

    '[data-master="false"] > div': {
      pointerEvents: 'none'
    }
  },

  checkbox: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',

    color: colors.blackText,
    backgroundColor: opacity(colors.greyText, 0.25),

    width: '20px',
    height: '20px',

    borderRadius: '3px',
    margin: '0 10px',

    '[data-ticked="false"] > svg':
    {
      opacity: 0
    }
  },

  mark: {
    width: '16px',
    height: '16px',
    color: colors.blackText
  },

  select: {
    margin: '0 15px 8px'
  },

  selectDirty: {
    extend: 'select',

    '> div:first-child': {
      display: 'flex',
      alignItems: 'center',
      color: 'inherit',
      fontStyle: 'italic'
    },

    '> div:first-child:after': {
      display: 'block',
      content: '"*"'
    }
  },

  field: {
    display: 'flex',
    alignItems: 'center',

    padding: '0 25px 12px',

    '[data-dirty="true"]': {
      fontStyle: 'italic',

      ':after': {
        content: '"*"'
      }
    }
  },

  gameMode: {
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    margin: '0 25px 8px 25px'
  },

  choice: {
    cursor: 'pointer',
    
    margin: '0 5px',
    
    '[data-choice="true"]': {
      borderColor: colors.blackText,
      borderBottom: '2px solid',
      pointerEvents: 'none',

      margin: '0 5px -2px 5px'
    },

    '[data-master="false"]':
    {
      pointerEvents: 'none'
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
      color: colors.error
    },

    ':focus': {
      'outline': 'none'
    },

    ':not(:valid)':
    {
      color: colors.error,
      borderColor: colors.error
    },

    '[data-master="false"]':
    {
      borderBottom: 0,
      pointerEvents: 'none'
    },

    ':not(:valid) + div[suffix]': {
      color: colors.error,
      borderColor: colors.error
    },

    '[data-master="false"] + div[suffix]':
    {
      borderBottom: 0
    },

    '::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    },

    '::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  }
});

export default withTranslation(RoomOptions);