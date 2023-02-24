import { CommandREPL, CommandREPLContext } from '../repl';

class SardineREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath();
    this.args = [];
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
    return python || 'fishery';
  }
}

export default SardineREPL;
