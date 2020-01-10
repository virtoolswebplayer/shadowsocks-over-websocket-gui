import * as fs from 'fs';
import * as cp from 'child_process';
import { app } from 'electron';
import { createTray } from './tray';
import { APP_NAME, CONFIG_DIR, SETTING_PATH } from './const';

// function initConfig() {
//   cp.execSync('mkdir -p ~/.' + APP_NAME);
//   if (!fs.existsSync(SETTING_PATH)) {
//     fs.writeFileSync(
//       SETTING_PATH,
//       `{
//         "current": "config.json",
//         "pacPort": 8989,
//       }`,
//     );
//   }
// }

// function loadConfig() {
//   let setting = JSON.parse(fs.readFileSync(SETTING_PATH, { encoding: 'utf8' }));
//   let config = fs.readFileSync(CONFIG_DIR + '/' + setting.current, {
//     encoding: 'utf8',
//   });
//   return JSON.parse(config);
// }

// 初始化配置
// initConfig();

// 任务栏中不显示
app.dock.hide();

app.on('ready', () => {
  try {
    createTray();
  } catch (err) {
    console.error(err);
  }
});

app.on('window-all-closed', () => {
  console.log('window all closed');
});

app.on('activate', () => {
  console.log('app active');
});
