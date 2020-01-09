"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const http = tslib_1.__importStar(require("http"));
const cp = tslib_1.__importStar(require("child_process"));
const log4js = tslib_1.__importStar(require("log4js"));
const electron_1 = require("electron");
const TCPRelay = require('shadowsocks-over-websocket').TCPRelay;
const const_1 = require("./const");
const pngResolve = png => path.join(const_1.WORKDIR, png);
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
electron_1.app.dock.hide();
let logger = log4js.getLogger('shadowwebsocks');
let running = false;
function initConfig() {
    cp.execSync('mkdir -p ~/.' + const_1.APP_NAME);
    if (!fs.existsSync(const_1.SETTING_PATH)) {
        fs.writeFileSync(const_1.SETTING_PATH, JSON.stringify({
            current: 'config.json',
            pacPort: 8989,
        }, null, 2));
    }
    if (!fs.existsSync(const_1.CONFIG_PATH)) {
        fs.writeFileSync(const_1.CONFIG_PATH, JSON.stringify({
            localAddress: '127.0.0.1',
            localPort: 1099,
            serverAddress: '服务器地址',
            serverPort: 80,
            password: '密码',
            method: 'aes-256-cfb',
        }, null, 2));
    }
}
// 初始化配置
initConfig();
// 创建配置窗口
function createConfigWindow() {
    let win = new electron_1.BrowserWindow({
        title: '客户端配置',
        width: 660,
        height: 400,
        resizable: true,
        maximizable: true,
        minimizable: false,
        movable: true,
        modal: true,
        fullscreen: false,
        fullscreenable: false,
        titleBarStyle: 'default',
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
        },
    });
    win.loadURL(`file://${__dirname}/assets/index.html`);
    win.on('closed', () => {
        configWin = null;
    });
    win.show();
    configWin = win;
}
function showConfigWindow() {
    !configWin && createConfigWindow();
    !configWin.isVisible() && configWin.show();
    configWin.focus();
}
// 创建托盘
function createTray() {
    tray = new electron_1.Tray(pngResolve('assets/icon/normal.png'));
    contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: '运行',
            click: function () {
                startup();
            },
        },
        {
            label: '停止',
            visible: false,
            click: function () {
                shutdown();
            },
        },
        {
            label: '配置',
            click: function () {
                showConfigWindow();
            },
        },
        {
            label: '退出',
            click: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield quitApp();
                });
            },
        },
    ]);
    // tray.setToolTip('shadowsocks');
    tray.setContextMenu(contextMenu);
}
electron_1.app.on('ready', () => {
    try {
        createTray();
    }
    catch (err) {
        console.error(err);
    }
});
electron_1.app.on('window-all-closed', () => {
    console.log('window all closed');
});
electron_1.app.on('activate', () => {
    console.log('app active');
});
function loadConfig() {
    let config = fs.readFileSync(const_1.CONFIG_PATH, {
        encoding: 'utf8',
    });
    return JSON.parse(config);
}
// 更新菜单， 运行与停止只显示一个
function updateMenu() {
    contextMenu.items[0].visible = !running;
    contextMenu.items[1].visible = running;
    tray.setImage(running
        ? pngResolve('assets/icon/running.png')
        : pngResolve('assets/icon/normal.png'));
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
        .then(function () {
        logger.info('服务已启动', config.localAddress + ':' + config.localPort);
        running = true;
        updateMenu();
        // 设置系统代理
        setupSystemProxy(const_1.AUTO_CONFIG_URL);
    })
        .catch(function (error) {
        logger.error(error);
        running = false;
        updateMenu();
    });
}
// 停止服务
function shutdown() {
    stopPacServer();
    relay &&
        relay.stop().then(function () {
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
function quitApp() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        running && (yield shutdown());
        electron_1.app.quit();
    });
}
// 保存配置
electron_1.ipcMain.on('save-config', function (event, filename, content) {
    let files = fs.readdirSync(const_1.CONFIG_DIR);
    console.log(files);
    fs.writeFileSync(path.join(const_1.CONFIG_DIR, `${filename}.json`), JSON.stringify(content, null, 2));
});
// 配置系统自动代理
function setupSystemProxy(pac) {
    if (!pac) {
        cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
    }
    else {
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
