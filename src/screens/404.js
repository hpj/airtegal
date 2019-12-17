import React, { useEffect } from 'react';

import getTheme from '../colors.js';

import { createStyle } from '../flcss.js';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

const NotFound = () =>
{
  // on url change
  useEffect(() =>
  {
    document.title = 'Not Found';
    
    window.scrollTo(0, 0);

  }, [ window.location ]);

  return (
    <div>
      <p>404</p>
    </div>
  );
};

export default NotFound;