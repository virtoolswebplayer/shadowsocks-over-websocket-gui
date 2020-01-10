import { app, Tray, Menu, App } from 'electron';
import { proxy } from './proxyServer';
import { getAsset, loadConfig } from './utils';
import { showConfigWindow } from './configwin';
let tray = null;
let contextMenu = null;

export function createTray() {
  tray = new Tray(getAsset('icon/normal.png'));

  contextMenu = Menu.buildFromTemplate([
    {
      label: '运行',
      click: function() {
        const config = loadConfig();
        proxy.setConfig(config);
        proxy.startup();
      },
    },
    {
      label: '停止',
      visible: false,
      click: function() {
        proxy.shutdown();
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
        await proxy.shutdown();
        tray = null;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  proxy.on('startup', updateMenu);
  proxy.on('shutdown', updateMenu);
}

// 更新托盘菜单及图标
function updateMenu() {
  contextMenu.items[0].visible = !proxy.running;
  contextMenu.items[1].visible = proxy.running;
  tray.setImage(
    proxy.running ? getAsset('icon/running.png') : getAsset('icon/normal.png'),
  );
}
