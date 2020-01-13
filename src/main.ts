import { app, Menu, globalShortcut } from 'electron';
import { createTray } from './tray';
import { initConfig } from './utils';
// 初始化配置
initConfig();

// 任务栏中不显示
app.dock.hide();

app.on('ready', () => {
  // 设置系统菜单支持复制粘贴 CMD + C  CMD+V
  // setApplicationMenu();
  // 创建托盘
  createTray();
});

const nil = () => {};

// ::: tip
// window-all-closed 事件必须处理，
// 否则关闭配置窗口时程序会自动退出
// :::
app.on('window-all-closed', nil);
app.on('activate', nil);

function setApplicationMenu() {
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
}
