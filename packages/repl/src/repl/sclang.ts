import { REPL, REPLContext } from '../repl';
import * as os from 'os';

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
        throw 'Unsupported platform';
    }
  }
}

export default SuperColliderREPL;
