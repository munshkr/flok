import { BaseREPL, BaseREPLContext, CommandREPL, CommandREPLContext } from './repl';
import FoxDotREPL from './repl/foxdot';
import MercuryREPL from './repl/mercury';
import SclangREPL, { RemoteSclangREPL } from './repl/sclang';
import SonicPiREPL from './repl/sonicpi';
import TidalREPL from './repl/tidal';

const path = require("path");
const fs = require("fs");

const replClasses = {
  default: CommandREPL,
  foxdot: FoxDotREPL,
  mercury: MercuryREPL,
  remote_sclang: RemoteSclangREPL,
  sclang: SclangREPL,
  sonicpi: SonicPiREPL,
  tidal: TidalREPL,
};

function createREPLFor(repl: string, ctx: CommandREPLContext) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

function readPackageMetadata() {
  const packageJsonPath = path.resolve(__dirname, path.join('..', 'package.json'));
  const body = JSON.parse(fs.readFileSync(packageJsonPath));
  return body['flok'];
}

export {
  replClasses, createREPLFor, readPackageMetadata,
  BaseREPL, BaseREPLContext,
  CommandREPL, CommandREPLContext,
};
