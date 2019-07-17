import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';

// import ApolloClient from 'apollo-boost';
// import { ApolloProvider } from 'react-apollo';

import Homepage from './components/homepage.js';

import TermsAndConditions from './components/useTerms.js';
import PrivacyPolicy from './components/privacyPolicy.js';

import './body.css';

// const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIn19.nl_ylzc22-I7GAuC57WLb9z-rUNmL0QCV3vR4_ymfqMbzNx7uhW5ibuIQg-M7yEOb0eN_REF_hEzgyrUWIUOVh466nVtNOC3qOMv-1hXLHyDx339M6nEuJwvw372-zHM0-ABeQG8LVU9t7r-uRpd-aK9pMHjbxG28NGsD6aTMdwjz3BgC5gjpIUgc9Fs3vx0yxA9XUgy2jYpensY-6bgFgQ2-C02IkRxVFG3_iea112l1yPXKO8jTAPtPMPrBISRtZKQZb5AjOSDyNTZOQh1TDHdISRMP_EY8FaUsZhqGrpqtn76HWzVoaDIoaG7bt0NkykwYfXHAksW9ys0MR4vWQ';

// const client = new ApolloClient({
//   uri: 'https://kbf-data.herokuapp.com/v1/graphql',
//   headers: {
//     authorization: `Bearer ${token}`
//   }
// });

// if on production and the browser supports service workers
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)
{
  navigator.serviceWorker.register('sw.js')
    .catch((err) =>
    {
      // failed registration, service worker won’t be installed
      console.error('Service worker registration failed:', err);
    });
}

ReactDOM.render(
  <Router basename="/">
    {/* <ApolloProvider client={client}> */}

    <Route path="/home" component={Homepage}/>
    <Route path="/tac" component={TermsAndConditions}/>
    <Route path="/pt" component={PrivacyPolicy}/>

    {/* </ApolloProvider> */}

    <Redirect to='/home'/>

  </Router>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();