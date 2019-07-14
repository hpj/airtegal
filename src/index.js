import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';

import Homepage from './components/homepage.js';

import TermsAndConditions from './components/useTerms.js';
import PrivacyPolicy from './components/privacyPolicy.js';

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

ReactDOM.render(
  <Router basename="/">

    <Redirect to='/home'/>

    <Route path="/home" component={Homepage}/>
    <Route path="/tac" component={TermsAndConditions}/>
    <Route path="/pt" component={PrivacyPolicy}/>
  </Router>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();