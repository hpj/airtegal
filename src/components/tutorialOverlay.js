import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import DiscordIcon from 'mdi-react/DiscordIcon';

import { createStyle } from 'flcss';

import stack from '../stack.js';

import getTheme, { opacity } from '../colors.js';

import { withTranslation } from '../i18n.js';

import Interactable from './interactable.js';

const colors = getTheme();

/**
* @type { React.RefObject<Interactable> }
*/
const interactableRef = createRef();

/**
* @type { React.RefObject<HTMLDivElement> }
*/
const tutorialRef = createRef();

class TutorialOverlay extends React.Component
{
  constructor()
  {
    super();

    const params = new URL(document.URL)?.searchParams;
    
    let visible = false;
    
    this.storageKey = 'airtegal-kuruit-tutorial';

    if (!localStorage.getItem(this.storageKey))
      visible = true;

    if (process.env.NODE_ENV === 'test' && params?.has('quiet'))
      visible = false;

    this.state = {
      visible,
      opacity: 0,
      index: 0
    };

    if (process.env.NODE_ENV !== 'test')
    {
      this.interval = setInterval(() =>
      {
        const length = 5;
  
        const index = this.state.index + 1;
  
        if (index > length || !visible)
        {
          clearInterval(this.interval);
        }
        else
        {
          tutorialRef.current.childNodes.item(index).scrollIntoView({ behavior: 'smooth' });
  
          this.setState({ index });
        }
      }, 3500);
    }
  }

  componentDidMount()
  {
    if (this.state.visible)
    {
      stack.register(this.back);

      interactableRef.current?.snapTo({ index: 1 });
    }
  }

  componentWillUnmount()
  {
    clearInterval(this.interval);
  }

  back()
  {
    interactableRef.current?.snapTo({ index: 0 });
  }

  hide()
  {
    if (!this.state.visible)
      return;

    stack.unregister(this.back);

    localStorage.setItem(this.storageKey, true);

    this.setState({
      visible: false
    });
  }

  render()
  {
    const { visible, opacity } = this.state;
    
    const { size, translation, locale } = this.props;

    const onMovement = ({ y }) =>
    {
      this.setState({
        opacity: 1 - (y / size.height)
      });
    };

    const onSnapEnd = (index) =>
    {
      if (index === 0)
        this.hide();
    };

    return <div className={ styles.wrapper } data-visible={ visible }>
      <div style={ { opacity } }/>

      <Interactable
        ref={ interactableRef }
      
        style={ {
          display: 'flex',
          position: 'fixed',

          alignItems: 'center',
          justifyContent: 'center',

          width: '100vw',
          height: '100vh'
        } }

        dragEnabled={ true }
      
        verticalOnly={ true }

        frame={ { pixels: Math.round(size.height * 0.05), every: 8 } }
      
        boundaries={ {
          top: 0,
          bottom: size.height
        } }
      
        initialPosition={ { y: size.height } }

        snapPoints={ [ { y: size.height }, { y: 0 } ] }

        triggers={ [ { y: size.height * 0.1, index: 0 } ] }

        onMovement={ onMovement }
        onSnapEnd={ onSnapEnd }
      >
        
        <div id={ 'kuruit-tutorial' } className={ styles.container } style={ { direction: locale.direction } }>

          <div className={ styles.handler }>
            <div/>
          </div>

          <div ref={ tutorialRef }>

            <div className={ styles.item }>
              <div>{ translation('adults-only-title') }</div>
              <img src={ '/assets/adults-only.png' }/>
              <div>{ translation('adults-only') }</div>
            </div>

            <div className={ styles.item }>
              <div>{ translation('prefer-voice-chat-title') }</div>
              <img src={ '/assets/prefer-voice-chat.png' }/>
              <div>{ translation('prefer-voice-chat') }</div>
            </div>

            <div className={ styles.item }>
              <div>{ translation('pick-a-card-title') }</div>
              <img src={ '/assets/pick-a-card.png' }/>
              <div>{ translation('pick-a-card') }</div>
            </div>

            <div className={ styles.item }>
              <div>{ translation('write-a-card-title') }</div>
              <img src={ '/assets/write-a-card.png' }/>
              <div>{ translation('write-a-card') }</div>
            </div>

            <div className={ styles.item }>
              <div>{ translation('judge-a-card-title') }</div>
              <img src={ '/assets/judge-a-card.png' }/>
              <div>{ translation('judge-a-card') }</div>
            </div>

            <div className={ styles.item }>
              <div>{ translation('join-our-discord-title') }</div>
              <img src={ '/assets/join-our-discord.png' }/>
              <div>{ translation('join-our-discord') }</div>

              <div className={ styles.buttons }>
                <a href={ 'https://herpproject.com/discord' }>
                  <DiscordIcon/>
                </a>
              </div>

            </div>
          </div>
        </div>
      </Interactable>
    </div>;
  }
}

TutorialOverlay.propTypes = {
  size: PropTypes.object,
  translation: PropTypes.func,
  locale: PropTypes.object
};

const styles = createStyle({
  wrapper: {
    zIndex: 50,
    position: 'fixed',

    width: '100vw',
    height: '100vh',

    fontWeight: '700',
    fontFamily: '"Montserrat", "Noto Arabic", sans-serif',

    '[data-visible="false"]': {
      display: 'none'
    },

    '> :nth-child(1)': {
      position: 'absolute',
      backgroundColor: opacity(colors.whiteBackground, '0.95'),

      width: '100vw',
      height: '100vh'
    }
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',

    color: colors.blackText,
    
    width: '40vw',
    height: '100%',
    minWidth: '210px',
    maxWidth: '300px',

    userSelect: 'none',
    margin: '0 auto',

    '> :nth-child(2)': {
      display: 'flex',
      height: 'min-content',
      overflow: 'auto',

      '::-webkit-scrollbar':
      {
        height: '6px'
      },
  
      '::-webkit-scrollbar-thumb':
      {
        boxShadow: `inset 0 0 6px 6px ${colors.handScrollbar}`
      }
    }
  },

  handler: {
    display: 'flex',
    justifyContent: 'center',
    
    width: '100%',
    height: 'min-content',

    margin: 'auto 15px 15px',

    '> div': {
      cursor: 'pointer',
      backgroundColor: opacity(colors.blackText, 0.5),
  
      width: 'calc(35px + 2.5%)',
      height: '6px',
      borderRadius: '6px'
    }
  },

  item: {
    display: 'flex',
    flexDirection: 'column',

    ':not(:first-child):not(:last-child)': {
      margin: '0 5vw'
    },
    
    '> :nth-child(1)': {
      margin: '25px 0',
      fontSize: 'calc(12px + 0.15vw + 0.15vh)'
    },

    '> :nth-child(2)': {
      width: '40vw',
      height: '210px',
      minWidth: '210px',
      maxWidth: '300px',

      margin: '15px auto',
      objectFit: 'contain',
      filter: colors.theme === 'light' ? 'invert(1)' : undefined
    },

    '> :nth-child(3)': {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      fontSize: 'calc(12px + 0.15vw + 0.15vh)'
    }
  },

  buttons: {
    display: 'flex',

    '> *': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
  
      color: colors.blackText,
      
      border: `1px solid ${colors.blackText}`,
  
      '> svg': {
        width: '16px',
        height: '16px'
      },
  
      ':active': {
        transform: 'scale(0.95)'
      }
    },

    '> :nth-child(1)': {
      margin: '25px 0',
      padding: '10px 4vw'
    }
  }
});

export default withTranslation(TutorialOverlay);
