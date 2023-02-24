import { CommandREPL, CommandREPLContext } from '../repl';

class SardineREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath();
    this.args = [];
  }

  commandPath(): string {
    const { python } = this.extraOptions;
    return python || 'fishery';
  }
}

export default SardineREPL;
