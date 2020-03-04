import { ChildProcess, execSync, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { PubSubClient } from 'flok-core';
import * as os from 'os';
import * as path from 'path';

type Message = {
  body: string;
  userName: string;
};

type REPLContext = {
  command: string;
  target: string;
  session: string;
  hub: string;
  pubSubPath: string;
  extraOptions?: { [option: string]: any };
};

class REPL {
  command: string;
  target: string;
  session: string;
  hub: string;
  pubSubPath: string;
  extraOptions: { [option: string]: any };
  emitter: EventEmitter;
  repl: ChildProcess;
  pubSub: PubSubClient;

  _buffers: { stdout: string; stderr: string };
  _lastUserName: string;

  constructor(ctx: REPLContext) {
    const { command, target, session, hub, pubSubPath, extraOptions } = ctx;

    this.command = command;

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

  // eslint-disable-next-line class-methods-use-this
  start() {
    // Spawn process
    const parts = this.command.split(' ');

    const cmd = parts[0];
    const args = parts.slice(1);
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

    // Subscribe to pub sub
    const { target, session } = this;
    this.pubSub.subscribe(`session:${session}:target:${target}:in`, (message: Message) => {
      const { body, userName } = message;
      this.write(body);
      this._lastUserName = userName;
    });
  }

  write(body: string) {
    const newBody = this.prepare(body);
    this.repl.stdin.write(`${newBody}\n`);

    const lines = newBody.split('\n');
    this.emitter.emit('data', { type: 'stdin', lines });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return body.trim();
  }

  onData(callback) {
    this.onData = callback;
  }

  _connectToPubSubServer() {
    const wsUrl = `${this.hub}${this.pubSubPath}`;

    this.pubSub = new PubSubClient(wsUrl, {
      connect: true,
      reconnect: true,
    });
  }

  _handleData(data: any, type: string) {
    const { target, session } = this;
    const newBuffer = this._buffers[type].concat(data.toString());
    const lines = newBuffer.split('\n');

    this._buffers[type] = lines.pop();

    this.emitter.emit('data', { type, lines });

    if (lines.length > 0) {
      this.pubSub.publish(`session:${session}:target:${target}:out`, {
        target,
        type,
        body: lines,
      });
      if (this._lastUserName) {
        this.pubSub.publish(`user:${this._lastUserName}`, {
          target,
          type,
          body: lines,
        });
      }
    }
  }
}

class SuperColliderREPL extends REPL {
  constructor(ctx: REPLContext) {
    super({
      ...ctx,
      command: SuperColliderREPL.commandPath(),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return `${body.replace(/(\n)/gm, ' ').trim()}\n`;
  }

  static commandPath(): string {
    // FIXME: On Linux and Darwin, it should try to run `which`, and if it
    // fails, use default paths like these.
    switch (os.platform()) {
      case 'darwin':
        return '/Applications/SuperCollider.app/Contents/MacOS/sclang';
      case 'linux':
        // FIXME Fallback paths (/usr/local/bin/ -> /usr/bin)
        return '/usr/local/bin/sclang';
      default:
        throw Error('Unsupported platform');
    }
  }
}

class TidalREPL extends REPL {
  constructor(ctx: REPLContext) {
    super(ctx);

    this.command = `${this.commandPath('ghci')} -ghci-script ${this.bootScript()}`;
  }

  prepare(body: string): string {
    let newBody = super.prepare(body);
    newBody = `:{\n${newBody}\n:}`;
    return newBody;
  }

  bootScript(): string {
    const { bootScript } = this.extraOptions;
    return bootScript || this.defaultBootScript();
  }

  defaultBootScript(): string {
    return path.join(this.dataDir(), 'BootTidal.hs');
  }

  dataDir(): string {
    const ghcPkgCmd = this.commandPath('ghc-pkg');
    try {
      const dataDir = execSync(`${ghcPkgCmd} field tidal data-dir`)
        .toString()
        .trim();
      const firstLine = dataDir.split('\n')[0];
      return firstLine.substring(firstLine.indexOf(' ') + 1);
    } catch (err) {
      console.error(`Error get tidal data-dir: ${err}`);
      return '';
    }
  }

  commandPath(cmd: string): string {
    const { useStack } = this.extraOptions;
    return useStack ? `stack exec -- ${cmd}` : cmd;
  }
}

const replClasses = {
  default: REPL,
  tidal: TidalREPL,
  sclang: SuperColliderREPL,
};

function createREPLFor(repl: string, ctx: REPLContext) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

export { replClasses, createREPLFor, REPL, TidalREPL, SuperColliderREPL };
export default REPL;
