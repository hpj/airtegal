import i18n from './i18n.js';

export const firstNames = i18n('stupid-first-names');
export const lastNames = i18n('stupid-last-names');

export function randomFirstName()
{
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

export function randomLastName()
{
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

export default function stupidName()
{
  return `${randomFirstName()} ${randomLastName()}`;
}