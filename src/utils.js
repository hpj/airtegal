import * as Sentry from '@sentry/react';

import { io } from 'socket.io-client';

import { locale, translation } from './i18n.js';

import * as mocks from './mocks/io.js';

const version = '2022.1-0';

/**
* @type { import('socket.io-client').Socket }
*/
export let socket;

// detect touch screen
export const isTouchScreen = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

/**
* @type { { touch: boolean, randos: boolean, kuruit: boolean, democracy: boolean } }
*/
export const features = {};

export let hasCamera = false;

/** connect the client to the socket io server
*/
export function connect()
{
  return new Promise((resolve, reject) =>
  {
    try
    {
      let connected = false;

      socket = process.env.NODE_ENV === 'test' ? mocks.socket :
        io(process.env.API_ENDPOINT, {
          path: '/io',
          query: {
            version,
            region: locale().value
          } });

      const fail = err =>
      {
        if (connected)
          return;
    
        socket.close();
    
        reject(err);
      };

      // all game-modes are turned off
      if (!features.kuruit && !features.democracy)
      {
        throw new Error(translation('server-mismatch'));
      }
      else if (isTouchScreen && !features.touch)
      {
        throw new Error(translation('touch-unavailable'));
      }
      
      socket.once('connected', () =>
      {
        connected = true;

        socket.off('error', fail);

        resolve(socket);
      });



      socket.once('error', fail);
  
      // connecting timeout
      setTimeout(() =>
      {
        if (connected)
          return;

        socket.close();

        reject('timeout');
      }, 3000);
    }
    catch (e)
    {
      socket.close();

      reject(e);
    }
  });
}

/**
* @param { string } eventName
* @param  { {} } args
* @param  { number } [timeout]
*/
export function sendMessage(eventName, args, timeout)
{
  return new Promise((resolve, reject) =>
  {
    let timeoutRef;

    // nonce is a bunch of random numbers
    const nonce = [
      Math.random() * 32,
      Math.random() * 8
    ].join('.');

    function errListen(n, err)
    {
      if (n !== nonce)
        return;

      clearTimeout(timeoutRef);

      socket.off('done', doneListen);
      socket.off('err', errListen);

      reject(err);
    }

    function doneListen(n, data)
    {
      if (n !== nonce)
        return;

      clearTimeout(timeoutRef);

      socket.off('done', doneListen);
      socket.off('err', errListen);

      resolve(data);
    }

    // emit the message
    socket.emit(eventName, { nonce, ...args });

    // setup the timeout
    if (typeof timeout === 'number' && timeout > 0)
    {
      timeoutRef = setTimeout(() =>
      {
        socket.off('done', doneListen);
        socket.off('err', errListen);

        errListen(nonce, translation('timeout'));
      }, timeout ?? 15000);
    }

    // assign the callbacks
    socket.on('done', doneListen);
    socket.on('err', errListen);
  });
}

/**
* @param { string } template
* @param { string[] } items
*/
export function fillTheBlanks(template, items)
{
  let i = 0;

  const text =
    template.replace(/_.+?(?=[^_]|$)/g, () => `\n${items[i++]}\n`);

  if (text === template)
    return `${text} \n${items.join('')}\n.`;
  else
    return text;
}

/** shuffle an array using the Fisher-Yates shuffle algorithm
*/
export function shuffle(array)
{
  // istanbul ignore if
  if (process.env.NODE_ENV !== 'test')
  {
    for (let i = array.length - 1; i > 0; i--)
    {
      const j = Math.floor(Math.random() * (i + 1));
  
      [ array[i], array[j] ] = [ array[j], array[i] ];
    }
  }

  return array;
}

export function captureException(err, extra)
{
  console.error(err);

  Sentry.captureException(err, {
    extra,
    level: Sentry.Severity.Error
  });
}

/**
* @param { Object<string, string> } flags
*/
export const setFeatures = flags =>
{
  Object.keys(flags).forEach(k => features[k] = flags[k] === 'true') ;
};

export function setCamera(toggle)
{
  hasCamera = toggle;
}