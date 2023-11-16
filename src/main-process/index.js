const { app, BrowserWindow, screen, ipcMain } = require('electron');
const { fork } = require('child_process')
const path = require('path');
const serve = require('electron-serve');
const loadURL = serve({ directory: 'public' });
const findOpenSocket = require('./find-open-socket');
const { autoUpdater } = require('electron-updater');

let screenWidth;
let screenHeight;
let clientWin;
let serverProcess;

function isDev() {
    return !app.isPackaged;
}

/* Function to create the window for the renderer process */
function createWindow(socketName) {
    clientWin = new BrowserWindow({
        width: screenWidth,
        height: screenHeight,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'client-preload.js')
        },
        icon: path.join(__dirname, '..', '..', 'public', 'logo.png'),
        show: false,
        autoHideMenuBar: true,
        roundedCorners: true,
        backgroundColor: '#FFF'
    });

    if (isDev()) {
        clientWin.loadURL('http://localhost:5000/');
    } else {
        loadURL(clientWin);
    }

    clientWin.on('closed', function () {
        clientWin = null
    });

    clientWin.once('ready-to-show', () => {
        clientWin.maximize();
        clientWin.show()
    });

    clientWin.webContents.on('did-finish-load', () => {
        clientWin.webContents.send('set-socket', {
          name: socketName
        })
    })
}

/* Function to create server process as fork of the main process */
function createBackgroundProcess(socketName) {
    serverProcess = fork(path.join(__dirname, '..', 'server-process', 'server.js'), [
        '--subprocess',
        socketName,
        app.isPackaged,
        app.getPath('userData')
    ])
}

/* When an update is downlaoded, atuomatically install it */
autoUpdater.on('update-downloaded', (ev, info) => {
    autoUpdater.quitAndInstall();
})

/* When app is ready, check for update and then create renderer and sercer processes */
app.on('ready', async () => {
    /* Change the file server info in package.json 
    ** the file to be stored on the server are: latest.yml, setup.exe and setup.exe.blockmap
    ** Different providers are supported out of the box, to avoid a generic file server
    ** Check https://www.electron.build/configuration/publish for the options available
    */
    if(!isDev()) autoUpdater.checkForUpdates();

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    screenWidth = width;
    screenHeight = height;
    let serverSocket = await findOpenSocket();

    createWindow(serverSocket);
    createBackgroundProcess(serverSocket);
});

app.on('activate', async () => {
    let serverSocket = await findOpenSocket()

    if (clientWin === null) createWindow(serverSocket)
});

/* When window is closed, quit the app and ensure that server process is killed as well */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

app.on('before-quit', () => {
    if (serverProcess) {
      serverProcess.kill()
      serverProcess = null
    }
})