import * as net from 'net';
import * as fs from 'fs';
import * as nodePath from 'path';
import * as log4js from 'log4js';

const logger = log4js.getLogger('TcpRelay');

const MAX_CONNECTIONS = 50000;

interface IConfig {
  localAddress: string;
  localPort: number;
  serverAddress: string;
  serverPort: number;
  method: string;
  password: string;
}

class TcpRelay {
  isLocal: boolean;
  isServer: boolean;
  config: IConfig;
  server: net.Server;

  constructor() {}

  async initServer() {
    const { config, isLocal } = this;
    const { localAddress, localPort, serverAddress, serverPort } = config;

    let address = isLocal ? localAddress : serverAddress;
    let port = isLocal ? localPort : serverPort;

    let server = (this.server = net.createServer({ allowHalfOpen: true }));

    server.maxConnections = MAX_CONNECTIONS;

    server.on('connection', () => {
      this.handelLocalConnection();
    });
    server.on('close', () => {
      logger.info('本地sock5服务器已关闭');
    });

    // 开始侦听
    server.listen(port, address);
  }

  handelLocalConnection() {}
}

class Sock5Proxy {}
