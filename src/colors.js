/**
* @param { boolean } forceLight
*/
export default function(forceLight)
{
  const dark = !forceLight && detectDeviceIsDark();

  const lightTheme = {
    theme: 'light',
    
    holder: '#000000',

    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
   
    blackText: '#000000',
    blackBackground: '#000000',
   
    greyText: '#6e6767',
   
    handler: '#867878',
    accentColor: '#454545',
   
    selectBackground: '#3B5FFF',

    roomBackground: '#C4C4C4',
    roomForeground: '#000000',

    pocketHandler: '#ffffff',

    trackBarBackground: '#ffffff',
    trackBarScrollbar: '#000000',
   
    optionsScrollbar: '#867878',

    fieldBackground: '#545454',
    fieldScrollbar: '#262626',
   
    handBackground: '#C4C4C4',
    handScrollbar: '#949393',
   
    pinnedBackground: '#00aeff',
   
    headerGradient: [ '#F05F57', '#360940' ],
   
    playBackgroundGradient: [ '#000000', '#b9444e' ],
    playBackgroundText: '#b9444e',
   
    playButtonGradient: [ '#ff71e7', '#ff092d' ],
   
    client: '#000000',
    master: '#f200f5',
    turn: '#00aeff',

    blackCardBackground: '#000000',
    blackCardForeground: '#ffffff',
    blackCardHover: '#484848',

    whiteCardBackground: '#ffffff',
    whiteCardForeground: '#000000',
    whiteCardHover: '#000000',
    
    entryLine: '#000000',

    vote: '#28a500',
    winner: '#d4af37',
   
    red: 'red',
    error: '#ad1818',
    transparent: 'transparent'
  };

  const darkTheme = {
    ...lightTheme,

    theme: 'dark',

    holder: '#564f4f',

    whiteText: '#ffffff',
    whiteBackground: '#211f1f',

    blackBackground: '#101010',
    blackText: '#c3c3c3',

    roomBackground: '#3e3d3d',
    roomForeground: '#ffffff',

    pocketHandler: '#867878',

    trackBarBackground: '#211f1f',
    trackBarScrollbar: '#c3c3c3',

    optionsScrollbar: '#3d3a3a',

    fieldBackground: '#191818',
    fieldScrollbar: '#c3c3c3',

    handBackground: '#292929',
    handScrollbar: '#867878',

    blackCardBackground: '#3c3c3c',
    blackCardForeground: '#e2e1e1',
    blackCardHover: '#615f5f',

    whiteCardBackground: '#989898',
    whiteCardForeground: '#040404',
    whiteCardHover: '#040404',

    client: '#ffffff',

    error: '#710c0c',

    entryLine: '#696060',

    red: '#9c0202',

    accentColor: '#c3c3c3'
   
    // selectBackground: '#1c1d24',

    // headerGradient: [ '#4a225a', '#000004' ],
    
    // playBackgroundGradient: [ '#000000', '#4a225a' ],
    
    // playButtonGradient: [ '#56106d', '#a022d2' ]
  };

  return (dark) ? darkTheme : lightTheme;
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