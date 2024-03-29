const chokidar = require('chokidar');
const fs = require('fs')
const Queue = require('better-queue');
const { spawnSync } = require('child_process');

DEFAULT_WATCHER_CONFIG = {
  'test': {
    'cmd': 'truffle',
    'args': ['test'],
    'files': ['contracts/', 'test/']
  }
}

function loadWatcherConfig(configFile) {
  let rawdata = fs.readFileSync(configFile);
  return JSON.parse(rawdata);
}

// Object that keeps track of which names have active processes
nameToActiveProcess = {}

// Queue for synchronously running each logging command
processQueue = new Queue((procDef, cb) => {
  const [name, cmd, args] = procDef;

  spawnSync(cmd, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr],
    encoding: 'utf-8'
  })

  nameToActiveProcess[name] = false;

  cb(null);
});

/**
 * Setup a watcher for a single command/regex
 */
function setupWatcher(name, regexes, cmd, args) {
  chokidar.watch(regexes).on('change', async (event, path) => {
    // Don't allow multiple processes of the same name be added to the queue simultaneously!
    if (!nameToActiveProcess[name]) {
      nameToActiveProcess[name] = true;

      processQueue.push([name, cmd, args]);
    }
  });
}

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

module.exports = async (config) => {
  if (config.help) {
    console.log('Usage: truffle run watch [options]');
    console.log('');
    console.log('Options:');
    console.log('  --config [CONFIG_FILE]     Use the specified CONFIG_FILE to determine watchers');
    return;
  }

  watcherConfig = config.config ? loadWatcherConfig(config.config) : DEFAULT_WATCHER_CONFIG;
  for (var name in watcherConfig) {
    setupWatcher(
      name,
      watcherConfig[name]['files'],
      watcherConfig[name]['cmd'],
      watcherConfig[name]['args']
    )
  }

  // NOTE: not the cleanest way to avoid exiting, but it works
  while (true) {
    await delay(2000);
  }
}
