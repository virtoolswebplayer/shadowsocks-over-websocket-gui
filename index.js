const electron = require('electron');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const TCPRelay = require('shadowsocks-over-websocket').TCPRelay;
const { app, ipcMain, BrowserWindow, Tray, Menu } = electron;

// 配置容口
let configWin = null;
// 托盘
let tray = null;
// 菜单
let contextMenu;
// 中继器
var relay = null;

// app.dock.hide();

const DEBUG = false;

var logger = log4js.getLogger('ss-over-ws-gui');
var running = false;

// 创建配置窗口
function createConfigWindow() {
  configWin = new BrowserWindow({
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

  configWin.loadURL(`file://${__dirname}/assets/html/index.html`);
  configWin.on('closed', () => {
    configWin = null;
  });

  // configWin.show();
}

const showConfigWindow = () => {
  !configWin && createConfigWindow();
  !configWin.isVisible() && configWin.show();
  configWin.focus();
};

// 创建托盘
function createTray() {
  tray = new Tray('./normal.png');
  contextMenu = Menu.buildFromTemplate([
    {
      label: '运行',
      click: function() {
        startup();
      },
    },
    {
      label: '停止',
      visible: false,
      click: function() {
        shutdown();
      },
    },
    {
      label: '配置',
      click: function() {
        showConfigWindow();
      },
    },
    {
      label: '退出',
      click: async function() {
        await quitApp();
      },
    },
  ]);

  // tray.setToolTip('shadowsocks');
  tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
  try {
    createTray();
  } catch (err) {
    console.error(err);
  }
});

app.on('window-all-closed', () => {
  console.log('window all closed');
  // app.quit();
});

app.on('activate', () => {
  console.log('app active');
  // if (win === null) {
  //   createWindow();
  // }
});

function loadConfig() {
  let config = fs.readFileSync(path.join(process.cwd(), 'config.json'), {
    encoding: 'utf8',
  });
  return JSON.parse(config);
}

function updateMenu() {
  contextMenu.items[0].visible = !running;
  contextMenu.items[1].visible = running;
}

// 启动服务
function startup() {
  // 加载配置
  const config = loadConfig();

  relay = new TCPRelay(config, true);
  relay
    .bootstrap()
    .then(function() {
      logger.info('服务启动成功', config.localAddress + ':' + config.localPort);
      running = true;
      updateMenu();
    })
    .catch(function(error) {
      logger.error(error);
      running = false;
      updateMenu();
    });
}

// 停止服务
function shutdown() {
  relay &&
    relay.stop().then(function() {
      logger.info('服务已停止');
      running = false;
      relay = null;
      updateMenu();
      return Promise.resolve(true);
    });
  updateMenu();
  return Promise.resolve(true);
}

// 退出程序
async function quitApp() {
  running && (await shutdown());
  app.quit();
}

// 保存配置
ipcMain.on('save-config', function(event, config) {
  logger.info('save-config', config);
});
