import i18n from './i18n.js';

const firstName = i18n('stupid-first-names');
const lastName = i18n('stupid-last-names');

function randomFirstName()
{
  return firstName[Math.floor(Math.random() * firstName.length)];
}

function randomLastName()
{
  return lastName[Math.floor(Math.random() * lastName.length)];
}

export default function stupidName()
{
  return `${randomFirstName()} ${randomLastName()}`;
}