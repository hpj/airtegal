import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import * as Tracing from '@sentry/tracing';

import { getI18n, setLocale } from './i18n.js';

import WebFont from 'webfontloader';

import axios from 'axios';

import { createStore, getStore } from './store.js';

import Error from './components/error.js';
import Loading from './components/loading.js';

import NotFound from './screens/404.js';
import Homepage from './screens/homepage.js';

import Game from './screens/game.js';

let visibleLoading = true;
let keepLoading = false;

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

// detect touch screen
export const isTouchScreen = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

/** when all required assets are loaded
*/
function loaded()
{
  const pages =
    <Router>
      <Switch>
        <Route exact path={ '/' } component={ Homepage }/>
        <Route path={ '/play' } component={ Game }/>
        <Route path={ '*' } component={ NotFound }/>
      </Switch>
    </Router>;

  ReactDOM.render(pages, app, () =>
  {
    if (!keepLoading)
      hideLoadingScreen();
  });
}

export function holdLoadingScreen()
{
  return visibleLoading ? keepLoading = true : false;
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

// register the service worker
navigator.serviceWorker?.register('sw.js')
  .catch((err) => console.error('Service worker registration failed:', err));

// create app-wide store
createStore();

// show a loading screen until the promises resolve
ReactDOM.render(<Loading splash/>, placeholder);

// set the endpoint to the production server
// istanbul ignore if
if (process.env.NODE_ENV === 'production')
{
  // sentry for error monitoring
  Sentry.init({
    release: process.env.RELEASE,
    dsn: 'https://48c0df63377d4467823a29295dbc3c5f@o287619.ingest.sentry.io/1521991',
    // send the app state with each error
    beforeSend: event =>
    {
      event.extra = getStore();

      return event;
    },
    integrations: [
      new Tracing.Integrations.BrowserTracing()
    ],
    tracesSampleRate: 0.65
  });
}

// request the promises

const webFontPromise = () =>
{
  return new Promise((resolve) =>
  {
    WebFont.load({
      classes: false,
      active: resolve,
      inactive: resolve,

      custom: {
        families: [ 'Montserrat:n4,n7', 'Noto Arabic:n4,n7' ]
      }
    });
  });
};

const connectivityPromise = async() =>
{
  if (process.env.NODE_ENV === 'production' && !navigator.onLine)
    throw new Error('You Are Offline');
};

const ipCheckPromise = async() =>
{
  // bypass check if on a development or testing environments
  if (process.env.NODE_ENV !== 'production')
  {
    setLocale('Egypt', 'ar');
  
    return;
  }

  try
  {
    /**
    * @type { import('axios').AxiosResponse<{ version: number, country: string, language: string }> }
    */
    const response = await axios.get(`${process.env.API_ENDPOINT}/check`, {
      timeout: 15000
    });
  
    if (response.status !== 200)
      throw new Error(getI18n(response.data) ?? response.data);
    else
      setLocale(response.data.country, response.data.language);
  }
  catch (e)
  {
    if (e.response)
      throw new Error(getI18n(e.response.data?.message) ?? e.response.data?.message);
  }
};

// remove the loading screen if all the promises resolve
Promise.all([ webFontPromise(), connectivityPromise(), ipCheckPromise() ])
  .then(loaded)
  // eslint-disable-next-line react/no-render-return-value
  .catch(err => ReactDOM.render(<Error error={ err }/>, placeholder));