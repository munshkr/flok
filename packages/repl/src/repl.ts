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
  nickname: string;
  notifyToAll: boolean;
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
  nickname: string;
  notifyToAll: boolean;
  extraOptions: { [option: string]: any };

  emitter: EventEmitter;
  pubSub: PubSubClient;

  _buffers: { stdout: string; stderr: string };

  constructor(ctx: BaseREPLContext) {
    const { target, session, hub, pubSubPath, nickname, notifyToAll, extraOptions } = ctx;

    this.target = target || 'default';
    this.session = session || 'default';
    this.hub = hub || 'ws://localhost:3000';
    this.pubSubPath = pubSubPath || '/pubsub';
    this.nickname = nickname;
    this.notifyToAll = notifyToAll;
    this.extraOptions = extraOptions || {};

    this.emitter = new EventEmitter();

    this._connectToPubSubServer();

    this._buffers = { stdout: '', stderr: '' };
  }

  start() {
    // Subscribe to pub sub
    const { target, session } = this;
    this.pubSub.subscribe(`session:${session}:target:${target}:in`, (message: Message) => {
      const { body = '' } = message;
      this.write(body);
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
    const { target, session, hub, pubSubPath, nickname, notifyToAll, extraOptions } = ctx;
    super({ target, session, hub, pubSubPath, nickname, notifyToAll, extraOptions });

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
    this.repl.stdin.write(`${newBody}\n\n`);

    const lines = newBody.split('\n');
    this.emitter.emit('data', { type: 'stdin', lines });
  }

  handleData(type: string, lines: string[]): string[] {
    return lines;
  }

  _handleData(data: any, type: string) {
    const { target, session, nickname, notifyToAll } = this;
    const clientId = this.pubSub._id;
    const newBuffer = this._buffers[type].concat(data.toString());
    const rawLines = newBuffer.split('\n');

    const basePath = `session:${session}:target:${target}`;

    this._buffers[type] = rawLines.pop();

    const lines = this.handleData(type, rawLines);

    this.emitter.emit('data', { type, lines });

    const mustPublish = lines.length > 0 && (notifyToAll || nickname);

    if (mustPublish) {
      const path = notifyToAll ? `${basePath}:out` : `${basePath}:user:${nickname}:out`;
      this.pubSub.publish(path, {
        clientId,
        target,
        type,
        body: lines,
      });
    }
  }
}

export { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext };
