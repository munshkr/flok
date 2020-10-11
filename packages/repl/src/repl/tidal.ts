import { execSync } from 'child_process';
import * as path from 'path';
import { CommandREPL, CommandREPLContext } from '../repl';
import { readPackageMetadata } from "../index";

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
      console.warn(`Failed to get tidal data-dir`);

      const metadata = readPackageMetadata();
      const tidalMetadata = metadata['tidal'];
      if (tidalMetadata) {
        const { bootScript, version } = tidalMetadata
        console.warn(
          `Going to fallback to embedded BootTidal.hs, for TidalCycles ${version}`);
        console.warn(
          `If you have a different TidalCycles version installed, you may want to ` +
          `specify the location of your TidalCycles bootloading script.\n` +
          `Read more: https://github.com/munshkr/flok/wiki/Failed-to-get-tidal-data-dir`);
        return path.resolve(__dirname, path.join('..', '..', bootScript));
      } else {
        console.warn(
          `You will need to specify the location of your TidalCycles bootloading script.\n` +
          `Read more: https://github.com/munshkr/flok/wiki/Failed-to-get-tidal-data-dir`);
        throw err;
      }
    }
  }

  commandPath(cmd: string): string {
    const { ghci, useStack } = this.extraOptions;
    if (ghci) return ghci;
    return useStack ? `stack exec -- ${cmd}` : cmd;
  }
}

export default TidalREPL;
