import { join } from 'path';
export const HOME_DIR = process.env.HOME;
export const WORKDIR = __dirname;
export const APP_NAME = 'ShadowWebsocks';
export const AUTO_CONFIG_URL = 'http://127.0.0.1:8989/proxy.pac';
export const CONFIG_PATH = join(HOME_DIR, `.${APP_NAME}/config.json`);