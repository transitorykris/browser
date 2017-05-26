const electron = require('electron')
const app = electron.app // Module to control application life.
const BrowserWindow = electron.BrowserWindow // Module to create native browser window.
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev') // Module to check to see if we're running in prod or in dev
const protocol = electron.protocol // Module to manage custom protocol schemes
const log = require('electron-log')
const exec = require('child_process').exec
const { shell } = require('electron')

// Make sure logging is actually enabled
log.transports.file.level = true
log.transports.console.level = true

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 800, minHeight: 710,
    width: 800, height: 710,
    frame: true,
    titleBarStyle: 'hidden-inset',
  })

  log.info("Registering upspin:// scheme")
  protocol.registerFileProtocol('upspin', upspinProtocolHandler, upspinProtocolCompletion)

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  })
  mainWindow.loadURL(startUrl)
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  require('./Menu')
}

function upspinProtocolHandler(request, cb) {
  log.info("upspinProtocolHandler called")
  // XXX this isn't working
}

function upspinProtocolCompletion(error) {
  if (!error) {
    log.info("upspin:// scheme sucessfully registered")
  } else {
    log.info("Failed to register upspin:// scheme")
  }
}

// Do not allow a second instance of Jngl to start
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore()
    myWindow.focus()
  }
})

if (shouldQuit) {
  app.quit()
}

// Set up the About panel
app.setAboutPanelOptions({
  applicationName: "Jngl",
  applicationVersion: "Early Release",
  copyright: "Copyright © 2017 Jn.gl. All Rights Reserved.",
  credits: "Includes code Copyright © 2016 The Upspin Authors. All rights reserved. github.com/upspin/upspin/blob/master/LICENSE",
  version: "0.1.0",
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Handle an open-url event which happens when a user tries to open
// a URL with the upspin:// schema
// https://electron.atom.io/docs/api/app/#event-open-url-macos
app.on('open-url', function(event, openUrl) {
  event.preventDefault() // docs say to do this
  log.info("Hello from open-url", event, openUrl)
  upspinDownload(openUrl)
})

// Handle an open-file event which happens when a user drags a file
// onto the dock icon or the OS wants to use the app to open a file
// https://electron.atom.io/docs/api/app/#event-open-file-macos
app.on('open-file', function(event, path) {
  log.info("Hello from open-file", event, path)
  // What do we want to do here? This is fired when a drag-and-drop
  // onto the dock icon
  //shell.showItemInFolder(path)
})

// Call out to upspin cp to grab this file
function upspinDownload(upspinUrl) {
  const parsed = url.parse(upspinUrl)
  const path = parsed.auth+"@"+parsed.hostname+parsed.pathname
  const filename = parsed.pathname.split("/").pop()

  log.info("Getting:", path)
  log.info("Filename:", filename)

  const fileLocation = app.getPath('home')+'/Downloads/'+filename

  const clientCmd = app.getAppPath()+'/jnglctl get '+path+' > '+fileLocation
  exec(clientCmd, (error, stdout, stderr) => {
    if (error) {
      // Do something!!
      log.error("upspinDownload", error)
      return
    }
    log.info("stdout:", stdout)
    log.info("stderr:", stderr)
    log.info("Giving downloads a bounce for", fileLocation)
    app.dock.downloadFinished(fileLocation)
    log.info("Trying to open finder for", fileLocation)
    shell.showItemInFolder(fileLocation)
  })
}
