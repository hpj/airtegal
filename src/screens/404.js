import React, { useEffect } from 'react';

import { createStyle } from 'flcss';

const NotFound = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'Not Found';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div className={ styles.container }>
      <img src={ '/assets/404_1.png' } alt={ 'HI' }/>
    </div>
  );
};

const styles = createStyle({
  container: {
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#000000',

    width: '100vw',
    height: '100vh'
  }
});

export default NotFound;