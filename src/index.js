import React from 'react';
import ReactDOM from 'react-dom'
;
import { HashRouter as Router, Route } from 'react-router-dom';

import WebFont from 'webfontloader';

import jsonp from 'jsonp';

import Placeholder from './components/placeholder.js';

import Homepage from './components/homepage.js';

import Game from './components/game.js';

import TermsAndConditions from './components/useTerms.js';
import PrivacyPolicy from './components/privacyPolicy.js';

export let API_URI;

let keepLoading = false;

let country = '';
let error = '';

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

/** when all required assets are loaded
*/
function loaded()
{
  if (country && country === 'Egypt')
  {
    const pages =
    <Router>
      
      <Route exact path="/" component={Homepage}/>
    
      {
        (process.env.NODE_ENV === 'production') ? <div/> : <Route exact path="/play" component={Game}/>
      }

      <Route path="/terms" component={TermsAndConditions}/>
      <Route path="/privacy" component={PrivacyPolicy}/>
  
    </Router>;
    
    ReactDOM.render(pages, app);
    
    if (!keepLoading)
      hideLoadingScreen();
  }
  else if (country && country !== 'Egypt')
  {
    ReactDOM.render(<Placeholder type='not-available'/>, placeholder);
  }
  else if (error)
  {
    ReactDOM.render(<Placeholder type='error' content={error}/>, placeholder);
  }
}

export function holdLoadingScreen()
{
  keepLoading = true;
}

export function hideLoadingScreen()
{
  // will cause an issue if more than one component are holding the loading
  // incase that happens an ID system for every hold will be the most efficient
  
  if (document.body.contains(placeholder))
    document.body.removeChild(placeholder);
}

// if on production mode
if (process.env.NODE_ENV === 'production')
{
  // CORS only works on this origin
  // meaning we need to move the client to that origin
  if (location.hostname.search('gitlab.io') > -1)
    location.replace('https://bedan.herpproject.com');

  API_URI = 'https://kbf.herokuapp.com';
  
  // if the browser supports service workers
  if ('serviceWorker' in navigator)
  {
    navigator.serviceWorker.register('sw.js')
      .catch((err) =>
      {
        // failed registration, service worker won’t be installed
        console.error('Service worker registration failed:', err);
      });
  }
}
else
{
  API_URI = 'https://localhost:3000';
}

const webFontPromise = new Promise((resolve) =>
{
  WebFont.load({
    active: resolve,
    inactive: resolve,
    custom: {
      families: [ 'Montserrat:n4,n7', 'Noto Arabic:n4,n7' ],
      urls: [ '/fonts.css' ]
    }
  });
});

const countryPromise = new Promise((resolve) =>
{
  jsonp('https://geoip-db.com/jsonp', { name: 'callback' }, (err, response) =>
  {
    if (err)
      error = err.message;
    else
      country = response.country_name;

    resolve();
  });
});

// called when loading is finished to show the real app
Promise.all([ countryPromise, webFontPromise ]).then(loaded);

// render loading screen
ReactDOM.render(<Placeholder type='loading'/>, placeholder);

if (module.hot)
  module.hot.accept();