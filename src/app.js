import React from 'react';

import './style/app.css';

export default class App extends React.Component
{
  constructor()
  {
    super();

    this.state = { color: 'red' };
  }
  render()
  {
    return <h2>I am a {this.state.color} Car!</h2>;
  }
}