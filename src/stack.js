/**
* @type { [] }
*/
let stack;

let _wakelock;

function create()
{
  stack = [];
  
  window.addEventListener('keyup', e =>
  {
    if (e.key !== 'Escape')
      return;
    
    handle();
  });
  
  // TODO find a way to disable browser's back button
  // and handle it like pressing escape

  // history.pushState(null, null, location.href);

  // window.addEventListener('popstate', e =>
  // {
  //   history.pushState(null, null, location.href);
  // });
}

/**
* @param { BeforeUnloadEvent } e
*/
function warn(e)
{
  e.preventDefault();
  
  return e.returnValue = 'Are you sure you want to leave?';
}

function wakelock()
{
  if (process.env.NODE_ENV !== 'production')
    return;
  
  // request a screen-wake lock
  navigator.wakeLock?.request('screen').then(x => _wakelock = x).catch(console.warn);

  // show an unload warning
  window.addEventListener('beforeunload', warn, { capture: true });
}

function release()
{
  // release the screen-wake lock
  _wakelock?.release();

  // release the unload warning
  window.removeEventListener('beforeunload', warn, { capture: true });
}

function handle()
{
  if (!stack.length)
    return;

  stack[stack.length - 1]?.();
}

function register(callback)
{
  stack.push(callback);
}

function unregister(callback)
{
  const index = stack.indexOf(callback);

  if (index > -1)
    stack.splice(index, 1);
}

export default {
  create,
  wakelock,
  release,
  register,
  unregister
};