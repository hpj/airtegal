import React, { createRef } from 'react';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { sendMessage } from '../utils.js';

import { socket, shareRef } from '../screens/game.js';

import getTheme from '../colors.js';

import { withTranslation } from '../i18n.js';

import Interactable from './interactable.js';

import Card from './card.js';

import Box from './box.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const overlayRef = createRef();

/**
* @typedef { object } State
* @prop { import('./roomOverlay').RoomData } roomData
* @prop { import('./roomOverlay').RoomData['field'] } field
* @extends {React.Component<{}, State>}
*/
class FieldOverlay extends StoreComponent
{
  constructor()
  {
    super({
      fieldHidden: true
    });
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } changes
  */
  stateWhitelist(changes)
  {
    if (
      changes?.roomData ||
      changes?.fieldHidden ||
      changes?.fieldVisible
    )
      return true;
  }

  /**
  * @param { { roomData: import('./roomOverlay').RoomData } } param0
  */
  stateWillChange({ roomData })
  {
    const state = {};

    state.fieldVisible = roomData?.state === 'match';

    return state;
  }

  stateDidChange(state)
  {
    if (state.fieldVisible && overlayRef.current?.lastSnapIndex === 0)
      overlayRef.current.snapTo({ index: 1 });
    else if (!state.fieldVisible && overlayRef.current?.lastSnapIndex >= 1)
      overlayRef.current.snapTo({ index: 0 });
  }

  submit(index, content, allowed)
  {
    if (!allowed)
      return;
      
    const { options, field } = this.state.roomData;
    
    sendMessage('matchLogic', { index, content }).then(() =>
    {
      // store the entry for the match highlights

      if (options.gameMode === 'kuruit')
      {
        const { entries } = this.state;
  
        entries.push([
          field[0].cards[0].content,
          // eslint-disable-next-line security/detect-object-injection
          ...field[index].cards.map(c => c.content)
        ]);

        this.store.set({ entries });
      }
    });
  }

  /**
  * @param { number } index
  */
  share(index)
  {
    const { options, field } = this.state.roomData;

    if (options.gameMode === 'qassa')
    {
      shareRef.current?.shareEntry({
        template: field[0]?.story?.template?.replace(/\\n/g, '\n'),
        items: field[0]?.story?.items?.map(i => i.value)
      });
    }
    else if (options.gameMode === 'kuruit')
    {
      shareRef.current?.shareEntry({
        black: field[0]?.cards[0]?.content,
        // eslint-disable-next-line security/detect-object-injection
        white: field[index]?.cards?.map(c => c.content)
      });
    }
  }

  render()
  {
    const { locale, translation, size } = this.props;

    const { roomData, fieldHidden, fieldVisible } = this.state;

    const field = roomData?.field ?? [];

    const gameMode = roomData?.options.gameMode;

    const playerState = roomData?.playerProperties[socket.id]?.state;
    
    const onMovement = ({ x }) =>
    {
      // hide the overlay and overlay holder when they are off-screen
      if (x >= size.width)
        this.store.set({ fieldHidden: true });
      else if (!fieldHidden || fieldVisible)
        this.store.set({ fieldHidden: false });
    };

    return <div className={ styles.view }>
      <Interactable
        ref={ overlayRef }

        style={ {
          zIndex: 2,
          overflow: 'hidden',

          display: fieldHidden ? 'none' : undefined,

          width: '100%',
          height: '100%'
        } }

        dragEnabled={ false }

        horizontalOnly={ true }

        onMovement={ onMovement }

        frame={ { pixels: Math.round(size.width * 0.05), every: 8 } }

        boundaries={ {
          left: 0,
          right: size.width
        } }

        initialPosition={ { x: size.width } }
        
        snapPoints={ [ { x: size.width }, { x: 0 } ] }
      >
        <div className={ styles.wrapper }>
          {
            gameMode === 'kuruit' ?
              <div id={ 'kuruit-field-overlay' } className={ styles.container } style={ { direction: locale.direction } }>
                {
                  field.map((entry, entryIndex) =>
                  {
                    const allowed = playerState === 'judging' && entryIndex > 0;

                    return <div className={ styles.entry } key={ entry.key }>
                      {
                        entry.cards?.map((card, cardIndex) => <Card
                          key={ card.key }
                          type={ card.type }
                          content={ card.content }
                          hidden={ !card.content }
                          allowed={ allowed }
                          self={ roomData?.phase === 'transaction' && entry.id === socket.id && card.type === 'white' }
                          owner={ (roomData?.phase === 'transaction' && card.type === 'white') ? roomData?.playerProperties[entry.id]?.username : undefined }
                          winner= { entry.highlight }
                          share={ roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 }
                          onClick={ () => roomData?.phase === 'transaction' && card.type === 'white' && cardIndex === 0 ? this.share(entryIndex) : this.submit(entryIndex, undefined, allowed) }
                        />)
                      }
                    </div>;
                  })
                }
              </div>
              :
              <TransitionGroup id={ 'qassa-field-overlay' } className={ styles.container }>
                {
                  field[0]?.story?.composed ?
                    <CSSTransition key={ field[0].story.key } timeout={ 250 }>
                      <div className={ styles.qassa }>
                        <div className={ styles.content } style={ { direction: locale.direction } } onClick={ () => this.share() }>
                          { field[0].story.composed?.text.replace(/\\n/g, '\n') }
                          <div className={ styles.bottom }>
                            { translation('qassa') }
                            <ShareIcon className={ styles.share }/>
                          </div>
                        </div>
                      </div>
                    </CSSTransition>
                    :
                    field[0]?.story?.items.map((item, index) =>
                      <CSSTransition key={ item.key } timeout={ 250 }>
                        <Box
                          value={ item.value }
                          description={ item.description }
                          allowed={ playerState === 'writing' }
                          onSubmit={ content => this.submit(index, content, playerState === 'writing') }
                        />
                      </CSSTransition>)
                }
              </TransitionGroup>
          }
        </div>
      </Interactable>
    </div>;
  }
}

FieldOverlay.propTypes = {
  translation: PropTypes.func,
  locale: PropTypes.object,
  size: PropTypes.object
};

const styles = createStyle({
  view: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },

  wrapper: {
    overflow: 'auto',

    position: 'relative',
    backgroundColor: colors.fieldBackground,

    left: '10px',
    height: '100%',

    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
    borderRadius: 'calc(10px + 1.5vw) 0 0 calc(10px + 1.5vw)',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      left: '0',
      width: '100%',
      borderRadius: 'calc(10px + 1.5vw) calc(10px + 1.5vw) 0 0'
    },

    '::-webkit-scrollbar':
    {
      width: 0
    }
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  entry: {
    position: 'relative',
    display: 'flex',

    '> div': {
      margin: '20px 2.5vw'
    },

    ':after': {
      content: '""',
      position: 'absolute',
      backgroundColor: colors.entryLine,
      left: '2.5vw',
      top: 'calc(50% - 1px)',
      width: 'calc(100% - 5vw)',
      height: '2px'
    }
  },

  qassa: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',

    width: '100%',
    height: 'auto',
    minHeight: '100%',

    '.enter': {
      left: '100vw'
    },
    
    '.enter-active': {
      left: 0,
      transition: 'left 0.25s'
    },

    '.exit': {
      left: 0
    },

    '.exit-active': {
      left: '100vw',
      transition: 'left 0.25s'
    }
  },

  content: {
    cursor: 'pointer',
    userSelect: 'none',
    
    color: colors.whiteText,
    backgroundColor: colors.blackCardBackground,
    
    fontWeight: 700,
    fontSize: 'calc(11px + 0.25vw + 0.25vh)',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',
    
    whiteSpace: 'pre-wrap',
    lineHeight: '2em',

    maxWidth: '480px',
    width: '100%',
    height: 'min-content',

    margin: '25px',
    padding: '45px 35px 0',
    borderRadius: '10px'
  },

  bottom: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '15px 0px 15px'
  },

  share: {
    color: colors.blackCardForeground,

    width: 'calc(14px + 0.3vw + 0.3vh)',
    height: 'calc(14px + 0.3vw + 0.3vh)',

    margin: 'auto 0'
  }
});

export default withTranslation(FieldOverlay);


