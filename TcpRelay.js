"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const net = tslib_1.__importStar(require("net"));
const log4js = tslib_1.__importStar(require("log4js"));
const logger = log4js.getLogger('TcpRelay');
const MAX_CONNECTIONS = 50000;
class TcpRelay {
    constructor() { }
    initServer() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        });
    }
    handelLocalConnection() { }
}
class Sock5Proxy {
}
