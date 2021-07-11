export const socket = {
  on,
  once,
  emit,
  off,
  id: 'skye',
  connected: true,
  close: () => undefined
};

import { EventEmitter } from 'events';

const params = new URL(document.URL).searchParams;

/**
* @type { import('../components/roomOverlay').RoomData }
*/
const defaultRoom = {
  id: 'sskye',
  region: 'egypt',
  master: 'skye',
  
  state: 'lobby',
  phase: '',
  timestamp: Date.now(),

  players: [ 'skye', 'mika', 'aqua', 'aire' ],
  playerProperties: {
    'skye': { username: 'Skye' },
    'mika': { username: 'Mika' },
    'aqua': { username: 'Aqua' },
    'aire': { username: 'Aire' }
  },
  playerSecretProperties: {
    hand: []
  },

  field: [],
  options: {
    gameMode: params.get('gameMode') ?? 'kuruit',
    endCondition: 'limited',
    maxPlayers: 8,
    maxRounds: 5,
    maxTime: 10 * 60 * 1000,
    blankProbability: 0,
    startingHandAmount: 7,
    randos: false,
    roundDelay: 2000,
    roundMaxDelay: 10000,
    roundTime: 2 * 60 * 1000
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

  let returnValue;

  if (eventName === 'list')
  {
    const list = [
      {
        id: 'skye',
        master: 'Skye',
        players: 4,
        options: {
          gameMode: 'kuruit',
          endCondition: 'limited',
          maxPlayers: 8,
          maxRounds: 10,
          maxTime: 10 * 60 * 1000,
          blankProbability: 2,
          startingHandAmount: 7,
          randos: false,
          roundTime: 2 * 60 * 1000
        }
      },
      {
        id: 'mana',
        master: 'Mana',
        players: 4,
        options: {
          gameMode: 'kuruit',
          endCondition: 'timer',
          maxPlayers: 4,
          maxRounds: 5,
          maxTime: 10 * 60 * 1000,
          blankProbability: 0,
          startingHandAmount: 4,
          randos: true,
          roundTime: 2 * 60 * 1000
        }
      },
      {
        id: 'mika',
        master: 'Mika',
        players: 4,
        options: {
          gameMode: 'qassa',
          maxPlayers: 6
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
  {
    if (defaultRoom.options.gameMode === 'kuruit')
      startKuruit();
    else if (defaultRoom.options.gameMode === 'king')
      startKing();
    else if (defaultRoom.options.gameMode === 'qassa')
      startQassa();
  }
  else if (eventName === 'matchLogic')
  {
    matchLogic.call(undefined, args);
  }

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

function startKuruit()
{
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
        key: Math.random(),
        type: 'white'
      } ]
    });

    room.field.push({
      key: Math.random(),
      cards: [ {
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

function startKing()
{
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

  if (params.get('mock') === 'judge')
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

function startQassa()
{
  /**
  * @type { import('../components/roomOverlay').RoomData }
  */
  const room = {};

  room.state = 'match';

  room.players = [ 'skye', 'mika', 'mana' ];

  room.playerProperties =
  {
    'skye': {
      username: 'Skye',
      state: 'waiting'
    },
    'mika': {
      username: 'Mika',
      state: 'waiting'
    },
    'mana': {
      username: 'Mana',
      state: 'waiting'
    }
  };

  room.field = [ {
    key: Math.random(),
    story: {
      name: 'Test',
      template: 'Testing The ______,\\n\\nTa ta.',
      key: Math.random(),
      items: [
        { key: Math.random(), description: 'name' },
        { key: Math.random(), description: 'day of the week' },
        { key: Math.random(), description: 'verb' }
      ]
    }
  } ];

  if (params.get('mock') === 'spectator')
  {
    room.master = '';

    room.phase = 'writing';

    room.players = [ 'mana', 'mika' ];
    
    room.playerProperties = {
      'mana': {
        username: 'Mana',
        state: 'writing'
      },
      'mika': {
        username: 'Mika',
        state: 'waiting'
      }
    };

    room.playerSecretProperties = {};

    matchBroadcast(room);
  }
  else if (params.get('mock') === 'waiting')
  {
    room.phase = 'writing';
    
    room.playerProperties['skye'].state = 'waiting';
    room.playerProperties['mika'].state = 'writing';

    room.field[0].story.items[2].description = undefined;
  
    matchBroadcast(room);
  }
  else if (params.get('mock') === 'reading')
  {
    room.phase = 'transaction';
    room.playerProperties['skye'].state = 'waiting';

    room.field[0].story.name = 'Test Story';
    room.field[0].story.template = 'Lorem ipsum dolor sit amet ______.';

    room.field[0].story.composed = {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eleifend ut urna ac mattis. Suspendisse eleifend eros odio. Proin vulputate est nec tellus venenatis faucibus. In placerat euismod urna, ac fringilla arcu tempus vel. Ut dapibus lacus in blandit posuere.\nAenean vestibulum leo sed tempor pharetra.\n\nVivamus placerat congue placerat. Pellentesque ultricies blandit mauris, at sollicitudin libero ornare non. Duis ultrices faucibus dapibus. Mauris ac nulla erat. Aliquam sed imperdiet sem, quis pharetra dui. Donec quis mi a leo tristique gravida. Pellentesque vehicula leo lobortis, accumsan leo sit amet, ultrices leo. Donec gravida dolor eu purus vehicula lacinia.'
    };

    matchBroadcast(room);
  }
  else
  {
    room.phase = 'writing';
    room.playerProperties['skye'].state = 'writing';

    room.field[0].story.items[1].value = 'hello';

    matchBroadcast(room);

    matchLogic = ({ index, content }) =>
    {
      // eslint-disable-next-line security/detect-object-injection
      room.field[0].story.items[index].value = content;

      matchBroadcast(room);

      if (room.field[0].story.items.every(item => typeof item.value === 'string'))
      {
        room.phase = 'transaction';
        room.playerProperties['skye'].state = 'waiting';

        room.field[0].story.composed = {
          text: 'Testing The Story Mode,\\n\\nTa ta.'
        };

        matchBroadcast(room);
      }
    };
  }
}