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
      console.error(`Failed to get tidal data-dir`);
      console.error("You will need to specify location of TidalCycles bootloading script.\n" +
        "Read more: https://github.com/munshkr/flok/wiki/Failed-to-get-tidal-data-dir");
      throw err;
    }
  }

  commandPath(cmd: string): string {
    const { useStack } = this.extraOptions;
    return useStack ? `stack exec -- ${cmd}` : cmd;
  }
}

export default TidalREPL;
