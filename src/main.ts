import { app, Menu } from 'electron';
import { createTray } from './tray';
import { initConfig } from './utils';

// 初始化配置
initConfig();

// 任务栏中不显示
app.dock.hide();

app.on('ready', () => {
  // Check if we are on a MAC
  if (process.platform === 'darwin') {
    // :::tip 添加编辑菜单
    // 若不设置，复制粘贴键盘操作无响应
    // :::
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' },
          ],
        },
      ]),
    );
  }

  // 创建托盘
  createTray();
});

app.on('window-all-closed', () => {
  console.log('window all closed');
});

app.on('activate', () => {
  console.log('app active');
});
