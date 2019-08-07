import ioClient from 'socket.io-client';

// TODO how to get query parameters

// const query = new URLSearchParams(window.location.href.match(/(?=\?).+/)[0]);
// console.log(query.get('q'));

/** @type { import('socket.io-client/lib/socket') }
*/
let socket;

export const requires = {};

/** connect the socket.io client to the socket.io server
* @param { string } url the url to the socket.io server
*/
export function connect(url)
{
  return new Promise((resolve, reject) =>
  {
    socket = ioClient.connect(url).on('connect', resolve).on('error', reject);
  });
}

export function createRoom()
{
  requires.createRoom();
}

export function joinRoom()
{
  requires.joinRoom();
}

export function startGame()
{
  requires.startGame();
}

export function handlerVisibility(visible)
{
  requires.handlerVisibility(visible);
}

export function fieldVisibility(visible)
{
  requires.fieldVisibility(visible);
}

export function handVisibility(visible)
{
  requires.handVisibility(visible);
}