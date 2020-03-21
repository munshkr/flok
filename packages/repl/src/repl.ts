import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { PubSubClient } from 'flok-core';

type Message = {
  body: string;
  userName: string;
};

type BaseREPLContext = {
  target: string;
  session: string;
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
  hub: string;
  pubSubPath: string;
  extraOptions: { [option: string]: any };

  emitter: EventEmitter;
  pubSub: PubSubClient;

  _buffers: { stdout: string; stderr: string };
  _lastUserName: string;

  constructor(ctx: BaseREPLContext) {
    const { target, session, hub, pubSubPath, extraOptions } = ctx;

    this.target = target || 'default';
    this.session = session || 'default';
    this.hub = hub || 'ws://localhost:3000';
    this.pubSubPath = pubSubPath || '/pubsub';
    this.extraOptions = extraOptions || {};

    this.emitter = new EventEmitter();

    this._connectToPubSubServer();

    this._buffers = { stdout: '', stderr: '' };
    this._lastUserName = null;
  }

  start() {
    // Subscribe to pub sub
    const { target, session } = this;
    this.pubSub.subscribe(`session:${session}:target:${target}:in`, (message: Message) => {
      const { body, userName } = message;
      this.write(body);
      this._lastUserName = userName;
    });
  }

  abstract write(body: string);

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return body.trim();
  }

  _connectToPubSubServer() {
    const wsUrl = `${this.hub}${this.pubSubPath}`;

    this.pubSub = new PubSubClient(wsUrl, {
      connect: true,
      reconnect: true,
    });
  }
}

class CommandREPL extends BaseREPL {
  command: string;
  args: string[];
  repl: ChildProcess;

  constructor(ctx: CommandREPLContext) {
    const { target, session, hub, pubSubPath, extraOptions } = ctx;
    super({ target, session, hub, pubSubPath, extraOptions });

    const { command, args } = ctx;
    this.command = command;
    this.args = args;
  }

  start() {
    super.start();

    // Spawn process
    const cmd = this.command;
    const args = this.args;
    console.log(`Spawn '${cmd}' with args:`, args);
    this.repl = spawn(cmd, args, { shell: true });

    // Handle stdout and stderr
    this.repl.stdout.on('data', (data: any) => {
      this._handleData(data, 'stdout');
    });

    this.repl.stderr.on('data', (data: any) => {
      this._handleData(data, 'stderr');
    });

    this.repl.on('close', (code: number) => {
      this.emitter.emit('close', { code });
      console.log(`Child process exited with code ${code}`);
    });
  }

  write(body: string) {
    const newBody = this.prepare(body);
    this.repl.stdin.write(`${newBody}\n`);

    const lines = newBody.split('\n');
    this.emitter.emit('data', { type: 'stdin', lines });
  }

  _handleData(data: any, type: string) {
    const { target, session } = this;
    const clientId = this.pubSub._id;
    const newBuffer = this._buffers[type].concat(data.toString());
    const lines = newBuffer.split('\n');

    this._buffers[type] = lines.pop();

    this.emitter.emit('data', { type, lines });

    if (lines.length > 0) {
      this.pubSub.publish(`session:${session}:target:${target}:out`, {
        clientId,
        target,
        type,
        body: lines,
      });
      if (this._lastUserName) {
        this.pubSub.publish(`user:${this._lastUserName}`, {
          clientId,
          target,
          type,
          body: lines,
        });
      }
    }
  }
}

export { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext };
