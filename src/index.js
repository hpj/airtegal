import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';

import Homepage from './components/homepage.js';

import TermsAndConditions from './components/useTerms.js';
import PrivacyPolicy from './components/privacyPolicy.js';

// if on production mode
if (process.env.NODE_ENV === 'production')
{
  process.env.API_URI = 'https://kbf.herokuapp.com';
  
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
  process.env.API_URI = 'https://localhost:3000';
}

ReactDOM.render(
  <Router basename="/">

    <Route path="/home" component={Homepage}/>
    <Route path="/tac" component={TermsAndConditions}/>
    <Route path="/pt" component={PrivacyPolicy}/>

    <Redirect to='/home'/>

  </Router>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();