/**
* @type { { touch: boolean, randos: boolean, kuruit: boolean } }
*/
const features = {};

/**
* @param { Object<string, string> } flags
*/
export const setFeatures = flags =>
{
  // eslint-disable-next-line security/detect-object-injection
  Object.keys(flags).forEach(k => features[k] = flags[k] === 'true') ;
};

export default features;