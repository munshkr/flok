import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import { PubSubClient } from "@flok-editor/pubsub";
import debugModule from "debug";

const debug = debugModule("flok:repl");

type Message = {
  body: string;
  userName: string;
};

type BaseREPLContext = {
  target: string;
  session: string;
  tags: string[];
  hub: string;
  pubSubPath: string;
  extraOptions?: { [option: string]: any };
};

type CommandREPLContext = BaseREPLContext & {
  command: string;
  args: string[];
};

abstract class BaseREPL {
  target: string;
  session: string;
  tags: string[];
  hub: string;
  pubSubPath: string;
  extraOptions: { [option: string]: any };

  emitter: EventEmitter;
  pubSub: PubSubClient;

  _buffers: { stdout: string; stderr: string };

  constructor(ctx: BaseREPLContext) {
    const { target, session, tags, hub, pubSubPath, extraOptions } = ctx;

    this.target = target || "default";
    this.session = session || "default";
    this.tags = tags || [];
    this.hub = hub || "ws://localhost:3000";
    this.pubSubPath = pubSubPath || "/pubsub";
    this.extraOptions = extraOptions || {};

    this.emitter = new EventEmitter();

    this._connectToPubSubServer();

    this._buffers = { stdout: "", stderr: "" };
  }

  start() {
    // Subscribe to pub sub
    const { target, session } = this;
    this.pubSub.subscribe(
      `session:${session}:target:${target}:in`,
      ({ message }: { message: Message }) => {
        const { body } = message;
        this.write(body);
      },
    );
  }

  abstract write(body: string);

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return body.trim();
  }

  _connectToPubSubServer() {
    this.pubSub = new PubSubClient({ url: `${this.hub}${this.pubSubPath}` });
    this.pubSub.start();
    this.pubSub.on("error", (err) => {
      debug("error", err);
    });
    this.pubSub.on("open", () => {
      debug("open");
    });
  }
}

class CommandREPL extends BaseREPL {
  command: string;
  args: string[];
  repl: ChildProcess;

  constructor(ctx: CommandREPLContext) {
    const { target, session, tags, hub, pubSubPath, extraOptions } = ctx;
    super({
      target,
      session,
      tags,
      hub,
      pubSubPath,
      extraOptions,
    });

    const { command, args } = ctx;
    this.command = command;
    this.args = args;
  }

  start() {
    super.start();

    // Spawn process
    const cmd = this.command;
    const args = this.args;
    debug(`Spawn '${cmd}' with args:`, args);
    this.repl = spawn(cmd, args, { shell: true });

    // Handle stdout and stderr
    this.repl.stdout.on("data", (data: any) => {
      this._handleData(data, "stdout");
    });

    this.repl.stderr.on("data", (data: any) => {
      this._handleData(data, "stderr");
    });

    this.repl.on("close", (code: number) => {
      this.emitter.emit("close", { code });
      debug(`Child process exited with code ${code}`);
    });
  }

  write(body: string) {
    const newBody = this.prepare(body);
    this.repl.stdin.write(`${newBody}\n\n`);

    const lines = newBody.split("\n");
    this.emitter.emit("data", { type: "stdin", lines });
  }

  handleData(type: string, lines: string[]): string[] {
    return lines;
  }

  _handleData(data: any, type: string) {
    const { target, session, tags } = this;
    const newBuffer = this._buffers[type].concat(data.toString());
    const rawLines = newBuffer.split("\n");

    const basePath = `session:${session}:target:${target}`;

    this._buffers[type] = rawLines.pop();

    const lines = this.handleData(type, rawLines);

    this.emitter.emit("data", { type, lines });

    const mustPublish = lines.length > 0;

    if (mustPublish) {
      this.pubSub.publish(`${basePath}:out`, {
        target,
        type,
        body: lines,
        tags,
      });
    }
  }
}

export { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext };
