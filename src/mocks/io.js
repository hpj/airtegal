export const socket = {
  on,
  once,
  emit,
  off,
  
  connected: true,

  close: () => undefined
};


import { EventEmitter } from 'events';

const emitter = new EventEmitter();

function on(event, listener)
{
  emitter.on(event, listener);

  return socket;
}

function off(event, listener)
{
  emitter.off(event, listener);

  return socket;
}

/**
* @param { string } event
* @param  { (...args) => void } listener
*/
function once(event, listener)
{
  // mock connecting to the server
  if (event === 'connect')
  {
    listener();
  }

  return socket;
}

/**
* @param { string } eventName
* @param  { any[] } args
*/
function emit(eventName, args)
{
  const { nonce } = args;

  if (eventName === 'list')
  {
    // answer with an empty array of rooms
    setTimeout(() => emitter.emit('done', nonce, []), 100);
  }

  return true;
}