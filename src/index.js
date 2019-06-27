import React from 'react';
import ReactDOM from 'react-dom';

import Header from './components/header.js';

import './body.css';

ReactDOM.render(<Header/>, document.getElementById('root'));

if (module.hot)
  module.hot.accept();