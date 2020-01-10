import { BrowserWindow } from 'electron';
import { getAsset } from './utils';

let configWin;

// 创建配置窗口
function createConfigWindow() {
  let win = new BrowserWindow({
    title: '客户端配置',
    width: 660,
    height: 400,
    resizable: false,
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

  win.loadURL(`file://${getAsset('index.html')}`);
  win.on('closed', () => {
    configWin = null;
  });

  win.show();
  configWin = win;
}

export function showConfigWindow() {
  !configWin && createConfigWindow();
  !configWin.isVisible() && configWin.show();
  configWin.focus();
}
