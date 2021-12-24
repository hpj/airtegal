/**
* @type { import("snowpack").SnowpackUserConfig }
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
    [
      'snowpack-plugin-esbuild', {
        input: [ '.js' ],
        sourcemap: true,
        /** @type { import('esbuild').TransformOptions } */
        options: {
          loader: 'jsx',
          sourcemap: 'inline',
          target: process.env.NODE_ENV === 'production' ? [ 'chrome93', 'safari12', 'firefox92' ] : [ 'chrome96' ]
        }
      }
    ]
  ],
  packageOptions: {
    knownEntrypoints: [
      'regenerator-runtime',
      'qr-scanner/qr-scanner-worker.min.js'
    ]
  },
  buildOptions: {
    out: '__build__'
  },
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