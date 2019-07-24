const firstName = [
  'ابن',
  'ابو',
  'ام',
  'طيز',
  'حمادة',
  'حمار',
  'حاحا',
  'فشيخ',
  'بضان',
  'عنتيل'
];

const lastName = [
  'الابيض',
  'الاسمر',
  'مطوة',
  'السمكة',
  'فقير',
  'زبالة',
  'البقرة',
  'الشبح',
  'مزة'
];

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
  return randomFirstName() + ' ' + randomLastName();
}