import i18n from './i18n.js';

export const firstNames = i18n('stupid-first-names');
export const lastNames = i18n('stupid-last-names');

export function randomFirstName(firstNames)
{
  if (process.env.NODE_ENV === 'test')
    firstNames = [ 'اسلام' ];
  
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

export function randomLastName(lastNames)
{
  if (process.env.NODE_ENV === 'test')
    lastNames = [ 'المرج' ];
  
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

export default function stupidName()
{
  return `${randomFirstName(firstNames)} ${randomLastName(lastNames)}`;
}