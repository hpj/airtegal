import React from 'react';
import ReactDOM from 'react-dom';

import Homepage from './components/homepage.js';

import './body.css';

ReactDOM.render(<Homepage/>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();