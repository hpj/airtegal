/**
* @param { string } template
* @param { string[] } content
*/
export function fillTheBlanks(template, content)
{
  let i = 0;

  const text =
    template.replace(/_.+?(?=[^_]|$)/g, () => `\n${content[i++]}\n`);

  if (text === template)
    return `${text} \n${content.join('')}\n.`;
  else
    return text;
}

class Discord extends EventTarget
{
  constructor()
  {
    super();

    this.tries = 0;
    this.ws = null;
  }

  connect()
  {
    const port = 6463 + (this.tries % 10);
    
    this.tries += 1;

    this.ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1`);

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
  }

  onOpen()
  {
    this.dispatchEvent(new Event('open'));
  }

  onClose(event)
  {
    if (!event.wasClean)
      return;

    this.dispatchEvent(new CustomEvent('close', {
      detail: event
    }));
  }

  onError(event)
  {
    try
    {
      this.ws.close();
    }
    catch
    {
      //
    }

    if (this.tries > 20)
    {
      this.dispatchEvent(new CustomEvent('error', {
        detail: event.error
      }));
    }
    else
    {
      setTimeout(() => this.connect(), 250);
    }
  }

  onMessage(event)
  {
    this.dispatchEvent(new CustomEvent('message', {
      detail: JSON.parse(event.data)
    }));
  }

  send(data)
  {
    this.ws.send(JSON.stringify(data));
  }

  close()
  {
    return new Promise(resolve =>
    {
      this.once('close', resolve);

      this.ws.close();
    });
  }
}

export function detectDiscord(callback)
{
  if (process.env.NODE_ENV === 'test')
    return;
  
  const discord = new Discord();

  discord.addEventListener('open', callback);

  discord.connect();
}