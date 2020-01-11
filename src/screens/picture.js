import React from 'react';

import { createStyle } from '../flcss.js';

import Card from '../components/card.js';

const Picture = () =>
{
  
  const params = new URL(document.URL).searchParams;
  
  if (params && params.get('data'))
  {
    try
    {
      const data = JSON.parse(params.get('data'));

      // Right-to-left regex
      // because we can't use i18n.locale to decide an input from outside the server and the app
      const direction = /[\u0591-\u07FF]/.test(data.black) ? 'rtl' : 'ltr';

      return (
        <div id='picture' className={ styles.wrapper }>
          <div direction={ direction } className={ styles.container }>
            <Card type='black' content={ data.black }/>

            {
              data.white.map((content, i) => <Card key={ i } type='white' content={ content }/>)
            }
          </div>
        </div>
      );
    }
    catch
    {
      return <div/>;
    }
  }
  else
  {
    return <div/>;
  }
};

const styles = createStyle({
  wrapper: {
    width: '640px',
    height: '365px'
  },

  container: {
    direction: 'ltr',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    flexWrap: 'wrap',
    overflow: 'hidden',

    background: 'linear-gradient(235deg, rgba(255,0,0,1) 0%, rgba(100,0,221,1) 75%)',

    width: '100%',
    height: '100%',

    '[direction="rtl"]': {
      direction: 'rtl'
    },

    '> div': {
      width: '155px',

      transform: 'translate(0, 0) rotateZ(5deg)',

      margin: '0 -4px'
    },

    '> div > div': {
      boxShadow: '0px 0px 10px 0px #0000004d'
    },

    '> div:nth-child(1)': {
      transform: 'translate(0, 0) rotateZ(-5deg)'
    },

    '[direction="rtl"]> div': {
      width: '155px',

      transform: 'translate(0, 0) rotateZ(-5deg)'
    },

    '[direction="rtl"]> div:nth-child(1)': {
      transform: 'translate(0, 0) rotateZ(5deg)'
    }
  }
});

export default Picture;
