const ipc = require('node-ipc').default;

ipc.config.silent = true;

function isSocketTaken(name, fn) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(false);
      });

      ipc.of[name].on('connect', () => {
        ipc.disconnect(name);
        resolve(true);
      });
    });
  });
}

async function findOpenSocket() {
  let currentSocket = 1;
  while (await isSocketTaken('socket-' + currentSocket)) {
    currentSocket++;
  }
  return 'socket-' + currentSocket;
}

module.exports = findOpenSocket;
