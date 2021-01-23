import { BaseREPL, BaseREPLContext } from '../repl';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { UDPPort } from 'osc';

const DEFAULT_PORT = 4557;
const PORT_LOG_REGEX = new RegExp(/Listen port:\s+(\d+)/);

class SonicPiREPL extends BaseREPL {
  udpPort: UDPPort;
  started: boolean;
  portReady: boolean;
  port: number;

  constructor(ctx: BaseREPLContext) {
    super(ctx);

    this.started = false;
    this.portReady = false;
    this.port = this.findPortFromLogs()

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
    return path.join(os.homedir(), ".sonic-pi", "log", "server-output.log")
  }

  findPortFromLogs() {
    let lines: Array<string>;
    try {
      lines = fs.readFileSync(this.logPath, 'utf-8').split("\n");
    } catch {
      console.warn(`Failed to read SonicPi logs at ${this.logPath}.`)
      return DEFAULT_PORT;
    }

    let port;
    lines.forEach(line => {
      const match = line.match(PORT_LOG_REGEX);
      if (match) {
        port = parseInt(match[1]);
      }
    })

    if (!port) {
      console.warn(`Failed to find listening port on logs at ${this.logPath}`)
      port = DEFAULT_PORT;
    }

    return port;
  }
}

export default SonicPiREPL;
