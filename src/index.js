import React from 'react';
import ReactDOM from 'react-dom';

import Header from './components/header.js';

import './body.css';

ReactDOM.render(
  <div>
    <Header>
    </Header>
  </div>, document.body.querySelector('#app'));

if (module.hot)
  module.hot.accept();