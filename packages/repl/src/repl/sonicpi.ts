import { BaseREPL, BaseREPLContext } from '../repl';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { UDPPort } from 'osc';

const DEFAULT_PORT = 4557;
const PORT_LOG_REGEX = new RegExp(/Opening UDP Server to listen to GUI on port:\s+(\d+)/);
const TOKEN_LOG_REGEX = new RegExp(/Token:\s+(.+)/)

class SonicPiREPL extends BaseREPL {
  udpPort: UDPPort;
  started: boolean;
  portReady: boolean;
  port: number;
  token: string;

  constructor(ctx: BaseREPLContext) {
    super(ctx);

    this.started = false;
    this.portReady = false;
    const { port, token } = this.findPortAndTokenFromLogs();
    this.port = port
    this.token = token;

    console.log("SonicPi OSC port:", this.port);
  }

  start() {
    super.start();

    this.udpPort = new UDPPort({
      metadata: true,
    });

    // Listen for incoming OSC messages.
    this.udpPort.on('message', function(oscMsg, _timeTag, info) {
      console.log('An OSC message just arrived!', oscMsg);
      console.log('Remote info is: ', info);
    });

    // Open the socket.
    this.udpPort.open();

    // When the port is read, send an OSC message to server
    const that = this;
    this.udpPort.on('ready', function() {
      that.portReady = true;
    });

    this.started = true;
  }

  write(body: string) {
    if (!this.portReady) {
      console.error('UDP Port is not ready yet.');
      return;
    }

    const newBody = this.prepare(body);
    const obj = {
      address: '/run-code',
      args: [
        {
          type: 'i',
          value: this.token,
        },
        {
          type: 's',
          value: newBody,
        },
      ],
    };
    this.udpPort.send(obj, '127.0.0.1', this.port);

    const lines = newBody.split('\n');
    this.emitter.emit('data', { type: 'stdin', lines });
  }

  get logPath(): string {
    return path.join(os.homedir(), ".sonic-pi", "log", "spider.log")
  }

  findPortAndTokenFromLogs(): {token: string, port: number} {
    let lines: Array<string>;
    lines = fs.readFileSync(this.logPath, 'utf-8').split("\n");

    let port;
    let token;
    lines.forEach((line, i) => {
      const portMatch = line.match(PORT_LOG_REGEX);
      const tokenMatch = line.match(TOKEN_LOG_REGEX);
      if (portMatch) {
        port = parseInt(portMatch[1]);
      }
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    })

    if (!port) {
      console.warn(`Failed to find listening port on logs at ${this.logPath}`)
      port = DEFAULT_PORT;
    }

    return { port, token };
  }
}

export default SonicPiREPL;
