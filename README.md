# truffle-watch

A truffle plugin for re-running commands when files change.

## Why

When developing contracts, we do a suite of checks regularly whenever we make changes:
- truffle compile
- truffle test
- [slither](https://github.com/crytic/slither)
...

truffle-watch enables you to run all of these checks in a single terminal session.

## Installation

1: Install the plugin
```
$ npm i truffle-watch
```

2: Add the plugin to `truffle.js` or `truffle-config.js`
```
module.exports = {
  /* ... rest of truffle-config */

  plugins: [
    'truffle-watch'
  ]
}
```

## Usage

Sample usages:

```
$ truffle watch
$ truffle watch --config config.json
```

Sample config:

```
{
  'test': {
    'cmd': 'truffle',
    'args': ['test'],
    'files': ['contracts/*.sol', 'test/*.js']
  },
  'slither': {
    'cmd': 'slither',
    'args': ['.'],
    'files': ['contracts/*.sol']
  }
}
```

Default config:

```
{
  'test': {
    'cmd': 'truffle',
    'args': ['test'],
    'files': ['contracts/', 'test/']
  }
}
```
