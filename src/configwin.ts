import { BrowserWindow } from 'electron';
import { assetPath } from './utils';

let configWin: BrowserWindow = null;

// 创建配置窗口
function createConfigWindow() {
  configWin = new BrowserWindow({
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
    frame: false,
    darkTheme: true,
    // titleBarStyle: 'hidden',
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
    },
  });
  configWin.on('close', () => {
    configWin = null;
  });
  configWin.loadURL(`file://${assetPath('index.html')}`);
  configWin.show();
  configWin.focus();
  configWin.setAlwaysOnTop(true, 'modal-panel');
}

export function showConfigWindow() {
  if (configWin) {
    configWin.close();
  }
  createConfigWindow();
}
