import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';

import jsonp from 'jsonp';

import Placeholder from './components/placeholder.js';

import Homepage from './components/homepage.js';

import Game from './components/game.js';

import TermsAndConditions from './components/useTerms.js';
import PrivacyPolicy from './components/privacyPolicy.js';

const body = document.body.querySelector('#app');

// CORS only works on this origin
if (process.env.NODE_ENV !== 'production' && location.hostname.search('gitlab.io') > -1)
  location.href = 'https://bedan.herpproject.com';

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

jsonp('https://geoip-db.com/jsonp', { name: 'callback' }, (err, response) =>
{
  let country = '';
  let error = '';

  if (err)
    error = err.message;
  else
    country = response.country_name;

  if (country && country === 'Egypt')
  {
    ReactDOM.render(
      <Router>
      
        <Route exact path="/" component={Homepage}/>
        
        {
          (process.env.NODE_ENV === 'production') ? <div/> : <Route exact path="/play" component={Game}/>
        }

        <Route path="/tac" component={TermsAndConditions}/>
        <Route path="/pt" component={PrivacyPolicy}/>
      
      </Router>, body);
  }
  else if (country && country !== 'Egypt')
  {
    ReactDOM.render(<Placeholder type='not-available'/>, body);
  }
  else if (error)
  {
    ReactDOM.render(<Placeholder type='error' content={error}/>, body);
  }
});

ReactDOM.render(<Placeholder type='loading'/>, body);

if (module.hot)
  module.hot.accept();