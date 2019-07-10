// MIT License

// Copyright (c) 2019-2020 Herp Project

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// A very simple and small CSS-IN-JS implementation
// that supports selectors, pseudo-class, pseudo-element and attributes
// and custom features like extending

const camelRegex = /[A-Z]/g;
const selectorsRegex = /^\s|^>|^\+|^~/;
const classRegex = /^[a-z]|^-/i;

const betweenRegex = /[^{}]+(?=})/;

/** Creates a stylesheet,
* the returned object can be used to style elements via class names property
* @param { T } styles
* @template T
* @returns { T }
* @example
*
* const styles = createStyle({
*    bigBlue: {
*    color: 'blue',
*    fontWeight: 'bold',
*    fontSize: 30
*  }});
*
*  return <div className={styles.bigBlue}/>;
*/
export function createStyle(styles)
{
  let allCss = '';
  const newStyles = {};

  const directory = {};
  
  // loop the root object
  for (const key in styles)
  {
    const obj = styles[key];

    if (typeof obj !== 'object')
      continue;

    const {
      className,
      css
    } = handleStyle(key, obj, directory);

    // overall css string (all classes)
    allCss = allCss + css;

    directory[key] = css;
    newStyles[key] = className;
  }

  // append the stylesheet element to dom
  appendToDOM(allCss);
  
  // return the new class names to the user
  return newStyles;
}

/** @param { string } key
* @param { {} } obj
* @param { string } nest
*/
function handleStyle(key, obj, rootStylesheet, nest)
{
  let css = '';
  let additionalCss = '';

  // the values of the rules
  const values = Object.values(obj);

  // create a class name using the original class name as a prefix and a random characters
  const className = `${key}-${Math.random().toString(36).substr(2, 7)}`;

  // loop though the rules
  Object.keys(obj).forEach((rule, i) =>
  {
    // TODO add support for media queries

    // extent support
    // it was designed to duplicate style instead of adding the extend-ee class name
    // so that you can use extent inside of attributes and  pseudo-classes
    // we removed the class name extending to simplify the code and not have both functions
    if (rule === 'extend' && rootStylesheet)
    {
      if (!Array.isArray(values[i]))
        values[i] = [ values[i] ];

      values[i].forEach((v) =>
      {
        if (typeof v === 'string')
          css = css + rootStylesheet[v].match(betweenRegex)[0];
      });
    }
    else if (
      // it must be an attribute
      rule.startsWith('[') ||
      // it must be pseudo-class or pseudo-element
      rule.startsWith(':') ||
      // other selectors
      selectorsRegex.test(rule)
    )
    {
      if (typeof values[i] === 'object')
      {
        let nextParent = '';

        if (nest)
          nextParent = `${nest}${rule}`;
        else
          nextParent = `${className}${rule}`;

        additionalCss = additionalCss + `.${nextParent}${handleStyle(rule, values[i], rootStylesheet, nextParent)}`;
      }
    }
    // class selector
    else if (classRegex.test(rule))
    {
      if (typeof values[i] === 'string' || typeof values[i] === 'number')
      {
        // transform rule name from camelCase to no-caps
        const noCaps = rule.replace(camelRegex, (c) => `-${c.toLowerCase()}`);
    
        // add the rule name and the value to the class css string
        css = css + `${noCaps}: ${values[i]};`;
      }
    }
    else
    {
      console.warn(`flcss warning: "${rule}" is unsupported rule and it was ignored`);
    }
  });

  if (!nest)
  {
    return {
      className: className,
      css: `.${className}{${css}}${additionalCss}`
    };
  }
  else
  {
    return `{${css}}${additionalCss}`;
  }
}

/** @param { string } css
*/
function appendToDOM(css)
{
  // if document is not null
  if (typeof document !== 'undefined')
  {
    const stylesheetElement = document.createElement('style');

    // stylesheet is css
    stylesheetElement.type = 'text/css';

    // append the css string to the stylesheet element
    stylesheetElement.appendChild(document.createTextNode(css));

    // append the element to head
    document.head.appendChild(stylesheetElement);
  }
}