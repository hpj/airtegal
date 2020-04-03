/* eslint-disable security/detect-object-injection */

import React from 'react';

const stores = {};

/**
* @param { string } name
* @param { {} } state
* @returns { Store }
*/
export function createStore(name, state)
{
  // eslint-disable-next-line security/detect-object-injection
  return (stores[name] = new Store(state));
}

/**
* @param { string } name
* @returns { Store }
*/
export function getStore(name)
{
  // eslint-disable-next-line security/detect-object-injection
  return stores[name];
}

/**
* @param { string } name
*/
export function deleteStore(name)
{
  // eslint-disable-next-line security/detect-object-injection
  delete stores[name];
}

export class StoreComponent extends React.Component
{
  constructor(name, state)
  {
    super();

    if (typeof name === 'string')
    {
      this.store = getStore(name);

      this.state = {
        ...state,
        ...this.store.state
      };

      this.store.state = {
        ...state,
        ...this.store.state
      };
    }
    else if (typeof name === 'object')
    {
      this.store = getStore('app');

      this.state = {
        ...name,
        ...this.store.state
      };

      this.store.state = {
        ...name,
        ...this.store.state
      };
    }
    else
    {
      this.store = getStore('app');

      this.state = {
        ...state,
        ...this.store.state
      };

      this.store.state = {
        ...state,
        ...this.store.state
      };
    }
  }

  componentDidMount()
  {
    this.store.subscribe(this);
  }

  componentWillUnmount()
  {
    this.store.unsubscribe(this);
  }

  /** whitelist what changes all allowed to be dispatched to this component
  * refusing any dispatch improves app performance and is recommended (specially on large apps)
  * not overriding this function will allow the component to receive all dispatches
  * @param { {} } changes the changes made to this state dispatch
  * @returns { boolean }
  */
  // eslint-disable-next-line no-unused-vars
  stateWhitelist(changes)
  {
    return true;
  }

  /** Emits before the state changes,
  * allows modification to the state before it's dispatched
  * @param { {} } newState
  * @returns { {} } modified new state
  */
  // eslint-disable-next-line no-unused-vars
  stateWillChange(newState)
  {
    //
  }

  /** Emits after a new state has been dispatched
  * @param { {} } state
  * @param { {} } changes
  * @param { {} } old
  */
  // eslint-disable-next-line no-unused-vars
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
    this.state = state || {};
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
    if (component && component.setState && this.subscriptions.indexOf(component) < 0)
    {
      this.subscriptions.push(component);

      component.setState(this.state);

      return this;
    }

    return false;
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

    return false;
  }

  /**
  * @param { {} } state
  * @param { () => void } callback
  * @returns { Store }
  */
  set(state, callback)
  {
    // update state
    this.state = {
      ...this.state,
      ...state
    };

    // dispatch changes
    this.dispatch().then(callback);

    return this;
  }

  /**
  * @returns { Promise }
  */
  dispatch()
  {
    return new Promise((resolve) =>
    {
      const promises = [];

      // loop though all subscriptions to inform components that state will change
      this.subscriptions.forEach((component) =>
      {
        // callback to notify components when they state will change
        if (component.stateWillChange)
        {
          // allow modifying of the new state
          // order will matter so be careful about computability
          // after all the callbacks are executed - the new new state
          // will be dispatched to all components
          const modified = component.stateWillChange.call(component, this.state);

          this.state = {
            ...this.state,
            ...modified
          };
        }
      });

      // deep filter changes objects to only dispatch real changes
      const diff = (current, changes) =>
      {
        const out = { ...changes };

        const changesKeys = Object.keys(changes);

        changesKeys.forEach((key) =>
        {
          if (!Array.isArray(changes[key]) && typeof changes[key] === 'object')
          {
            if (!current[key])
              return;
            
            out[key] = diff(current[key], changes[key]);

            if (Object.keys(out[key]).length <= 0)
              delete out[key];
          }
          else if (current[key] === changes[key])
          {
            delete out[key];
          }
        });

        return out;
      };

      const heat = (obj) =>
      {
        const out = {};

        const keys = Object.keys(obj);

        keys.forEach((key) =>
        {
          if (!Array.isArray(obj[key]) && typeof obj[key] === 'object')
            out[key] = heat(obj[key]);
          else
            out[key] = true;
        });

        return out;
      };
      
      // loop though all subscriptions again to dispatch the new state
      this.subscriptions.forEach((component) =>
      {
        const old = { ...component.state };
        const changes = diff(component.state, this.state);

        // filter dispatches
        if (component?.setState && component?.stateWhitelist && component.stateWhitelist(heat(changes)))
        {
          promises.push(new Promise((resolve) =>
          {
            // dispatch new state to component
            component.setState(this.state, () =>
            {
              resolve();

              if (component.stateDidChange)
                component.stateDidChange.call(component, this.state, changes, old);
            });
          }));
        }
      });

      // new state dispatched to all subscriptions
      Promise.all(promises).then(resolve);
    });
  }
}