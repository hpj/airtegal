/**
* @param { string } color
* @param { number } opacity
*/
export function opacity(color, opacity)
{
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function()
{
  const dark = detectDeviceIsDark();

  const lightTheme = {
    theme: 'light',
    
    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
   
    blackText: '#000000',
    blackBackground: '#000000',
   
    handler: '#867878',
    
    greyText: '#6e6767',
    accentColor: '#454545',
   
    roomBackground: '#C4C4C4',
    roomForeground: '#000000',

    trackBarBackground: '#ffffff',
    trackBarScrollbar: '#000000',
   
    optionsScrollbar: '#867878',

    fieldBackground: '#2f2e2e',
    fieldScrollbar: '#262626',
   
    handBackground: '#C4C4C4',
    handScrollbar: '#949393',
   
    blackCardBackground: '#000000',
    blackCardForeground: '#ffffff',
    blackCardHover: '#484848',

    whiteCardBackground: '#ffffff',
    whiteCardForeground: '#000000',
    whiteCardHover: '#000000',
    
    winner: '#d4af37',

    error: '#ad1818',
    
    entryLine: '#ffffff',

    transparent: 'transparent'
  };

  const darkTheme = {
    ...lightTheme,

    theme: 'dark',

    whiteText: '#ffffff',
    whiteBackground: '#211f1f',

    blackBackground: '#101010',
    blackText: '#c3c3c3',

    accentColor: '#c3c3c3',

    roomBackground: '#3e3d3d',
    roomForeground: '#ffffff',

    trackBarBackground: '#211f1f',
    trackBarScrollbar: '#c3c3c3',

    optionsScrollbar: '#3d3a3a',

    fieldBackground: '#191818',
    fieldScrollbar: '#c3c3c3',

    handBackground: '#292929',
    handScrollbar: '#867878',

    blackCardBackground: '#3c3c3c',
    blackCardForeground: '#e2e1e1',
    blackCardHover: '#060606',

    whiteCardBackground: '#989898',
    whiteCardForeground: '#040404',
    whiteCardHover: '#696060',

    entryLine: '#696060'
  };

  return dark ? darkTheme : lightTheme;
}

export function detectDeviceIsDark()
{
  if (localStorage.getItem('forceDark') === 'true')
    return true;
  else if (localStorage.getItem('forceDark') === 'false')
    return false;
  else
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}