module.exports = {
  'globDirectory': 'public',
  'globPatterns': [
    '*.{png,html,json,js}'
  ],
  'globIgnores': [
    '**/node_modules/**/*',
    '**/sw.js'
  ],
  'swDest': 'public/sw.js',
  'swSrc': 'src/sw.js'
};