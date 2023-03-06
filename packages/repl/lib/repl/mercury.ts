import { BaseREPL, BaseREPLContext } from "../repl.js";
// import * as os from 'os';
import { UDPPort } from "osc";

// The Mercury REPL
// $ flok-repl -t mercury
//
// Sends the code over OSC to port 4880 on localhost
// Start the mercury_ide.maxproj in Max8
// Turn on the audio if you want to code sound only
// Turn on the visuals if you want to code visuals as well
//
// When executing code it should automatically receive and parse
// Mercury only runs full pages of code (previous code is deleted)
// So always execute full page instead of per-line
//
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
    this.udpPort.on("message", function (oscMsg, timeTag, info) {
      console.log("An OSC message just arrived!", oscMsg);
      console.log("Remote info is: ", info);
    });

    // Open the socket.
    this.udpPort.open();

    // When the port is read, send an OSC message to, say, SuperCollider
    const that = this;
    this.udpPort.on("ready", function () {
      that.portReady = true;
    });

    this.started = true;
  }

  write(body: string) {
    if (!this.portReady) {
      console.error("UDP Port is not ready yet.");
      return;
    }

    const newBody = this.prepare(body);
    const obj = {
      address: "/mercury-code",
      args: [
        {
          type: "s",
          value: newBody,
        },
      ],
    };
    this.udpPort.send(obj, "127.0.0.1", this.port);

    const lines = newBody.split("\n");
    this.emitter.emit("data", { type: "stdin", lines });
  }
}

export default MercuryREPL;
