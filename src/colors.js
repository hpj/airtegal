 export const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
* @param { boolean } forceMain
*/
export default function(forceMain)
{
  const dark = !forceMain && darkMode && false;

  const mainTheme = {
    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
   
    blackText: '#000000',
    blackBackground: '#000000',
   
    greyText: '#6e6767',
   
    handler: '#867878',
    accentColor: '#454545',
   
    selectBackground: '#3B5FFF',

    trackBarBackground: '#ffffff',
    trackBarScrollbar: '#000000',
   
    fieldBackground: '#545454',
    fieldScrollbar: '#262626',
   
    handBackground: '#C4C4C4',
    handScrollbar: '#949393',
   
    warningBackground: '#00aeff',
   
    headerGradient: [ '#F05F57', '#360940' ],
   
    playBackgroundGradient: [ '#000000', '#af1111' ],
   
    playButtonGradient: [ '#ff71e7', '#ff092d' ],
   
    client: '#000000',
    master: '#f200f5',
    turn: '#00aeff',

    blackCardBackground: '#000000',
    blackCardForeground: '#ffffff',

    whiteCardBackground: '#ffffff',
    whiteCardForeground: '#000000',
   
    red: 'red',
    error: '#ad1818',
    transparent: 'transparent'
  };

  const darkTheme = {
    ...mainTheme,

    whiteText: '#ffffff',
    whiteBackground: '#000000',

    blackBackground: '#313131',
    blackText: '#c3c3c3',

    trackBarBackground: '#191818',
    trackBarScrollbar: '#c3c3c3',

    fieldBackground: '#000000',
    fieldScrollbar: '#ffffff',

    handBackground: '#292929',
    handScrollbar: '#867878',

    blackCardBackground: '#272727',
    blackCardForeground: '#ffffff',

    client: '#ffffff'

    // accentColor: '#4d4949',
   
    // selectBackground: '#1c1d24',

    // headerGradient: [ '#4a225a', '#000004' ],
    
    // playBackgroundGradient: [ '#000000', '#4a225a' ],
    
    // playButtonGradient: [ '#56106d', '#a022d2' ]
  };

  return (dark) ? darkTheme : mainTheme;
}