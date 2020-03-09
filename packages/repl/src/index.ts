import { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext, FoxDotREPL } from './repl';
import TidalREPL from './repl/tidal';
import SclangREPL, { RemoteSclangREPL } from './repl/sclang';

const replClasses = {
  default: CommandREPL,
  tidal: TidalREPL,
  sclang: SclangREPL,
  remote_sclang: RemoteSclangREPL,
  foxdot: FoxDotREPL, 
};

function createREPLFor(repl: string, ctx: CommandREPLContext) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

export { replClasses, createREPLFor, BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext };
