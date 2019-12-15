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

// const betweenRegex = /[^{}]+(?=})/;

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
*    fontSize: '12px'
*  }});
*
*  return <div className={styles.bigBlue}/>;
*/
export function createStyle(styles)
{
  const newStyles = {};
  const directory = {};
  
  // loop the root object
  for (const key in styles)
  {
    const obj = styles[key];

    if (typeof obj !== 'object')
      continue;

    const { className, css }  = handleStyle(key, obj, newStyles, directory);

    newStyles[key] = className;
    directory[key] = css;
  }

  // append the stylesheet element to dom
  appendToDOM(Object.values(directory).join(''));
  
  // return the new class names to the user
  return newStyles;
}

/** Creates a CSS animation
* @param { { keyframes: string, options: { returnNameOnly: boolean }, duration: string, timingFunction, delay: string, iterationCount, direction, fillMode } } animation
*
* @example
*
* const animationA = createAnimation({
*    duration: '4s',
*    keyframes: `
*    from: { background-color: red; }
*    to: { background-color: yellow; }
*    `,
* });
*
* const styles = createStyle({
*    someMovingThingy: {
*    width: '35%',
*    height: '15%',
*    animation: animationA
*  }});
*
*  return <div className={styles.someMovingThingy}/>;
*/
export function createAnimation(animation)
{
  // make sure that no strings equal 'undefined'
  // set default values

  animation.options = animation.options || {};

  animation.timingFunction = animation.timingFunction || 'ease';
  animation.delay = animation.delay || '0s';
  animation.iterationCount = animation.iterationCount || '1';
  animation.direction = animation.direction || 'normal';
  animation.fillMode = animation.fillMode || 'none';

  // generate a random name for the animation
  const animationName = `flcss-animation-${Math.random().toString(36).substr(2, 7)}`;

  // the animation's css string
  const css = `@keyframes ${animationName}{${animation.keyframes}}`;

  // append the css string to DOM
  appendToDOM(css);

  // return a string the developers can use with createStyle()
  if (animation.options.returnNameOnly)
    return animationName;
  else
    return `${animationName} ${animation.duration} ${animation.timingFunction} ${animation.delay} ${animation.iterationCount} ${animation.direction} ${animation.fillMode}`.replace(/\s+/g, ' ');
}

/** @param { string } key
* @param { {} } obj
* @param { {} } rootDirectory
* @param { {} } rootStylesheet
* @param { string } nest
*/
function handleStyle(key, obj, rootDirectory, rootStylesheet, nest)
{
  let css = '';
  let additionalCss = '';

  // the values of the rules
  const values = Object.values(obj);

  // create a class name using the original class name as a prefix and a random characters
  const className = `flcss-${key}-${Math.random().toString(36).substr(2, 7)}`;

  // loop though the rules
  Object.keys(obj).forEach((rule, i) =>
  {
    // extent support
    if (rule === 'extend' && rootStylesheet)
    {
      if (!Array.isArray(values[i]))
        values[i] = [ values[i] ];
      
      values[i].forEach((v) =>
      {
        const originalClassnames = rootDirectory[v];

        rootStylesheet[v] = rootStylesheet[v].replace(new RegExp(`${originalClassnames}.*?{`, 'g'), (s) =>
        {
          const add = s.replace(originalClassnames, '').replace('{', '');
          
          return `${originalClassnames}${add}, .${className}${add}{`;
        });
      });
    }
    else if (
      // it must be an attribute
      rule.startsWith('[') ||
      // it must be an class
      rule.startsWith('.') ||
      // it must be an tag
      rule.startsWith('#') ||
      // it must be pseudo-class or pseudo-element
      rule.startsWith(':') ||
      rule.startsWith('::') ||
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

        additionalCss = additionalCss + `.${nextParent}${handleStyle(rule, values[i], rootDirectory, rootStylesheet, nextParent)}`;
      }
    }
    // at-rule selector
    else if (rule.startsWith('@'))
    {
      const nextParent = `${className}`;
      
      additionalCss = additionalCss + `${rule}{.${nextParent}${handleStyle(rule, values[i], rootDirectory, rootStylesheet, nextParent)}}`;
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