/**
* @type {import("snowpack").SnowpackUserConfig }
*/
const config = {
  mount: {
    src: '/',
    public: { url: '/', static: true, resolve: false }
  },
  env: {
    RELEASE: process.env.COMMIT_REF ?? 'development',
    API_ENDPOINT: process.env.NODE_ENV === 'production' ? 'https://api.airtegal.me': 'http://localhost:3000'
  },
  plugins: [
    [ 'snowpack-plugin-json5' ],
    [ '@snowpack/plugin-webpack' ],
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
  // optimize: {
  //   bundle: true,
  //   minify: true,
  //   target: 'es2018'
  // },
  devOptions: {
    open: 'none',
    hmr: false
  },
  routes: [
    {
      match: 'routes',
      dest: '/index.html',
      src: '.*'
    }
  ]
};

export default config;