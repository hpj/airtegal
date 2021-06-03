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
* @type { import('../components/roomOverlay').RoomData }
*/
const defaultRoom = {
  id: 'sskye',
  region: 'egypt',
  master: 'skye',

  state: 'lobby',
  phase: '',

  players: [ 'skye' ],
  playerProperties: {
    'skye': { username: 'Skye' }
  },
  playerSecretProperties: {
    hand: []
  },

  field: [],
  options: {
    gameMode: 'kuruit',
    endCondition: 'limited',
    match: {
      maxPlayers: 8,
      maxRounds: 5,
      maxTime: 10 * 60 * 1000,
      blankProbability: 0,
      startingHandAmount: 7,
      randos: false
    },
    round: {
      delay: 2000,
      maxDelay: 10000,
      maxTime: 2 * 60 * 1000
    }
  }
};

let matchLogic = () => undefined;

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

function once(event, listener)
{
  // mock connecting to the server
  if (event === 'connect')
    listener();

  return socket;
}

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
          gameMode: 'kuruit',
          endCondition: 'limited',
          match: {
            maxPlayers: 8,
            maxRounds: 10,
            maxTime: 10 * 60 * 1000,
            blankProbability: 2,
            startingHandAmount: 7,
            randos: false
          },
          round: {
            maxTime: 2 * 60 * 1000
          }
        }
      },
      {
        id: 'mana',
        players: 4,
        options: {
          gameMode: 'kuruit',
          endCondition: 'timer',
          match: {
            maxPlayers: 4,
            maxRounds: 5,
            maxTime: 10 * 60 * 1000,
            blankProbability: 0,
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
    matchBroadcast();
  }
  else if (eventName === 'join')
  {
    if (params.get('mock') === 'spectator')
    {
      matchBroadcast({
        master: 'mana',
        players: [ 'mana', 'mika' ],
        playerProperties: {
          'mana': { username: 'Mana' },
          'mika': { username: 'Mika' }
        }
      });
    }
    else
    {
      matchBroadcast({
        master: 'mika',
        players: [ 'skye', 'mika' ],
        playerProperties: {
          'skye': { username: 'Skye' },
          'mika': { username: 'Mika' }
        }
      });
    }
  }
  else if (eventName === 'edit')
  {
    matchBroadcast({
      options: {
        ...defaultRoom.options,
        ...args.options
      }
    });
  }
  else if (eventName === 'matchRequest')
    startMatch();
  else if (eventName === 'matchLogic')
    matchLogic.call(undefined, args);

  // call done
  setTimeout(() => emitter.emit('done', nonce, returnValue), 100);

  return true;
}

function matchBroadcast(data)
{
  setTimeout(() => emitter.emit('roomData', {
    ...defaultRoom,
    ...data
  }));
}

function startMatch()
{
  const params = new URL(document.URL).searchParams;

  /**
  * @type { import('../components/roomOverlay').RoomData }
  */
  const room = {};

  room.state = 'match';

  room.players = [ 'skye', 'mika' ];

  room.playerProperties =
  {
    'skye': {
      username: 'Skye',
      state: 'waiting'
    },
    'mika': {
      username: 'Mika',
      state: 'waiting'
    }
  };

  room.playerSecretProperties =
  {
    hand: (params.get('mock') === 'blank') ?
      [ { key: Math.random(), type: 'white', blank: true } ] :
      [
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' },
        { key: Math.random(), type: 'white', blank: true },
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' },
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' },
        { key: Math.random(), type: 'white', blank: true },
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' }
      ]
  };

  room.field = [];

  // black card
  room.field.push({
    key: Math.random(),
    cards: [ {
      key: Math.random(),
      pick: 1,
      type: 'black',
      content: 'This is a Black Card'
    } ]
  });

  if (params.get('mock') === 'hidden')
  {
    room.phase = 'picking';
    room.playerProperties['skye'].state = 'judging';

    room.field.push({
      key: Math.random(),
      cards: [ {
        hidden: true,
        key: Math.random(),
        type: 'white'
      } ]
    });

    room.field.push({
      key: Math.random(),
      cards: [ {
        hidden: true,
        key: Math.random(),
        type: 'white'
      } ]
    });

    matchBroadcast(room);
  }
  else if (params.get('mock') === 'group')
  {
    room.phase = 'judging';
    room.playerProperties['skye'].state = 'judging';

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

    matchBroadcast(room);
  }
  else if (params.get('mock') === 'judge')
  {
    room.phase = 'judging';
    room.playerProperties['skye'].state = 'judging';

    room.field.push({
      id: 'mika',
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Option 1'
      } ]
    });

    room.field.push({
      id: 'skye',
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Option 2'
      } ]
    });
  
    matchBroadcast(room);
  
    matchLogic = ({ index }) =>
    {
      room.phase = 'transaction';
      room.playerProperties['skye'].state = 'waiting';

      // eslint-disable-next-line security/detect-object-injection
      room.field[index].highlight = true;
      
      matchBroadcast(room);
    };
  }
  else if (params.get('mock') === 'spectator')
  {
    room.master = '';
    room.phase = 'judging';

    room.players = [ 'mana', 'mika' ];
    
    room.playerProperties = {
      'mana': {
        username: 'Mana',
        state: 'judging'
      },
      'mika': {
        username: 'Mika',
        state: 'waiting'
      }
    };

    room.playerSecretProperties = {};

    room.field.push({
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Test'
      } ]
    });

    room.field.push({
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Test'
      } ]
    });

    matchBroadcast(room);
  }
  else
  {
    room.phase = 'picking';
    room.playerProperties['skye'].state = 'picking';
  
    matchBroadcast(room);
  
    matchLogic = ({ index, content }) =>
    {
      room.playerProperties['skye'].state = 'waiting';

      const card = room.playerSecretProperties.hand.splice(index, 1)[0];

      if (card.blank)
        card.content = content;
  
      room.field.push({
        id: 'skye',
        key: Math.random(),
        cards: [ card ]
      });
      
      matchBroadcast(room);
    };
  }
}