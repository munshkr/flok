import { CommandREPL, CommandREPLContext } from '../repl';

class FoxDotREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath();
    this.args = ['-i', '-c', '"from FoxDot import *\nload_startup_file()"'];
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return `execute\(\"${body
      .replace(/(\n)/gm, '\\n')
      .replace(/(\")/gm, '\\"')
      .trim()}\"\)\n`;
  }

  commandPath(): string {
    const { python } = this.extraOptions;
    return python || 'python';
  }
}

export default FoxDotREPL;
