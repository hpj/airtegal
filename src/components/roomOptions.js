import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';
import CopyIcon from 'mdi-react/ClipboardTextIcon';

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
      optionsUrlCopied: false,
      dirtyOptions: undefined
    });

    this.copy = this.copy.bind(this);

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
      changes?.optionsUrlCopied ||
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

    // reset a few states on room state changes
    if (this.state.roomData?.state !== roomData.state)
    {
      wrapperRef.current?.scrollTo({ top: 0 });
      
      state.optionsUrlCopied = false;
    }

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

  async matchRequest()
  {
    // show a loading indictor
    this.store.set({ optionsLoading: true });

    const { roomData, dirtyOptions } = this.state;

    const dirty = JSON.stringify(dirtyOptions) !== JSON.stringify(roomData?.options);

    try
    {
      if (dirty)
        await sendMessage('edit', { options: dirtyOptions });

      await sendMessage('matchRequest', undefined, 60000);

      // hide the loading indictor
      // but after 2.5s to allow game's overlay animations to end
      setTimeout(() =>
      {
        this.store.set({ optionsLoading: false });

        highlightsRef.current?.clearEntries();
      }, 2500);
    }
    catch (err)
    {
      this.store.set({
        optionsLoading: false,
        optionsError: translation(err) ?? err
      });
    }
  }

  // istanbul ignore next
  share()
  {
    const { roomData } = this.state;

    const url = `${location.protocol}//${location.host}${location.pathname}?join=${roomData?.id}`;

    navigator.share({
      url,
      title: 'Share Room URL',
      text: translation('join-me')
    }).catch(console.warn);
  }

  // istanbul ignore next
  async copy()
  {
    const { roomData } = this.state;

    const url = `${location.protocol}//${location.host}${location.pathname}?join=${roomData?.id}`;

    try
    {
      await navigator.clipboard?.writeText(url);

      this.store.set({ optionsUrlCopied: true });

      clearTimeout(this.copyTimeout);

      this.copyTimeout =
        setTimeout(() => this.store.set({ optionsUrlCopied: false }), 3000);
    }
    catch (err)
    {
      console.warn(err);
    }
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
      roomData, dirtyOptions,
      optionsLoading, optionsError,
      optionsUrlCopied
    } = this.state;

    const options = roomData?.options;

    const isMaster = roomData?.master === socket.id;

    const master = roomData?.playerProperties[roomData?.master ?? roomData?.players[0]]?.username;
    
    const url = `${location.protocol}//${location.host}${location.pathname}?join=${roomData?.id}`;

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

    const RoomUrl = () =>
    {
      return <>
        <div className={ styles.title }>{ translation('room-url') }</div>

        <div className={ styles.url }>
          { url }
        </div>

        <div className={ styles.buttons }>
          <div className={ styles.misc } onClick={ this.copy } data-copied={ optionsUrlCopied }>
            <div>{ translation('copy') }</div>
            <CopyIcon/>
            <CheckIcon/>
          </div>

          {
            !navigator.share ?
              <div className={ styles.misc } onClick={ this.share }>
                <div>{ translation('share') }</div>
                <ShareIcon/>
              </div> : undefined
          }
        </div>
      </>;
    };

    const KuruitOptions = () =>
    {
      return <div>
        <div className={ styles.title }>{ `${translation('options')} ${translation('kuruit')}` }</div>

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

        {
          features.randos ?
            <div className={ styles.pick } data-master={ isMaster } data-dirty={ dirtyOptions.randos !== options.randos }>
              <div
                id={ 'room-options-randos' }
                className={ styles.checkbox }
                data-ticked={ dirtyOptions.randos }
                onClick={ () => this.onRandosChange(!dirtyOptions.randos) }
              >
                <CheckIcon className={ styles.mark }/>
              </div>

              <div>{ translation('randos') }</div>
            </div> : undefined
        }

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
            <div style={ { margin: locale.direction === 'ltr' ? '0 5px 0 -5px': '0 -5px 0 5px' } } data-suffix={ true }>%</div>
            <div>{ translation('blank-probability') }</div>
          </div>
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
          options ?
            <>
              <MatchHighlight ref={ highlightsRef }/>

              { GameModes() }

              { RoomUrl() }

              { modeOptions() }

              {/* Start Button */}

              {
                isMaster ? <div id={ 'room-options-start' } className={ styles.start } onClick={ this.matchRequest }>
                  <div>{ translation('start') }</div>
                </div> : <div className={ styles.wait }>
                  <div>{ translation('wait-for-room-master', master) }</div>
                  <WaitingIcon/>
                </div>
              }
            </> : undefined
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

  url: {
    userSelect: 'text',

    color: colors.blackText,

    padding: '10px 25px',

    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  buttons: {
    display: 'flex',
    width: 'min-content',

    columnGap: '15px',

    padding: '0px 10px 10px'
  },

  button: {
    display: 'flex',
    position: 'relative',
    cursor: 'pointer',

    alignItems: 'center',

    color: colors.blackText,

    whiteSpace: 'nowrap',

    ':active': {
      transform: 'scale(0.95)'
    }
  },

  misc: {
    'extend': 'button',
    
    padding: '10px 0',

    '> *': {
      opacity: 1,
      transition: 'opacity 0.15s ease-in'
    },

    '> :nth-child(1)': {
      padding: '0 15px'
    },

    '> :nth-child(2)': {
      width: '16px',
      height: '16px',
      margin: '0 15px'
    },

    '> :nth-child(3)': {
      opacity: 0,
      position: 'absolute',

      left: 0,
      width: '100%',
      height: '18px'
    },

    '[data-copied="true"]': {
      '> *': {
        opacity: 0
      },
      '> :nth-child(3)': {
        opacity: 1
      }
    }
  },

  start: {
    'extend': 'button',
    justifyContent: 'center',

    border: '1px solid',
    borderColor: opacity(colors.greyText, 0.25),

    padding: '15px 10px',
    margin: '25px 35px 25px'
  },

  title: {
    opacity: 0.5,
    fontSize: 'calc(8px + 0.15vw + 0.15vh)',
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

    padding: '0 25px 10px',

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

  input: {
    MozAppearance: 'textfield',
    appearance: 'textfield',

    direction: 'ltr',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    fontWeight: '700',
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    margin: '0 5px 0',
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

    '+ [data-suffix]': {
      fontSize: 'calc(11px + 0.25vw + 0.25vh)',
      borderColor: colors.blackText,
      borderBottom: '2px solid'
    },

    ':not(:valid) + [data-suffix]': {
      color: colors.error,
      borderColor: colors.error
    },

    '[data-master="false"] + [data-suffix]':
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