import { app, Tray, Menu, App } from 'electron';
import { proxy } from './proxyServer';
import * as cp from 'child_process';
import { getAsset, loadConfig } from './utils';
import { showConfigWindow } from './configwin';
import { CONFIG_DIR, PAC_PATH, AUTO_CONFIG_URL } from './const';
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
      submenu: Menu.buildFromTemplate([
        {
          label: '修改配置',
          click: function() {
            showConfigWindow();
          },
        },
        {
          label: '查看 proxy.pac',
          click: function() {
            cp.execSync('open ' + AUTO_CONFIG_URL);
          },
        },
        {
          label: '打开配置目录',
          click: function() {
            cp.execSync('open ' + CONFIG_DIR);
          },
        },
      ]),
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
