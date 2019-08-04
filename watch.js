const chokidar = require('chokidar');
const Queue = require('better-queue');
const { spawn, spawnSync } = require('child_process');

// Object that keeps track of which names have active processes
nameToActiveProcess = {}

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


function setupWatcher(name, regexes, cmd, args) {
  chokidar.watch(regexes).on('change', async (event, path) => {
    // NOTE: We might need to lock on nameToActiveProcess
    if (!nameToActiveProcess[name]) {
      nameToActiveProcess[name] = true;

      processQueue.push([name, cmd, args]);
    }
  });
}

module.exports = async (config) => {

  setupWatcher('test', ['contracts/', 'test/'], 'truffle', ['test']);

}
