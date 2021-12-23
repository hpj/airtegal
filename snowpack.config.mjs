/**
* @type {import("snowpack").SnowpackUserConfig }
*/
export default {
  mount: {
    src: '/',
    public: { url: '/', static: true, resolve: false }
  },
  env: {
    RELEASE: 'development',
    API_ENDPOINT: process.env.NODE_ENV === 'production' ? 'https://api.airtegal.me': 'http://localhost:3000'
  },
  plugins: [
    'snowpack-plugin-json5',
    [
      'snowpack-plugin-swc', {
        'input': [ '.js' ]
      }
    ]
  ],
  packageOptions: {
    knownEntrypoints: [
      'regenerator-runtime',
      'qr-scanner/qr-scanner-worker.min.js'
    ]
  },
  buildOptions: {},
  devOptions: {
    open: 'none'
  },
  routes: [
    {
      match: 'routes',
      dest: '/index.html',
      src: '.*'
    }
  ]
};
