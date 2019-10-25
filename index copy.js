const electron = require('electron');
const log4js = require('log4js');
const TCPRelay = require('shadowsocks-over-websocket').TCPRelay;
const { app, ipcMain, BrowserWindow, Tray, Menu } = electron;

let win = null;
let tray = null;

// Don't show the app in the doc
// app.dock.hide();

const DEBUG = true;

var logger = log4js.getLogger('ss-over-ws-gui');
var running = false;
var relay = null;

function createWindow() {
  win = new BrowserWindow({
    width: DEBUG ? 520 : 320,
    height: 500,
    resizeable: false,
    maximizable: false,
    minimizable: false,
    icon: './icon_128.png',
    movable: true,
    fullscreen: false,
    fullscreenable: false,
    titleBarStyle: 'default',
    webPreferences: {
      devTools: DEBUG,
    },
  });

  win.loadURL(`file://${__dirname}/assets/html/index.html`);
  win.on('closed', () => {
    win = null;
    tray = null;
  });

  win.on('close', event => {
    win.hide();
    event.preventDefault();
  });

  win.on('blur', () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide();
    }
  });

  // win.show();
}

const toggleWindow = () => {
  if (win.isVisible()) {
    win.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  win.show();
  win.focus();
};

function createTray() {
  tray = new Tray('./normal.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '配置',
      click: function() {
        toggleWindow();
      },
    },
    {
      label: '退出',
      click: function() {
        quitApp();
      },
    },
  ]);
  tray.setToolTip('shadowsocks');
  tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('window all closed');
  app.quit();
});

app.on('activate', () => {
  console.log('app active');
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('app-start', function(event, config) {
  relay = new TCPRelay(config, true);
  relay
    .bootstrap()
    .then(function() {
      logger.info('tcprelay is running', config);
      running = true;
      event.sender.send('sslocal-status-change', true);
    })
    .catch(function(error) {
      logger.error(error);
      running = false;
      event.sender.send('sslocal-status-change', false);
    });
});

ipcMain.on('app-shutdown', function(event) {
  relay &&
    relay.stop().then(function() {
      logger.info('tcprelay is stopped');
      running = false;
      event.sender.send('sslocal-status-change', false);
      relay = null;
    });
});

function quitApp() {
  logger.info('quitApp');
  if (relay) {
    relay.stop().then(() => {
      logger.info('tcprelay is stopped');
      relay = null;
      setTimeout(() => {
        tray.destroy();
        app.quit();
      }, 3000);
    });
  } else {
    tray.destroy();
    app.quit();
  }
}
