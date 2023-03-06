import {
  BaseREPL,
  CommandREPL,
  BaseREPLContext,
  CommandREPLContext,
} from "../repl.js";
import * as os from "os";
import { UDPPort } from "osc";

class SclangREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath();
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    const fixedBody = body
      .replace(/(\n\s*\)\s*\n)/gm, "\n);\n")
      .replace(/(\n)/gm, " ")
      .trim();
    return `${fixedBody}\n`;
  }

  commandPath(): string {
    const { sclang } = this.extraOptions;
    return sclang || SclangREPL.defaultCommandPath();
  }

  static defaultCommandPath(): string {
    switch (os.platform()) {
      case "darwin":
        return "/Applications/SuperCollider.app/Contents/MacOS/sclang";
      case "linux":
        return "sclang";
      default:
        throw "Unsupported platform";
    }
  }
}

class RemoteSclangREPL extends BaseREPL {
  udpPort: UDPPort;
  port: number;
  started: boolean;
  portReady: boolean;

  constructor(ctx: BaseREPLContext) {
    super(ctx);

    this.port = 57200;
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

export { SclangREPL, RemoteSclangREPL };
export default SclangREPL;
