import { CommandREPL, CommandREPLContext } from "../repl.js";

class RenardoREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = this.commandPath();
    this.args = ["-i", "-c", '"from renardo_lib import *"'];
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: string): string {
    return `execute\(\"${body
      .replace(/(\n)/gm, "\\n")
      .replace(/(\")/gm, '\\"')
      .trim()}\"\)\n`;
  }

  commandPath(): string {
    const { python } = this.extraOptions;
    return python || "python";
  }
}

export default RenardoREPL;
