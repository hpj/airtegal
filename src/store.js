/* eslint-disable no-unused-vars */
/* eslint-disable security/detect-object-injection */

import React from 'react';

/**
* @type { Store }
*/
let store;

/**
* @param { {} } state
*/
export function createStore(state)
{
  return (store = new Store(state));
}

export function getStore()
{
  return store;
}

export class StoreComponent extends React.Component
{
  constructor(state)
  {
    super();

    // get store
    this.store = getStore();

    this.state = {
      ...state,
      ...this.store.state
    };

    this.store.state = {
      ...state,
      ...this.store.state
    };
  }

  componentDidMount()
  {
    this.store.subscribe(this);
  }

  componentWillUnmount()
  {
    this.store.unsubscribe(this);
  }

  /** Emits before the state changes,
  * allows modification to the state before it's dispatched
  * @param { {} } newState
  * @returns { {} | void } modified new state
  */
  stateWillChange(newState)
  {
    //
  }

  /** whitelist what changes all allowed to be dispatched to this component
  * refusing any dispatch improves app performance and is recommended (specially on large apps)
  * not overriding this function will allow the component to receive all dispatches
  * @param { {} } changes the changes made to this state dispatch
  * @returns { boolean }
  */
  stateWhitelist(changes)
  {
    return true;
  }

  /** Emits after a new state has been dispatched
  * @param { {} } state
  * @param { {} } changes
  * @param { {} } old
  */
  stateDidChange(state, changes, old)
  {
    //
  }
}

export default class Store
{
  /**
  * @param { {} } state
  */
  constructor(state)
  {
    this.subscriptions = [];

    this.state = state ?? {};

    this.changes = {};
  }

  /**
  * @param { import('react').Component } component
  * @returns { Store }
  */
  mount(component)
  {
    component.state = this.state;

    return this;
  }

  /**
  * @param { import('react').Component } component
  * @returns { Store }
  */
  subscribe(component)
  {
    if (component?.setState && this.subscriptions.indexOf(component) < 0)
    {
      this.subscriptions.push(component);

      component.setState(this.state);

      return this;
    }
  }

  /**
  * @param { import('react').Component } component
  * @returns { boolean }
  */
  unsubscribe(component)
  {
    const index = this.subscriptions.indexOf(component);

    if (index > -1)
    {
      this.subscriptions.splice(index, 1);

      return true;
    }
  }

  /**
  * @param { {} } state
  * @param { () => void } callback
  * @returns { Store }
  */
  set(state, callback)
  {
    const keys = Object.keys(state);

    // this is temporary addiction to the code
    // to detect the reason behindd locale being added to the store
    if (keys.includes('locale'))
      throw new Error('locale should not be called here');

    keys.forEach((key) => this.changes[key] = this.state[key] = state[key]);

    // dispatch changes
    this.dispatch().then(callback);

    return this;
  }

  dispatch()
  {
    /** transform all values of the new state to true
    */
    const booleanify = (obj) =>
    {
      const out = {};

      const keys = Object.keys(obj);

      keys.forEach(key => out[key] = true);

      // keys.forEach((key) =>
      // {
      //   if (!Array.isArray(obj[key]) && typeof obj[key] === 'object')
      //     out[key] = booleanify(obj[key]);
      //   else
      //     out[key] = true;
      // });

      return out;
    };

    const promises = [];

    const changesFingerprint = booleanify(this.changes);

    // loop though all subscriptions to inform components that state will change
    this.subscriptions.forEach((component) =>
    {
      const modified = component.stateWillChange?.call(component, this.state);

      // callback to notify components when they state will change
      if (modified)
      {
        const keys = Object.keys(modified);

        keys.forEach(key => this.changes[key] = this.state[key] = modified[key]);
      }
    });

    this.subscriptions.forEach((component) =>
    {
      if (
        typeof component.stateWhitelist === 'function' &&
        component.stateWhitelist.call(component, changesFingerprint) !== true
      )
        return;
      
      const old = { ...component.state };

      promises.push(new Promise((resolve) =>
      {
        component.setState(this.state, () =>
        {
          component.stateDidChange?.(this.state, old);
          
          resolve();
        });
      }));
    });

    this.changes = {};

    // new state dispatched to all subscriptions
    return Promise.all(promises);
  }
}