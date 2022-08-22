import { CommandREPL, CommandREPLContext } from '../repl';

class TidalREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    const { bootScript } = this.extraOptions;

    this.command = this.commandPath('tidal');
    this.args = bootScript ? ['-ghci-script', bootScript] : [];
  }

  prepare(body: string): string {
    let newBody = super.prepare(body);
    newBody = `:{\n${newBody}\n:}`;
    return newBody;
  }

  handleData(type: string, lines: string[]): string[] {
    return type == 'stdout' ? lines.map(line => line.replace(/(tidal> )+/i, '')) : lines;
  }

  commandPath(cmd: string): string {
    const { ghci, useStack } = this.extraOptions;
    if (ghci) return ghci;
    return useStack ? `stack exec -- ${cmd}` : cmd;
  }
}

export default TidalREPL;
