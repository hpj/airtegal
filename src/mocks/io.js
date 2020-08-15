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

  const params = new URL(document.URL).searchParams;

  if (eventName === 'list')
  {
    const list = [
      {
        id: 'skye',
        players: 4,
        options: {
          gameMode: 'judge',
          winMethod: 'points',
          match: {
            maxPlayers: 8,
            pointsToCollect: 7,
            blankProbability: 2,
            startingHandAmount: 7,
            randos: false
          }
        }
      },
      {
        id: 'mika',
        players: 4,
        options: {
          gameMode: 'democracy',
          winMethod: 'timer',
          match: {
            maxPlayers: 16,
            maxTime: 15 * 60 * 1000,
            blankProbability: 0,
            startingHandAmount: 12,
            randos: true
          }
        }
      },
      {
        id: 'mana',
        players: 4,
        options: {
          gameMode: 'king',
          winMethod: 'limited',
          match: {
            maxPlayers: 4,
            maxRounds: 5,
            startingHandAmount: 7,
            randos: true
          },
          round: {
            maxTime: 2 * 60 * 1000
          }
        }
      }
    ];

    // answer with an empty array of rooms
    setTimeout(() => emitter.emit('done', nonce, params?.get('list') ? list : []), 100);
  }

  return true;
}