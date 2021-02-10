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

/**
* @type { import('../../../Backend/src/matchmaking.js').Room }
*/
let room = {};

let matchLogic;

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
    // or a list of rooms if list is parma in the URL
    returnValue = params?.has('list') ? list : [];
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
  else if (eventName === 'edit')
  {
    room.options = {
      ...room.options,
      ...args.options
    };
    
    roomData('options-edit');
  }
  else if (eventName === 'matchRequest')
  {
    startMatch();
  }
  else if (eventName === 'matchLogic')
  {
    matchLogic?.call(undefined, args);
  }

  // call done
  setTimeout(() => emitter.emit('done', nonce, returnValue), 100);

  return true;
}

/**
* @param { string } reason
* @param { import('../../../Backend/src/matchmaking.js').RoomOptions } opt
*/
function roomData(reason, opt, additional)
{
  opt = opt ?? {};

  additional = additional ?? {};

  room = {
    id: 'sskye',
    reason,
    state: opt.state ?? room.state ?? 'lobby',
    master: opt.master ?? room.master ?? 'skye',
    players: opt.players ?? room.players ?? [ 'skye' ],
    playerProperties: opt.playerProperties ?? room.playerProperties ?? {
      'skye': { username: 'Skye' }
    },
    playerSecretProperties: room.playerSecretProperties ?? {},
    field: room.field ?? [],
    options: room.options ?? {
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

  setTimeout(() => emitter.emit('roomData', { ...room, ...additional }));
}

function startMatch()
{
  const params = new URL(document.URL).searchParams;

  room.state = 'match';

  room.players = [ 'skye', 'mika' ];

  room.playerProperties =
  {
    'skye': {
      rando: false,
      username: 'Skye',
      state: 'waiting',
      score: 0
    },
    'mika': {
      rando: false,
      username: 'Mika',
      state: 'waiting',
      score: 0
    }
  };

  room.playerSecretProperties =
  {
    hand: (params.get('mock') === 'blank') ?
      [ { key: Math.random(), type: 'white', blank: true } ] :
      [ { key: Math.random(), type: 'white', content: 'Skye\'s Card' } ]
  };

  // for (let index = 0; index < 20; index++)
  // {
  //   room.playerSecretProperties.hand.push({
  //     key: Math.random(), type: 'white', content: 'Skye\'s Card'
  //   });
  // }

  // start round

  room.field = [];

  roomData('round-started', {

  });

  // black card phase

  room.field.push({
    key: Math.random(),
    cards: [ {
      key: Math.random(),
      pick: 1,
      type: 'black',
      content: 'This is a Black Card'
    } ]
  });

  roomData('black-card', {

  });

  // picking phase

  // mock a field of 2 groups of 3 cards
  if (params.get('mock') === 'group')
  {
    room.field.push({
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: '1'
      }, {
        key: Math.random(),
        type: 'white',
        content: '2'
      }, {
        key: Math.random(),
        type: 'white',
        content: '3'
      } ]
    });

    room.field.push({
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: '1'
      }, {
        key: Math.random(),
        type: 'white',
        content: '2'
      }, {
        key: Math.random(),
        type: 'white',
        content: '3'
      } ]
    });

    roomData('field-entry', undefined);

    return;
  }

  room.playerProperties['skye'].state = 'picking';

  roomData('picking-phase', undefined, {
    judge: 'mika',
    counter: 15000
  });

  matchLogic = (args) =>
  {
    room.playerProperties['skye'].state = 'waiting';

    room.field.push({
      key: Math.random(),
      cards: args.picks.map((card) =>
      {
        return {
          ...card,
          ...room.playerSecretProperties.hand.splice(card.index, 1)[0]
        };
      })
    });
    
    roomData('field-entry', undefined);
  };
}