import { BaseREPL, BaseREPLContext } from '../repl';
// import * as os from 'os';
import { UDPPort } from 'osc';

class MercuryREPL extends BaseREPL {
  udpPort: UDPPort;
  port: number;
  started: boolean;
  portReady: boolean;

  constructor(ctx: BaseREPLContext) {
    super(ctx);

    this.port = 4880;
    this.started = false;
    this.portReady = false;
  }

  start() {
    super.start();

    this.udpPort = new UDPPort({
      metadata: true,
    });

    // Listen for incoming OSC messages.
    this.udpPort.on('message', function(oscMsg, timeTag, info) {
      console.log('An OSC message just arrived!', oscMsg);
      console.log('Remote info is: ', info);
    });

    // Open the socket.
    this.udpPort.open();

    // When the port is read, send an OSC message to, say, SuperCollider
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
      address: '/mercury-code',
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
}

export default MercuryREPL;