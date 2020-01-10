import * as http from 'http';
import * as fs from 'fs';
import { getAsset, setupSystemProxy } from './utils';

export class PacServer {
  private server = null;
  startup() {
    this.server = http
      .createServer((req, res) => {
        let pac = fs.readFileSync(getAsset('proxy.pac'), {
          encoding: 'utf8',
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(pac);
      })
      .listen(8989);

    setupSystemProxy('on');
  }
  shutdown() {
    this.server && this.server.close() && (this.server = null);
    setupSystemProxy('off');
  }
}
