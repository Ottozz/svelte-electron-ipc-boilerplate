const { ipcRenderer, contextBridge } = require('electron');
const ipc = require('node-ipc').default;
const uuid = require('uuid');

// State
const replyHandlers = new Map()
const listeners = new Map()
let messageQueue = []
let socketClient = null

/* Function that creates the client socket and connects to the server socket */
const initClientIPC = async () => {
  const socketName = await getServerSocket();
  connectSocket(socketName);
}

/* Function that gets the server socket to connect to */
const getServerSocket = () => {
    let resolveSocketPromise;
  
    let socketPromise = new Promise(name => {
      resolveSocketPromise = name;
    })
    
    ipcRenderer.on('set-socket', (event, { name }) => {
      resolveSocketPromise(name);
    })

    return socketPromise;
}

/* Function that connect to the socket */
const connectSocket = (name) => {
  ipc.config.silent = true;
  ipc.connectTo(name);

  const client = ipc.of[name];

  client.on('message', data => {
    const msg = JSON.parse(data)

    if (msg.type === 'error') {
      // Up to you whether or not to care about the error
      const { id } = msg
      replyHandlers.delete(id)
    } else if (msg.type === 'reply') {
      const { id, result } = msg

      const handler = replyHandlers.get(id)
      if (handler) {
        replyHandlers.delete(id)
        handler.resolve(result)
      }
    } else if (msg.type === 'push') {
      const { name, args } = msg

      const listens = listeners.get(name)
      if (listens) {
        listens.forEach(listener => {
          listener(args)
        })
      }
    } else {
      throw new Error('Unknown message type: ' + JSON.stringify(msg))
    }
  })

  client.on('connect', () => {
    socketClient = client

    // Send any messages that were queued while closed
    if (messageQueue.length > 0) {
      messageQueue.forEach(msg => client.emit('message', msg))
      messageQueue = []
    }
  })

  client.on('disconnect', () => {
    socketClient = null
  })
}

/* Function to send messages through the socket */
function send(name, args) {
  return new Promise((resolve, reject) => {
    let id = uuid.v4()
    replyHandlers.set(id, { resolve, reject })
    if (socketClient) {
      socketClient.emit('message', JSON.stringify({ id, name, args }))
    } else {
      messageQueue.push(JSON.stringify({ id, name, args }))
    }
  })
}

/* Function to listen messages from the socket */
function listen(name, cb) {
  if (!listeners.get(name)) {
    listeners.set(name, [])
  }
  listeners.get(name).push(cb)

  return () => {
    let arr = listeners.get(name)
    listeners.set(name, arr.filter(cb_ => cb_ !== cb))
  }
}

/* Stop listening for messages */
function unlisten(name) {
  listeners.set(name, [])
}
  
contextBridge.exposeInMainWorld(
  'electron',
  {
    initClientIPC: initClientIPC,
    send: send,
    listen: listen,
    unlisten: unlisten
  }
)