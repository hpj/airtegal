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
    const old = {
      ...this.state
    };

    const change = {
      ...this.state,
      ...state
    };

    // update state
    this.state = change;

    // dispatch changes
    this.dispatch(state, old).then(callback);

    return this;
  }

  /**
  * @returns { Promise }
  */
  dispatch(changes, old)
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

          changes = {
            ...changes,
            ...modified
          };
        }
      });

      // loop though all subscriptions again to dispatch the new state
      this.subscriptions.forEach((component) =>
      {
        if (component && component.setState)
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