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

if (process.env.NODE_ENV === 'test')
{
  if (!params.has('reserveLocalStorage'))
  {
  // eslint-disable-next-line no-global-assign
    localStorage.getItem = null;
  }
}

/**
* @type { import('../components/roomOverlay').RoomData }
*/
const defaultRoomData = {
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
    if (params.has('highscorers'))
    {
      defaultRoomData.state = 'match';
      defaultRoomData.players[0].score = 3;
      defaultRoomData.players[1].score = 3;

      matchBroadcast();

      defaultRoomData.state = 'lobby';
      
      setTimeout(() => matchBroadcast(), 1500);
    }
    else
    {
      matchBroadcast();
    }
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
        ...defaultRoomData.options,
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
    if (args.username)
    {
      defaultRoomData.playerProperties.username =
      defaultRoomData.players[0].username =
      args.username;
    }

    returnValue = args.username ?? 'اسلام المرج';
  }
  else if (eventName === 'qr')
  {
    const url = `${location.protocol}//${location.host}${location.pathname}?join=skyeee`;

    const QRCode = await import('qrcode');

    returnValue = await QRCode.toString(url, {
      type: 'svg',
      width: 128,
      margin: 0
    });
  }
  else if (eventName === 'matchRequest')
  {
    if (defaultRoomData.options.gameMode === 'kuruit')
      startKuruit();
    else if (defaultRoomData.options.gameMode === 'democracy')
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

function matchBroadcast(roomData)
{
  roomData = {
    ...defaultRoomData,
    ...roomData
  };

  setTimeout(() => emitter.emit('roomData', roomData));
}

async function startKuruit()
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

    room.players[0].state = room.players[0].role = room.playerProperties.state = 'judging';

    room.players[1].role = 'picking';

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
    
    room.players[0].state = room.players[0].role = room.playerProperties.state = 'judging';
    room.players[1].role = 'picking';

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

    room.players[0].state = room.players[0].role = room.playerProperties.state = 'judging';
    room.players[1].role = 'picking';

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
      role: 'judging',
      state: 'judging'
    }, {
      username: 'Mika',
      role: 'picking',
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

    room.players[0].state = room.players[0].role = room.playerProperties.state = 'picking';

    room.players[1].state = room.players[1].role = 'judging';
  
    matchBroadcast(room);
  
    matchLogic = ({ index, content }) =>
    {
      room.phase = 'judging';

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

async function startDemocracy()
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

  const response = await fetch(`${document.location.origin}/audio.mp3`);

  const arrayBuffer = await response.arrayBuffer();

  // black card
  room.field.push({
    key: Math.random(),
    tts: arrayBuffer,
    cards: [ {
      key: Math.random(),
      pick: 1,
      type: 'black',
      content: 'This is a Black Card'
    } ]
  });

  if (params.get('mock') === 'judge' || params.get('mock') === 'votes')
  {
    room.phase = 'judging';

    room.players[0].state = room.players[0].role = room.playerProperties.state = 'judging';
    room.players[1].role = 'picking';

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
  
    if (params.get('mock') === 'votes')
    {
      room.phase = 'transaction';

      room.players[0].state = room.playerProperties.state = 'waiting';
      room.players[1].state = 'waiting';
      
      room.field[1].votes = [ 'Skye', 'Mika', 'Mana', 'Aire', 'Husseen', 'Aly Rabeeee3' ];
      room.field[1].highlight = true;

      room.field[2].votes = [ 'Mana', 'حسين' ];
    }
    else
    {
      matchLogic = ({ index }) =>
      {
        room.phase = 'judging';
  
        room.players[0].state = room.playerProperties.state = 'waiting';
        
        room.field[index].votes = [ 'Skye' ];
  
        matchBroadcast(room);
      };
    }

    matchBroadcast(room);
  }
  else if (params.get('mock') === 'spectating')
  {
    room.master = '';
    room.phase = 'picking';

    room.players = [ {
      username: 'Mana',
      role: 'judging',
      state: 'judging'
    }, {
      username: 'Mika',
      role: 'picking',
      state: 'picking'
    } ];
    
    room.playerProperties = { state: 'spectating' };

    room.playerSecretProperties = {};

    matchBroadcast(room);
  }
  else
  {
    room.phase = 'picking';

    room.players[0].state = room.players[0].role = room.playerProperties.state = 'picking';

    room.players[1].state = room.players[1].role = 'judging';
  
    matchBroadcast(room);
  }
}