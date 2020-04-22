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

// Keeps track of which names have active processes
let nameToActiveProcess = {}

// Keeps track of where to log output for each name
let nameToOutputStream = {}

// Queue for synchronously running each logging command
let processQueue = new Queue((procDef, cb) => {
  const [name, cmd, args] = procDef;
  let outputStream = nameToOutputStream[name] ? nameToOutputStream[name] : process.stdout;

  spawnSync(cmd, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: [
      process.stdin,
      outputStream,
      process.stderr
    ],
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

function setupLogFiles(logDir, names) {
  for (let name of names) {
    let filename = `${logDir}/${name}.log`;
    nameToOutputStream[name] = fs.createWriteStream(filename);
  }

  // Make sure to close all opened files if we exit unexpectedly
  process.on('exit', (code) => {
    for (var name in nameToOutputStream) {
      nameToOutputStream[name].close();
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
    console.log('  --logDir [LOG_DIR]         Spit output to log files in the specified dir instead of stdout');
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

  if (config.logDir) {
    setupLogFiles(config.logDir, Object.keys(watcherConfig))
  }

  // NOTE: not the cleanest way to avoid exiting, but it works
  while (true) {
    await delay(2000);
  }
}
