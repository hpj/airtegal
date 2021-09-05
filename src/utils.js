import { socket } from './screens/game.js';

import { translation } from './i18n.js';

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
