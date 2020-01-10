import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import {
  WORKDIR,
  APP_NAME,
  AUTO_CONFIG_URL,
  CONFIG_DIR,
  SETTING_PATH,
} from './const';

export const getAsset = (png: string) => path.join(WORKDIR, '../assets', png);

export const readJsonSync = (path: string) => {
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
};

export const loadConfig = () => {
  let setting = readJsonSync(SETTING_PATH);
  let configPath = CONFIG_DIR + '/' + setting.current;
  let config = readJsonSync(configPath);
  return config;
};

/**
 * 配置系统代理
 * @param pac
 */
export function setupSystemProxy(state: 'on' | 'off') {
  // 配置系统自动代理
  if (state === 'off') {
    cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
  } else {
    cp.execSync(`networksetup -setautoproxyurl "WI-FI" ${AUTO_CONFIG_URL}`);
  }
}
