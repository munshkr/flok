import { execSync } from 'child_process';
import * as path from 'path';
import { CommandREPL, CommandREPLContext } from '../repl';

class TidalREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath('ghci');
    this.args = ['-ghci-script', this.bootScript()];
  }

  prepare(body: string): string {
    let newBody = super.prepare(body);
    newBody = `:{\n${newBody}\n:}`;
    return newBody;
  }

  handleData(type: string, lines: string[]): string[] {
    return type == 'stdout' ? lines.map(line => line.replace(/(tidal> )+/i, '')) : lines;
  }

  bootScript(): string {
    const { bootScript } = this.extraOptions;
    return bootScript || this.defaultBootScript();
  }

  defaultBootScript(): string {
    return path.join(this.dataDir(), 'BootTidal.hs');
  }

  dataDir(): string {
    const ghciCmd = this.commandPath('ghci');
    try {
      const dataDir = execSync(`${ghciCmd} -e Paths_tidal.getDataDir`)
        .toString()
        .trim()
        .replace(/"/g, '');
      console.log("Data dir:", dataDir);
      return dataDir;
    } catch (err) {
      console.warn(`Failed to get tidal data dir`);
      console.warn(
        `You will need to specify the location of your TidalCycles bootloading script.\n` +
          `Read more: https://github.com/munshkr/flok/wiki/Failed-to-get-tidal-data-dir`,
      );
      throw err;
    }
  }

  commandPath(cmd: string): string {
    const { ghci, useStack } = this.extraOptions;
    if (ghci) return ghci;
    return useStack ? `stack exec -- ${cmd}` : cmd;
  }
}

export default TidalREPL;
