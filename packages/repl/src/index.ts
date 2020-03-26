import { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext } from './repl';
import TidalREPL from './repl/tidal';
import SclangREPL, { SclangOscREPL } from './repl/sclang';
import FoxDotREPL from './repl/foxdot';

const replClasses = {
  default: CommandREPL,
  tidal: TidalREPL,
  sclang: SclangREPL,
  sclang_osc: SclangOscREPL,
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
