const { spawn } = require("child_process");
const EventEmitter = require("events");
const PubSubClient = require("../../../lib/pubsub-client");

class REPL {
  constructor(ctx) {
    const { command, args, target, hub, pubSubPath } = ctx;

    this.command = command;
    this.args = args;

    this.target = target || "default";
    this.hub = hub || "ws://localhost:3000";
    this.pubSubPath = pubSubPath || "/pubsub";

    this.emitter = new EventEmitter();

    this._connectToPubSubServer();

    this._buffers = { stdout: "", stderr: "" };
    this._lastUserName = null;
  }

  start() {
    // Spawn process
    this.repl = spawn(this.command, this.args, { shell: true });

    // Handle stdout and stderr
    this.repl.stdout.on("data", data => {
      this._handleData(data, "stdout");
    });

    this.repl.stderr.on("data", data => {
      this._handleData(data, "stderr");
    });

    this.repl.on("close", code => {
      console.log(`child process exited with code ${code}`);
    });

    // Subscribe to pub sub
    this.pubSub.subscribe(`target:${this.target}:in`, message => {
      const { body, userName } = message;
      this.write(body);
      this._lastUserName = userName;
    });
  }

  write(body) {
    const newBody = this.prepare(body);
    this.repl.stdin.write(`${newBody}\n`);
    console.log("stdin", newBody);
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body) {
    return body.trim();
  }

  onData(callback) {
    this.onData = callback;
  }

  _connectToPubSubServer() {
    const wsUrl = `${this.hub}${this.pubSubPath}`;

    console.log(wsUrl);
    this.pubSub = new PubSubClient(wsUrl, {
      connect: true,
      reconnect: true
    });
  }

  _handleData(data, type) {
    console.log(type, data.toString());

    const newBuffer = this._buffers[type].concat(data.toString());
    const lines = newBuffer.split("\n");

    this._buffers[type] = lines.pop();

    this.emitter.emit("data", { type, lines });

    if (lines.length > 0) {
      this.pubSub.publish(`target:${this.target}:out`, {
        target: this.target,
        type,
        body: lines
      });
      if (this._lastUserName) {
        this.pubSub.publish(`user:${this._lastUserName}`, {
          target: this.target,
          type,
          body: lines
        });
      }
    }
  }
}

class TidalREPL extends REPL {
  constructor(ctx) {
    super({ ...ctx, command: "tidal" });
  }

  prepare(body) {
    let newBody = super.prepare(body);
    newBody = `:{ ${newBody} :}`;
    return newBody;
  }
}

const replClasses = {
  default: REPL,
  tidal: TidalREPL
};

export function createREPLFor(repl, ctx) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

export default REPL;
