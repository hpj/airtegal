import React, { useEffect } from 'react';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

const Offline = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'You Are Offline';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div>
      <p>You Are Offline</p>
    </div>
  );
};

export default Offline;