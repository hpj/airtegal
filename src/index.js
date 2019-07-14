import React from 'react';
import ReactDOM from 'react-dom';

import Homepage from './components/homepage.js';

import './body.css';

// if on production and the browser supports service workers
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)
{
  navigator.serviceWorker.register('service-worker.js')
    .catch((err) =>
    {
      // failed registration, service worker won’t be installed
      console.error('Service worker registration failed:', err);
    });
}

ReactDOM.render(<Homepage/>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();