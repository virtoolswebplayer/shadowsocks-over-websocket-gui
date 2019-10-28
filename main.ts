import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as cp from 'child_process';
import * as log4js from 'log4js';
import { app, ipcMain, BrowserWindow, Tray, Menu } from 'electron';
const TCPRelay = require('shadowsocks-over-websocket').TCPRelay;

import {
  HOME_DIR,
  WORKDIR,
  APP_NAME,
  AUTO_CONFIG_URL,
  CONFIG_PATH,
} from './const';

const pngResolve = png => path.join(WORKDIR, png);

// 配置容口
let configWin = null;
// 托盘
let tray = null;
// 菜单
let contextMenu;
// 中继器
let relay = null;
// pac server
let pacServer = null;
// pac path

// 任务栏中不显示
app.dock.hide();

let logger = log4js.getLogger('shadowwebsocks');
let running = false;

function initConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    cp.execSync('mkdir -p ~/.' + APP_NAME);
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify(
        {
          localAddress: '127.0.0.1',
          localPort: 1099,
          serverAddress: '服务器地址',
          serverPort: 80,
          password: '密码',
          method: 'aes-256-cfb',
        },
        null,
        2,
      ),
    );
  }
}

// 初始化配置
initConfig();

// 创建配置窗口
function createConfigWindow() {
  let win = new BrowserWindow({
    title: '客户端配置',
    width: 360,
    height: 440,
    resizable: true,
    maximizable: false,
    minimizable: false,
    movable: true,
    fullscreen: false,
    fullscreenable: false,
    titleBarStyle: 'default',
    webPreferences: {
      devTools: true,
    },
  });

  win.loadURL(`file://${__dirname}/assets/index.html`);
  win.on('closed', () => {
    configWin = null;
  });

  win.show();
  configWin = win;
}

const showConfigWindow = () => {
  !configWin && createConfigWindow();
  !configWin.isVisible() && configWin.show();
  configWin.focus();
};

// 创建托盘
function createTray() {
  tray = new Tray(pngResolve('normal.png'));
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
  let config = fs.readFileSync(CONFIG_PATH, {
    encoding: 'utf8',
  });
  return JSON.parse(config);
}

// 更新菜单， 运行与停止只显示一个
function updateMenu() {
  contextMenu.items[0].visible = !running;
  contextMenu.items[1].visible = running;
  tray.setImage(running ? pngResolve('running.png') : pngResolve('normal.png'));
}

// 启动服务
function startup() {
  // 加载配置
  const config = loadConfig();

  // 启动pacServer
  !pacServer && startupPacServer();

  // 创建中继器实例
  relay = new TCPRelay(config, true);
  relay
    .setLogLevel('info')
    .bootstrap()
    .then(function() {
      logger.info('服务已启动', config.localAddress + ':' + config.localPort);
      running = true;
      updateMenu();
      // 设置系统代理
      setupSystemProxy(AUTO_CONFIG_URL);
    })
    .catch(function(error) {
      logger.error(error);
      running = false;
      updateMenu();
    });
}

// 停止服务
function shutdown() {
  stopPacServer();

  relay &&
    relay.stop().then(function() {
      logger.info('服务已停止');
      running = false;
      relay = null;
      updateMenu();
      // 关闭系统代理
      setupSystemProxy(false);
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
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
});

// 配置系统自动代理
function setupSystemProxy(pac) {
  if (!pac) {
    cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
  } else {
    cp.execSync(`networksetup -setautoproxyurl "WI-FI" ${pac}`);
  }
}

function startupPacServer() {
  pacServer = http
    .createServer((req, res) => {
      let pac = fs.readFileSync(path.join(__dirname, 'proxy.pac'), {
        encoding: 'utf8',
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(pac);
    })
    .listen(8989);
}

function stopPacServer() {
  pacServer && pacServer.close() && (pacServer = null);
}
