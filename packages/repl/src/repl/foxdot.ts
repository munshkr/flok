import { CommandREPL, CommandREPLContext } from '../repl';
import * as os from 'os';

class FoxDotREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super({
      ...ctx,
      command: FoxDotREPL.commandPath(),
      args: ['-i', '-c', '"from FoxDot import *"']
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return `${body.replace(/(\n)/gm, ' ').trim()}\n`;
  }

  static commandPath(): string {
    // FIXME: On Linux and Darwin, it should try to run `which`, and if it
    // fails, use default paths like these.
    return 'python3';
  }
}

export default FoxDotREPL
