import React from 'react';

import ReactDOM from 'react-dom';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import WebFont from 'webfontloader';

import QrScanner from 'qr-scanner';

import QrScannerWorkerPath from '!!file-loader!../node_modules/qr-scanner/qr-scanner-worker.min.js';

import { translation, setLocale } from './i18n.js';

import { setFeatures, setCamera } from './utils.js';

import stack from './stack.js';

import { createStore } from './store.js';

import SplashScreen from './components/splash.js';
import ErrorScreen from './components/error.js';

import NotFound from './screens/404.js';
import Homepage from './screens/homepage.js';

let splashVisible = true;

const app = document.body.querySelector('#app');
const placeholder = document.body.querySelector('#placeholder');

QrScanner.WORKER_PATH = QrScannerWorkerPath;

/** when all required assets are loaded
*/
function loaded()
{
  const pages =
    <BrowserRouter>
      <Routes>
        <Route path={ '/' } element={ <Homepage/> }/>
        <Route path={ '*' } element={ <NotFound/> }/>
      </Routes>
    </BrowserRouter>;

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
  setFeatures({
    touch: 'true',
    randos: 'true',
    kuruit: 'true',
    democracy: 'true'
  });

  setLocale('Egypt', 'ar');
};

const camPromise = async() =>
{
  try
  {
    setCamera(await QrScanner.hasCamera());
  }
  catch (err)
  {
    console.warn(err);
  }
};

// make sure to go to 'offline.html' if user is offline
if (!navigator.onLine)
  window.location.assign('/offline.html');

// remove the loading screen if all the promises resolve
Promise.all([ webFontPromise(), checkPromise(), camPromise() ])
  .then(loaded)
  // eslint-disable-next-line react/no-render-return-value
  .catch(err => ReactDOM.render(<ErrorScreen error={ err.message ?? err }/>, placeholder));
