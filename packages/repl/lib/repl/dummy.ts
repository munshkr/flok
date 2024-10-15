import { BaseREPL, BaseREPLContext } from "../repl.js";
import osc from "osc";
import debugModule from "debug";

const debug = debugModule("flok:repl:dummy");

const { UDPPort } = osc;

// A dummy/free/open REPL
// The repl doesn't have any specific language, it just forwards the
// text to an assigned OSC port 3001
// The address used is /flok

// $ flok-repl -t free
//
// Sends the code over OSC to port 3001 on localhost
// Port can be assigned by choice
//
class DummyREPL extends BaseREPL {
  udpPort: typeof UDPPort;
  port: number;
  started: boolean;
  portReady: boolean;

  constructor(ctx: BaseREPLContext) {
    super(ctx);

    this.port = 3001;
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
      debug("An OSC message just arrived!", oscMsg);
      debug("Remote info is: ", info);
    });

    // Open the socket.
    this.udpPort.open();

    // When the port is read, send an OSC message
    const that = this;
    this.udpPort.on("ready", function () {
      that.portReady = true;
    });

    this.started = true;
  }

  write(body: string) {
    if (!this.portReady) {
      debug("UDP Port is not ready yet.");
      return;
    }

    const newBody = this.prepare(body);
    const obj = {
      address: "/flok",
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

export default DummyREPL;