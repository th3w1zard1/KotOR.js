The starting point of the application is main.js, which resides in the root directory

Once main.js is run in nodeJS it does a few key things
* Requires electron by calling `import { app, BrowserWindow } from 'electron';`
* Initializes the IPC protocol by calling `import { ipcMain } from 'electron';`
* And launches the main launcher window by running `createLauncherWindow()` method inside the `app.on('ready')` callback

Inside the `createLauncherWindow()` method it creates a new `BrowserWindow` (Think of it like a chrome tab) pointing to the "dist/launcher/launcher.html" file.

Inside the new Launcher BrowserWindow everything works pretty much the same as any webpage. We no longer have direct access to Node.js in the BrowserWindows. We can still call Node.js code and receive the output, by including a preload script for each window. We can also use this preload script to execute IPC calls back to the main process. With the use of `contextBridge.exposeInMainWorld`, we can expose our JS methods defined in the preload script so that they can be called from inside the window environment.

The launcher window uses `electron.launchProfile` which was exposed by the included preload script. `ipcMain` inside main.js will be listening for a message called `"launch_profile"`. This message will be sent from the launcher window when a user attempts to open either one of the supported games or the forge modding suite.

When ipcMain receives the "launch_profile" message, it executes the createWindowFromProfile() method. This method hides the launcher BrowserWindow and opens a new BrowserWindow with the supplied profile configuration sent from the launcher window. The preload script is also used by these BrowserWindows.