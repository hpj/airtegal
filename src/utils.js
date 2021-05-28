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