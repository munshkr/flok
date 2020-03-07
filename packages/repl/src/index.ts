import REPL, { REPLContext } from './repl';
import TidalREPL from './repl/tidal';
import SuperColliderREPL from './repl/sclang';

const replClasses = {
  default: REPL,
  tidal: TidalREPL,
  sclang: SuperColliderREPL,
};

function createREPLFor(repl: string, ctx: REPLContext) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

export { replClasses, createREPLFor, REPL, REPLContext };
export default REPL;
