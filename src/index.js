import React from 'react';
import ReactDOM from 'react-dom'
;
import { HashRouter as Router, Route } from 'react-router-dom';

import WebFont from 'webfontloader';

import axios from 'axios';

import jsonp from 'jsonp';

import Error from './components/error.js';
import Loading from './components/loading.js';

import Homepage from './screens/homepage.js';

import Game from './screens/game.js';

import TermsAndConditions from './screens/useTerms.js';
import PrivacyPolicy from './screens/privacyPolicy.js';

export let country;
export let API_ENDPOINT;

let availability;

let keepLoading = false;

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

/** when all required assets are loaded
*/
function loaded()
{
  const pages =
  <Router>
    <Route exact path="/" component={Homepage}/>
  
    <Route path="/play" component={Game}/>
    
    <Route path="/terms" component={TermsAndConditions}/>
    <Route path="/privacy" component={PrivacyPolicy}/>

  </Router>;

  ReactDOM.render(pages, app, () =>
  {
    // if on production mode, register the service worker
    if (process.env.NODE_ENV === 'production')
      registerServiceWorker();

    if (!keepLoading)
      hideLoadingScreen();
  });

  // REMOVE this block and add country selector on homepage
  // the app will only be blocked in certin countries only
  // if (availability && country !== 'Egypt')
  // {
  //   ReactDOM.render(<Error error='This app is not available in your country.'/>, placeholder);
  //   ReactDOM.unmountComponentAtNode(app);
  // }

  console.log(`User's country is ${country}.`);
  console.log(`Availability is ${availability}.`);
}

function registerServiceWorker()
{
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

export function holdLoadingScreen()
{
  keepLoading = true;
}

export function hideLoadingScreen()
{
  // will cause an issue if more than one component are holding the loading
  // incase that happens an ID system for every hold will be the most efficient

  ReactDOM.unmountComponentAtNode(placeholder);
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

const availabilityPromise = new Promise((resolve) =>
{
  // bypass availability test if running on a development build
  if (process.env.NODE_ENV === 'development')
  {
    availability = true;

    resolve();

    return;
  }

  axios({
    url: API_ENDPOINT,
    timeout: 3500
  })
    .then(() =>
    {
      availability = true;

      resolve();
    })
    .catch(() =>
    {
      availability = false;
      API_ENDPOINT = undefined;

      resolve();
    });
});

const countryPromise = new Promise((resolve) =>
{
  jsonp('https://geoip-db.com/jsonp', {
    name: 'callback',
    timeout: 3500
  }, (err, response) =>
  {
    if (response && response.country_name)
      country = response.country_name;

    resolve();
  });
});

// CORS only works on this origin
// meaning we need to move the client to that origin
if (location.hostname.search('gitlab.io') > -1)
  location.replace('https://bedan.me');

// set the game's API endpoint
if (process.env.NODE_ENV === 'production')
  API_ENDPOINT = 'https://kbf.herokuapp.com';
else
  API_ENDPOINT = 'https://localhost:3000';

Promise.all([ webFontPromise, availabilityPromise, countryPromise ]).then(loaded);

// render loading screen
ReactDOM.render(<Loading/>, placeholder);