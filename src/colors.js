/**
* @param { string } color
* @param { number } opacity
*/
export function opacity(color, opacity)
{
  return `${color}${Math.floor(opacity * 255).toString(16)}`;
}

export default function()
{
  const dark = detectDeviceIsDark();

  const lightTheme = {
    theme: 'light',
    
    transparent: 'transparent',

    error: '#ad1818',

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
    fieldGroupLine: '#ffffff',
    fieldScrollbar: '#262626',
   
    handBackground: '#C4C4C4',
    handScrollbar: '#949393',
   
    blackCardBackground: '#000000',
    blackCardForeground: '#ffffff',
    blackCardHover: '#484848',

    whiteCardBackground: '#ffffff',
    whiteCardForeground: '#000000',
    whiteCardHighlight: '#d4af37',
    whiteCardHover: '#000000'
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

    fieldBackground: '#1a1a1a',
    fieldGroupLine: '#696060',
    fieldScrollbar: '#c3c3c3',

    handBackground: '#2e2e2e',
    handScrollbar: '#867878',

    whiteCardBackground: '#989898',
    whiteCardForeground: '#040404',
    whiteCardHover: '#696060'
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