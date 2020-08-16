export const socket = {
  id: 'skye',

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

  let returnValue;

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
    returnValue = params?.get('list') ? list : [];
  }
  else if (eventName === 'create')
  {
    roomData('player-joined');
  }
  else if (eventName === 'join')
  {
    roomData('player-joined', {
      master: 'mika',
      players: [ 'skye', 'mika' ],
      playerProperties: {
        'skye': { username: 'Skye' },
        'mika': { username: 'Mika' }
      }
    });
  }

  // call done
  setTimeout(() => emitter.emit('done', nonce, returnValue), 100);

  return true;
}

/**
* @param { string } reason
* @param { import('../../../Backend/src/matchmaking.js').RoomOptions } opt
*/
function roomData(reason, opt)
{
  opt = opt ?? {};

  const data = {
    id: 'sskye',
    reason,
    state: opt.state ?? 'lobby',
    master: opt.master ?? 'skye',
    players: opt.players ?? [ 'skye' ],
    playerProperties: opt.playerProperties ?? {
      'skye': { username: 'Skye' }
    },
    options: {
      gameMode: opt.gameMode ?? 'judge',
      winMethod: opt.winMethod ??'points',
      match: opt.match ?? {
        maxPlayers: 8,
        maxRounds: 5,
        maxTime: 10 * 60 * 1000,
        pointsToCollect: 3,
        blankProbability: 0,
        startingHandAmount: 7,
        randos: false,
        availablePacks: [],
        selectedPacks: []
      },
      round: opt.round ?? {
        maxTime: 2 * 60 * 1000,
        delay: 2000,
        maxDelay: 10000
      }
    }
  };

  setTimeout(() => emitter.emit('roomData', data));
}