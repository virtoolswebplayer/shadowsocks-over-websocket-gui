import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import {
  WORKDIR,
  APP_NAME,
  AUTO_CONFIG_URL,
  CONFIG_DIR,
  SETTING_PATH,
  PAC_NAME,
  PAC_PATH,
} from './const';

export const assetPath = (png: string) => path.join(WORKDIR, '../assets', png);

export const readJsonSync = (path: string) => {
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
};

export const loadConfig = () => {
  let setting = readJsonSync(SETTING_PATH);
  let configPath = CONFIG_DIR + '/' + setting.current;
  let config = readJsonSync(configPath);
  return config;
};

export function initConfig() {
  cp.execSync(`mkdir -p ${CONFIG_DIR}`);
  if (!fs.existsSync(SETTING_PATH)) {
    fs.writeFileSync(
      SETTING_PATH,
      `{
        "current": "config",
        "pacPort": 8989,
      }`,
    );
    fs.writeFileSync(
      path.join(CONFIG_DIR, 'config'),
      `{
        "localAddress": "127.0.0.1",
        "localPort": "1099",
        "method": "aes-256-cfb",
        "password": "password",
        "serverAddress": "youappname.herokuapp.com",
        "serverPort": "80"
      }`,
    );
  }

  if (!fs.existsSync(PAC_PATH)) {
    cp.execSync(`cp ${assetPath(PAC_NAME)} ${PAC_PATH}`);
  }
}

/**
 * 配置系统代理
 */
export function setupSystemProxy(state: 'on' | 'off') {
  // 配置系统自动代理
  if (state === 'off') {
    cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
  } else {
    cp.execSync(`networksetup -setautoproxyurl "WI-FI" ${AUTO_CONFIG_URL}`);
  }
}
