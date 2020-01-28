import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import * as Sentry from '@sentry/browser';

import i18n, { setLocale } from './i18n.js';

import 'prevent-pull-refresh';

import './fuckadblock.js';

import WebFont from 'webfontloader';

import axios from 'axios';

import Error from './components/error.js';
import Loading from './components/loading.js';

import TimedBlock from './components/timedBlock.js';

import Offline from './screens/offline.js';
import NotFound from './screens/404.js';

import Picture from './screens/picture.js';

import Homepage from './screens/homepage.js';

import Game from './screens/game.js';

export let country = '';

let installPromptEvent;

let visibleLoading = true;
let keepLoading = false;

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

// detect touch screen
export const isTouchScreen = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

function registerServiceWorker()
{
  // if the browser supports service workers
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)
  {
    navigator.serviceWorker.register('sw.js')
      .catch((err) =>
      {
        // failed registration, service worker won’t be installed
        console.error('Service worker registration failed:', err);
      });
  }
}

function getAllowAPIRoutes()
{
  const params = new URL(document.URL).searchParams;
  
  return (params && params.get('secret') === process.env.KBF_API_KEY);
}

/** when all required assets are loaded
*/
function loaded()
{
  const allowAPIRoutes = getAllowAPIRoutes();

  const pages =
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={ Homepage }/>
      
        <Route path='/play' component={ Game }/>

        <Route path='/picture' component={ (allowAPIRoutes) ? Picture : NotFound }/>
        
        <Route component={ NotFound }/>
      </Switch>
    </BrowserRouter>;

  ReactDOM.render(pages, app, () =>
  {
    if (!keepLoading)
      hideLoadingScreen();
  });
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

export function onInstallPrompt(callback)
{
  if (installPromptEvent)
    callback(installPromptEvent);
  else
    window.addEventListener('beforeinstallprompt', (e) => callback(e));
}

// register the service worker
registerServiceWorker();

window.addEventListener('beforeinstallprompt', (e) =>
{
  e.preventDefault();

  installPromptEvent = e;
});

// show a loading screen until the promises resolve
ReactDOM.render(<Loading splash/>, placeholder);

// initialize third party service providers
if (process.env.NODE_ENV === 'production')
{
  // sentry for error monitoring
  Sentry.init({ dsn: 'https://48c0df63377d4467823a29295dbc3c5f@sentry.io/1521991' });
}

// request the promises

const webFontPromise = () =>
{
  return new Promise((resolve) =>
  {
    WebFont.load({
      active: resolve,
      inactive: resolve,
      custom: {
        families: [ 'Montserrat:n4,n7', 'Noto Arabic:n4,n7' ],
        urls: [ '/assets/fonts.css' ]
      }
    });
  });
};

const connectivityPromise = () =>
{
  return new Promise((resolve, reject) =>
  {
    if (navigator.onLine === false)
    {
      ReactDOM.render(<Offline/>, app, () => hideLoadingScreen());
  
      reject();
    }
    else
    {
      resolve();
    }
  });
};

const ipCheckPromise = () =>
{
  return new Promise((resolve, reject) =>
  {
    // bypass check if on a development builds
    if (process.env.NODE_ENV === 'development')
    {
      country = 'Egypt';
  
      resolve();
  
      return;
    }
  
    axios({
      url: `${process.env.API_ENDPOINT}/check`,
      timeout: 20000
    })
      .then((response) =>
      {
        if (response.status !== 200)
        {
          country = undefined;
          
          reject(i18n(response.data) || response.data);
        }
        else
        {
          country = response.data.country;
  
          // try to set the locale as the country
          setLocale(country);
  
          resolve();
        }
      })
      .catch((e) =>
      {
        country = undefined;
  
        if (e.response)
          reject(i18n(e.response.data.message) || e.response.data.message);
        else
          resolve();
      });
  });
};

const fuckAdBlockPromise = () =>
{
  return new Promise((resolve) =>
  {
    if (process.env.NODE_ENV !== 'production')
    {
      resolve();

      return;
    }
  
    if (window.fuckAdBlock)
    {
      window.fuckAdBlock.on(true, () =>
      {
        ReactDOM.render(<TimedBlock resolvePromise={ resolve }/>, placeholder);
      }).on(false, resolve);
    }
    else
    {
      ReactDOM.render(<TimedBlock resolvePromise={ resolve }/>, placeholder);
    }
  });
};

// remove the loading screen if all the promises resolve
Promise.all([ webFontPromise(), connectivityPromise(), ipCheckPromise() ])
  .then(() => fuckAdBlockPromise().then(loaded))
  .catch((e) =>
  {
    ReactDOM.render(<Error error={ e }/>, placeholder);
  });