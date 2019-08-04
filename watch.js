const chokidar = require('chokidar');
const { spawn } = require('child_process');

function setupWatcher(name, regexes, cmd, args) {
  chokidar.watch(regexes).on('change', async (event, path) => {
    const proc = spawn(cmd, args);

    proc.stdout.on('data', (data) => {
      process.stdout.write(`${data}`);
    });

  });
}

module.exports = async (config) => {

  setupWatcher('test', ['contracts/', 'test/'], 'truffle', ['test']);

}
