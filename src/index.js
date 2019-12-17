import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import * as Sentry from '@sentry/browser';

import i18n, { setLocale } from './i18n.js';

// import { Client } from 'rich-presence-for-web-apps';

// import 'fuckadblock';

import WebFont from 'webfontloader';

import axios from 'axios';

import Error from './components/error.js';
import Loading from './components/loading.js';

import NotFound from './screens/404.js';

import Homepage from './screens/homepage.js';

import Game from './screens/game.js';

import TermsAndConditions from './screens/useTerms.js';
import PrivacyPolicy from './screens/privacyPolicy.js';

export let country;
export let API_ENDPOINT;

let availability;

let visibleLoading = true;
let keepLoading = false;

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

/** when all required assets are loaded
*/
function loaded()
{
  if (!availability)
    return;

  const pages =
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={ Homepage }/>
    
      <Route path="/play" component={ Game }/>
      
      <Route path="/terms" component={ TermsAndConditions }/>
      <Route path="/privacy" component={ PrivacyPolicy }/>

      <Route component={ NotFound }/>
    </Switch>
  </BrowserRouter>;

  ReactDOM.render(pages, app, () =>
  {
    // if on production mode, register the service worker
    if (process.env.NODE_ENV === 'production')
      registerServiceWorker();

    if (!keepLoading)
      hideLoadingScreen();
  });
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
  if (visibleLoading)
  {
    keepLoading = true;

    return true;
  }
  else
  {
    return false;
  }
}

export function remountLoadingScreen()
{
  ReactDOM.render(<Loading/>, placeholder);
}

export function hideLoadingScreen()
{
  // will cause an issue if more than one component are holding the loading
  // incase that happens an ID system for every hold will be the most efficient

  ReactDOM.unmountComponentAtNode(placeholder);

  visibleLoading = false;
}

// CORS only works on this custom domain (origin)
// meaning we need to move the client to that remote url
// if they were viewing the app from the host url
if (location.hostname.search('gitlab.io') > -1)
  location.replace('https://bedan.me');

// set the API endpoint
if (process.env.NODE_ENV === 'production')
  API_ENDPOINT = 'https://api.bedan.me';
else
  API_ENDPOINT = 'https://localhost:3000';

// request few promises

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

const ipCheck = new Promise((resolve) =>
{
  // bypass check if on a development builds
  if (process.env.NODE_ENV === 'development')
  {
    country = 'Egypt';
    availability = true;

    setLocale(country);

    resolve();

    return;
  }

  axios({
    url: API_ENDPOINT + '/check',
    timeout: 20000
  })
    .then((response) =>
    {
      if (response.status !== 200)
      {
        ReactDOM.render(<Error error={ i18n(response.data) || response.data }/>, placeholder);

        country = undefined;
        availability = false;

        // set the locale as 'undefined'
        // which will get the browser's default locale
        setLocale();
      }
      else
      {
        country = response.data.country;
        availability = true;

        // try to set the locale as the country
        setLocale(country);
      }

      resolve();
    })
    .catch((e) =>
    {
      if (e.response)
        ReactDOM.render(<Error error={ i18n(e.response.data.message) || e.response.data.message }/>, placeholder);
        
      country = undefined;

      // TODO offline mode and server unavailable should be handled better
      if (!e.response && e.message === 'Network Error')
        availability = true;
      else
        availability = false;

      resolve();
    });
});

// init sentry for error monitoring

if (process.env.NODE_ENV === 'production')
  Sentry.init({ dsn: 'https://48c0df63377d4467823a29295dbc3c5f@sentry.io/1521991' });

// show a loading screen until the promises resolve

Promise.all([ webFontPromise, ipCheck ]).then(loaded);

ReactDOM.render(<Loading splash/>, placeholder);

// TODO Ad-Block Detection

// window.fuckAdBlock.on(true, () =>
// {
//   console.log('Blocking Ads: Yes');
// });

// TODO Discord RPC

// const client = new Client('622201604992401437');

// client.on('connected', () =>
// {
//   console.log('connected');
  
//   client.setActivity({
//     details: 'playing',
//     state: 'mad',
//     startTimestamp: Date.now(),
//     largeImageKey: '6486',
//     largeImageText: 'Image'
//   });
// });

// client.on('error', (err) =>
// {
//   // if err === 'extension is not installed' then check for discord
//   // if it's opened then suggest that the user installs this extension
//   console.error(err);
// });