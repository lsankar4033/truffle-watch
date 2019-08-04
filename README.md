# truffle-watch

A truffle plugin for re-running commands when files change.

## Why

When developing contracts, we do a suite of checks regularly whenever we make changes:
- truffle compile
- truffle test
- [slither](https://github.com/crytic/slither)
...

truffle-watch enables you to run all of these checks in a single terminal session.

## Example usage, etc.

Sample usages:

```
$ truffle watch
$ truffle watch --compile --slither
$ truffle watch --compile Token.sol
```

Sample config:

```
{
  "slither": {
    "cmd": "slither .",
    "files": ["contracts/*.sol", "test/*.js"]
  }
}
```
