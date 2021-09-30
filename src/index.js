import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import * as Tracing from '@sentry/tracing';

import axios from 'axios';

import WebFont from 'webfontloader';

import { translation, locale, setLocale } from './i18n.js';

import features, { setFeatures } from './flags.js';

import stack from './stack.js';

import { createStore, getStore } from './store.js';

import SplashScreen from './components/splash.js';
import ErrorScreen from './components/error.js';

import NotFound from './screens/404.js';
import Homepage from './screens/homepage.js';

import Game from './screens/game.js';

let splashVisible = true;

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

  ReactDOM.render(pages, app);
}

export function ensureSplashScreen()
{
  if (!splashVisible)
    ReactDOM.render(<SplashScreen onlyText/>, placeholder);

}

export function hideSplashScreen()
{
  splashVisible = false;
  
  ReactDOM.unmountComponentAtNode(placeholder);
}

// create the back stack
stack.create();

// register the service worker
navigator.serviceWorker?.register('sw.js')
  .catch(err => console.error('Service worker registration failed:', err));

// create app-wide store
createStore();

// show a loading screen until the promises resolve
ReactDOM.render(<SplashScreen/>, placeholder);

// sentry error monitoring
Sentry.init({
  release: process.env.RELEASE,
  enabled: process.env.NODE_ENV === 'production',
  dsn: 'https://48c0df63377d4467823a29295dbc3c5f@o287619.ingest.sentry.io/1521991',
  // send the app state with each error
  beforeSend: event =>
  {
    event.tags = event.tags ?? {};
    
    event.tags['locale'] = locale().label;
    event.tags['language'] = locale().locale;

    event.extra = {
      ...getStore().state
    };

    return event;
  },
  integrations: [
    new Tracing.Integrations.BrowserTracing()
  ],
  tracesSampleRate: 0.65
});

// request the promises

const webFontPromise = () =>
{
  return new Promise(resolve =>
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

const checkPromise = async() =>
{
  try
  {
    // bypass check if on a development or testing environments
    if (process.env.NODE_ENV !== 'production')
    {
      setFeatures({
        touch: 'true',
        randos: 'true',
        kuruit: 'true'
      });

      setLocale('Egypt', 'ar');
    }
    else
    {
    /**
    * @type { import('axios').AxiosResponse<{ features: Object<string, string>, country: string, language: string }> }
    */
      const { status, data } = await axios.get(`${process.env.API_ENDPOINT}/check`, {
        timeout: 15000
      });
  
      // server unavailable
      if (status !== 200)
      {
        throw new Error(translation(data) ?? data);
      }
      else
      {
        setFeatures(data.features);
      
        setLocale(data.country, data.language);
      }
    }

    // all game-modes are turned off
    if (!features.kuruit)
    {
      throw new Error(translation('server-mismatch'));
    }
    else if (isTouchScreen && !features.touch)
    {
      throw new Error(translation('touch-unavailable'));
    }
  }
  catch (err)
  {
    if (err.response)
      throw new Error(translation(err.response.data?.message) ?? err.response.data?.message);
    else if (err.message)
      throw new Error(translation(err.message));
  }
};

// make sure to go to 'offline.html' if user is offline
if (!navigator.onLine)
  window.location.assign('/offline.html');

// remove the loading screen if all the promises resolve
Promise.all([ webFontPromise(), checkPromise() ])
  .then(loaded)
  // eslint-disable-next-line react/no-render-return-value
  .catch(err => ReactDOM.render(<ErrorScreen error={ err.message ?? err }/>, placeholder));
