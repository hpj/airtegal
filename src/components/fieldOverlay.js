import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { StoreComponent } from '../store.js';

import { socket, sendMessage } from '../utils.js';

import { shareRef } from '../screens/game.js';

import getTheme from '../colors.js';

import { withTranslation } from '../i18n.js';

import Interactable from './interactable.js';

import Card from './card.js';

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

    if (options.gameMode === 'kuruit')
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

          <div className={ styles.indicator } style={ { direction: locale.direction } }>
            {
              !playerState ? translation('spectating') :
                roomData?.phase === 'picking' && playerState === 'judging' ? translation('judging') :
                  undefined
            }
          </div>
          
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

    height: '100%',

    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      width: '100%'
    },

    '::-webkit-scrollbar':
    {
      width: 0
    }
  },

  indicator: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',

    userSelect: 'none',

    color: colors.blackText,
    backgroundColor: colors.trackBarBackground,
  
    fontSize: 'calc(6px + 0.35vw + 0.35vh)',

    padding: '10px',

    transition: 'padding 0.25s ease-in-out',

    ':empty': {
      height: 0,
      padding: 0
    },
  
    // for the portrait overlay
    '@media screen and (max-width: 1080px)': {
      padding: '10px 15px'
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
      backgroundColor: colors.fieldGroupLine,
      left: '2.5vw',
      top: 'calc(50% - 1px)',
      width: 'calc(100% - 5vw)',
      height: '2px'
    }
  }
});

export default withTranslation(FieldOverlay);


