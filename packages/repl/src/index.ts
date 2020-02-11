import { ChildProcess, execSync, spawn } from 'child_process';
import { sync as commandExistsSync } from 'command-exists';
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
  hub: string;
  pubSubPath: string;
};

class REPL {
  command: string;
  target: string;
  hub: string;
  pubSubPath: string;
  emitter: EventEmitter;
  _buffers: { stdout: string; stderr: string };
  _lastUserName: string;
  repl: ChildProcess;
  pubSub: PubSubClient;

  constructor(ctx: REPLContext) {
    const { command, target, hub, pubSubPath } = ctx;

    this.command = command;

    this.target = target || 'default';
    this.hub = hub || 'ws://localhost:3000';
    this.pubSubPath = pubSubPath || '/pubsub';

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
    console.log(`Spawn ${cmd} with args ${args}`);
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
      console.log(`child process exited with code ${code}`);
    });

    // Subscribe to pub sub
    this.pubSub.subscribe(`target:${this.target}:in`, (message: Message) => {
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
    console.log(wsUrl);

    this.pubSub = new PubSubClient(wsUrl, {
      connect: true,
      reconnect: true,
    });
  }

  _handleData(data: any, type: string) {
    const newBuffer = this._buffers[type].concat(data.toString());
    const lines = newBuffer.split('\n');

    this._buffers[type] = lines.pop();

    this.emitter.emit('data', { type, lines });

    if (lines.length > 0) {
      this.pubSub.publish(`target:${this.target}:out`, {
        target: this.target,
        type,
        body: lines,
      });
      if (this._lastUserName) {
        this.pubSub.publish(`user:${this._lastUserName}`, {
          target: this.target,
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
    super({
      ...ctx,
      command: `${TidalREPL.commandPath('ghci')} -ghci-script ${TidalREPL.defaultBootScript()}`,
    });
  }

  prepare(body: string): string {
    let newBody = super.prepare(body);
    newBody = `:{\n${newBody}\n:}`;
    return newBody;
  }

  static defaultBootScript(): string {
    return path.join(TidalREPL.dataDir(), 'BootTidal.hs');
  }

  static dataDir(): string {
    try {
      const dataDir = execSync(`${TidalREPL.commandPath('ghc-pkg')} field tidal data-dir`)
        .toString()
        .trim();

      return dataDir.substring(dataDir.indexOf(' ') + 1);
    } catch (err) {
      console.error(`Error get tidal data-dir: ${err}`);
      return '';
    }
  }

  static commandPath(cmd: string): string {
    if (commandExistsSync('stack')) {
      return `stack exec -- ${cmd}`;
    }
    return cmd;
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
