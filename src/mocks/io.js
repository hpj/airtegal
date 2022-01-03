import QRCode from 'qrcode';

import { EventEmitter } from 'events';

export const socket = {
  on,
  once,
  emit,
  off,
  id: 'skye',
  connected: true,
  close: () => undefined
};

const params = new URL(document.URL).searchParams;

/**
* @type { import('../components/roomOverlay').RoomData }
*/
const defaultRoom = {
  id: 'roomid',
  
  master: true,
  
  region: 'egypt',
  
  phase: '',
  state: 'lobby',

  timestamp: Date.now(),

  players: [
    { username: 'Skye', score: 0 },
    { username: 'Mika', score: 0 },
    { username: 'Aqua', score: 0 },
    { username: 'Aire', score: 0 }
  ],
  playerProperties: {
    username: 'Skye',
    score: 0
  },
  playerSecretProperties: {
    hand: []
  },

  field: [],
  options: {
    gameMode: params.get('gameMode') === '2' ? 'democracy' : 'kuruit',
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
  if (event === 'connected')
    listener();

  return socket;
}

async function emit(eventName, args)
{
  const { nonce } = args;

  let returnValue;

  if (eventName === 'list')
  {
    const list = [
      {
        id: '0',
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
        id: '1',
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
    if (params.get('mock') === 'spectating')
    {
      matchBroadcast({
        master: false,
        players: [ { username: 'Mana' }, { username: 'Mika' } ],
        playerProperties: { state: 'spectating' }
      });
    }
    else
    {
      matchBroadcast({
        master: false,
        players: [ { username: 'Skye' }, { username: 'Mika' } ],
        playerProperties: { username: 'Skye' }
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
  else if (eventName === 'share')
  {
    returnValue = '/assets/card.png';
  }
  else if (eventName === 'username')
  {
    returnValue = 'اسلام المرج';
  }
  else if (eventName === 'qr')
  {
    const url = `${location.protocol}//${location.host}${location.pathname}?join=skyeee`;

    returnValue = await QRCode.toString(url, {
      type: 'svg',
      width: 128,
      margin: 0
    });
  }
  else if (eventName === 'matchRequest')
  {
    if (defaultRoom.options.gameMode === 'kuruit')
      startKuruit();
    else if (defaultRoom.options.gameMode === 'democracy')
      startDemocracy();
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
  const message = {
    ...defaultRoom,
    ...data
  };

  if (params.has('highlights'))
  {
    message.players[0].score = 3;
    message.players[1].score = 3;
  }

  setTimeout(() => emitter.emit('roomData', message));
}

function startKuruit()
{
  /**
  * @type { import('../components/roomOverlay').RoomData }
  */
  const room = {};

  room.state = 'match';

  room.players = [ {
    username: 'Skye',
    state: 'waiting'
  }, {
    username: 'Mika',
    state: 'waiting'
  } ];

  room.playerProperties = {
    username: 'Skye',
    state: 'waiting'
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
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' },
        { key: Math.random(), type: 'white', content: 'Skye\'s Card' },
        { key: Math.random(), type: 'white', blank: true }
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

    room.players[0].state = room.playerProperties.state = 'judging';

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
    
    room.players[0].state = room.playerProperties.state = 'judging';

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

    room.players[0].state = room.playerProperties.state = 'judging';

    room.field.push({
      id: 'Mika',
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Option 1'
      } ]
    });

    room.field.push({
      id: 'Skye',
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

      room.players[0].state = room.playerProperties.state = 'waiting';

      room.field[index].highlight = true;
      
      matchBroadcast(room);
    };
  }
  else if (params.get('mock') === 'spectating')
  {
    room.master = '';
    room.phase = 'judging';

    room.players = [ {
      username: 'Mana',
      state: 'judging'
    }, {
      username: 'Mika',
      state: 'waiting'
    } ];
    
    room.playerProperties = { state: 'spectating' };

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

    room.players[0].state = room.playerProperties.state = 'picking';

    room.players[1].state = 'judging';
  
    matchBroadcast(room);
  
    matchLogic = ({ index, content }) =>
    {
      room.players[0].state = room.playerProperties.state = 'waiting';

      const card = room.playerSecretProperties.hand.splice(index, 1)[0];

      if (card.blank)
        card.content = content;
  
      room.field.push({
        id: 'Skye',
        key: Math.random(),
        cards: [ card ]
      });
      
      matchBroadcast(room);
    };
  }
}

function startDemocracy()
{
  /**
  * @type { import('../components/roomOverlay').RoomData }
  */
  const room = {};

  room.state = 'match';

  room.players = [ {
    username: 'Skye',
    state: 'waiting'
  }, {
    username: 'Mika',
    state: 'waiting'
  } ];

  room.playerProperties = {
    username: 'Skye',
    state: 'waiting'
  };

  room.playerSecretProperties =
  {
    hand: [ { key: Math.random(), type: 'white', blank: true } ]
  };

  room.field = [];

  // black card
  room.field.push({
    key: Math.random(),
    tts: `${document.location.origin}/audio.mp3`,
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

    room.players[0].state = room.playerProperties.state = 'judging';

    room.field.push({
      id: 'Mika',
      key: Math.random(),
      cards: [ {
        key: Math.random(),
        type: 'white',
        content: 'Option 1'
      } ]
    });

    room.field.push({
      id: 'Skye',
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

      room.players[0].state = room.playerProperties.state = 'waiting';

      room.field[index].highlight = true;
      
      matchBroadcast(room);
    };
  }
  else if (params.get('mock') === 'spectating-picking')
  {
    room.master = '';
    room.phase = 'picking';

    room.players = [ {
      username: 'Mana',
      state: 'judging'
    }, {
      username: 'Mika',
      state: 'picking'
    } ];
    
    room.playerProperties = { state: 'spectating' };

    room.playerSecretProperties = {};

    matchBroadcast(room);
  }
  else
  {
    room.phase = 'picking';

    room.players[0].state = room.playerProperties.state = 'picking';

    room.playerProperties[1].state = 'judging';
  
    matchBroadcast(room);
  
    matchLogic = ({ index, content }) =>
    {
      room.players[0].state = room.playerProperties.state = 'waiting';

      const card = room.playerSecretProperties.hand.splice(index, 1)[0];

      if (card.blank)
        card.content = content;
  
      room.field.push({
        id: 'Skye',
        key: Math.random(),
        cards: [ card ]
      });
      
      matchBroadcast(room);
    };
  }
}