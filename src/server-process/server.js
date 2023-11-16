let serverHandlers = require('./server-handlers');
let ipc = require('./server-ipc');

if (process.argv[2] === '--subprocess') {
  let socketName = process.argv[3];
  ipc.init(socketName, serverHandlers);
} else {
  let { ipcRenderer } = require('electron');

  ipcRenderer.on('set-socket', (event, { name }) => {
    ipc.init(name, serverHandlers)
  })
}
