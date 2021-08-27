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