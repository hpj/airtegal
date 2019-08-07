module.exports = {
  'globDirectory': 'public',
  'globPatterns': [
    '*.{png,html,css,json,js,ttf}'
  ],
  'globIgnores': [
    '**/node_modules/**/*',
    '**/sw.js'
  ],
  'swDest': 'public/sw.js',
  'swSrc': 'src/sw.js'
};