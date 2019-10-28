"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.HOME_DIR = process.env.HOME;
exports.WORKDIR = __dirname;
exports.APP_NAME = 'ShadowWebsocks';
exports.AUTO_CONFIG_URL = 'http://127.0.0.1:8989/proxy.pac';
exports.CONFIG_PATH = path_1.join(exports.HOME_DIR, `.${exports.APP_NAME}/config.json`);
