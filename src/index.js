import React, {
  Suspense,
  lazy
} from 'react';

import ReactDOM from 'react-dom';

import Placeholder from './components/placeholder.js';

import './body.css';

const Homepage = lazy(() => import('./components/homepage.js'));

ReactDOM.render(
  <Suspense fallback={
    <Placeholder type='loading'/>
  }>
    <Homepage/>
  </Suspense>
  , document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();