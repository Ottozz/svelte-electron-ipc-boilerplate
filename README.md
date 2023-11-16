<div align="center">
<img alt="Electron Svelte Crossover Banner" src="https://raw.githubusercontent.com/soulehshaikh99/assets/master/create-electron-framework-app/readme/svg/Electron_Svelte.svg" width="580" />
</div>
<br />
The boilerplate code to get started creating Cross-platform Desktop Apps with Electron and Svelte as front-end technology. Inter-Process Communication is implemented to allow data transfer between the processes.

This has been created starting from the [soulehshaikh99/create-svelte-electron-app](https://github.com/soulehshaikh99/create-svelte-electron-app) template.
<br />
<br />
<div align="center">

[![forthebadge](http://forthebadge.com/images/badges/built-by-developers.svg)](http://forthebadge.com)&nbsp;&nbsp;&nbsp;&nbsp;[![forthebadge](http://forthebadge.com/images/badges/makes-people-smile.svg)](http://forthebadge.com)<br />

[![forthebadge](http://forthebadge.com/images/badges/uses-html.svg)](http://forthebadge.com)&nbsp;&nbsp;&nbsp;[![forthebadge](http://forthebadge.com/images/badges/uses-css.svg)](http://forthebadge.com)&nbsp;&nbsp;&nbsp;[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

</div>

## ✒️ Overview

The aim of this project is to provide Web Developers using `svelte` the power to create cross-platform desktop apps using `electron`, while providing a working ipc implementation out of the box.

### 🧐 What packages does the project use?

**`electron`** enables you to create desktop applications with pure JavaScript by providing a runtime with rich native (operating system) APIs. You could see it as a variant of the Node.js runtime that is focused on desktop applications instead of web servers.

**`electron-builder`** is used as a complete solution to package and build a ready for distribution (supports Numerous target formats) Electron app with "auto update" support out of the box.

**`electron-serve`** is used for Static file serving for Electron apps.

**`electron-updater`** is used to automatically check and install updates when available.

**`svelte`** is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the browser, Svelte shifts that work into a compile step that happens when you build your app. Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.

**`concurrently`** is used to run multiple commands concurrently.

**`wait-on`** is used as it can wait for sockets, and http(s) resources to become available.

**`node-ipc`** is used to allow inter-process communication between main process, renderer process and server process.

**`svelte-spa-router`** is used for the routing of the renderer process. This is optional and can be replaced.
<br />

## 🚀 Getting Started

**Note:** If you wish to use npm over yarn then modify `package.json` by replacing `yarn` with `npm` in `electron-dev` and `preelectron-pack` scripts.
But I strongly recommend using <em>yarn</em> as it is a better choice when compared to <em>npm</em>.

### 🤓 Use this boilerplate

```bash
# Clone the Project

# or GitHub CLI Users
$ gh repo clone https://github.com/Ottozz/svelte-electron-ipc-boilerplate.git
# or Normal Git Users
$ git clone https://github.com/Ottozz/svelte-electron-ipc-boilerplate.git

# Switch location to the cloned directory
$ cd svelte-electron-ipc-boilerplate

# Install dependencies
$ yarn # or npm install

# Run your app
$ yarn electron-dev # or npm run electron-dev

# Package Your App
$ yarn electron-pack # or npm run electron-pack
```

## 💫 How does it work

This boilerplate uses three processes and let them communicate through a local <em>tcp socket</em>. Each process has a specific purpose and the folder structure reflects this implementation:

* **`Main process:`** The code executed by this process is in the `src/main-process` folder
* **`Server Process:`** The code executed by this process is in the `src/server-process` folder
* **`Renderer Process:`** The code executed by this process is in the `src/renderer-process` folder

### Main Process

The **main process** is created by default when the electron app is started. When the `ready` event is emitted, the following code is executed:

```js
app.on('ready', async () => {
    if(!isDev()) autoUpdater.checkForUpdates();

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    screenWidth = width;
    screenHeight = height;
    let serverSocket = await findOpenSocket();

    createWindow(serverSocket);
    createBackgroundProcess(serverSocket);
});
```

The `checkForUpdates()` function is invoked to check for updates, by connecting to the remote file server. The hostname and port of the server is defined in the `package.json`. If the update is found, it is automatically downloaded and installed by listening to the `update-downloaded` event.

**Note:** If you don't want to use a generic file server for the updates, different [options](https://www.electron.build/configuration/publish) are supported out of the box by the `electron-builder` module. 

After that, the process searches for a free socket name available with the method `findOpenSocket()` and pass the socket name to the functions `createWindow()` and `createBackgroundProcess()` :

* The `createWindow()` function creates the renderer process with `nodeIntegraion: false` and specifies the `client-preload.js` file as preload script to be executed before the creation. This file is responsible of defining the methods to initialize the client socket and send/listen messages and expose them to the renderer process trhough the `contextBridge.exposeInMainWorld()` method.
* The `createBackgroundProcess()` creates the server process by doing a fork of the main process. This could be avoided, but it follows the <em>separation of concern</em> principle and ensure that all the server logic is performed in a dedicated process.

### Server Process

All of the server side business logics , are implemented by this process, leveraging the power of Nodejs.

The `server.js` file is the entry point of the process. Here, the `init()` method of the `server-ipc.js` file is invoked. This creates the server socket and defines the `send()` method to broadcast messages to all the clients connected.

The file `server-handlers.js` exports and object which defines the messages to be listened and the functions to be invoked when the respective message is received. The folder `services` contains the implementaion of these functions.

### Renderer Process

This is the process that creates the broswer window and all of the front-end code inside it, using Svelte.

The `main.js` file is the entry point and renders the `App` component. When the component is mounted, the `initclientIPC()` method, exposed by the main process, is invoked. After that, messages can be sent to the server process from any .svelte file through the exposed `send()` method.

```js
onMount(async () => {
		/* Invoke the method exposed by the main process to create the client socket */
		await window.electron.initClientIPC();

		/* Once initialized, messges can be sent to the server process like this */
		let params; //can be any type of input. String/Array/Object...
		await window.electron.send('message', params);
	});
```
The `App` component also include the `<Router>` tag to allow routing; the rules are defined in the `routes.js` file. The [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router) is used.

As for the folder strucutre:
* The `pages` folder contains all of the svelte components for which a route is defined.
* The `components` folder contains the svelte components imported and used by pages or other components.

