import {
  BaseREPL,
  BaseREPLContext,
  CommandREPL,
  CommandREPLContext,
} from "./repl.js";
import TidalREPL from "./repl/tidal.js";
import SclangREPL, { RemoteSclangREPL } from "./repl/sclang.js";
import FoxDotREPL from "./repl/foxdot.js";
import RenardoREPL from "./repl/renardo.js";
import MercuryREPL from "./repl/mercury.js";
import SardineREPL from "./repl/sardine.js";
import DummyREPL from "./repl/dummy.js";

import path from "path";
import fs from "fs";

const replClasses = {
  default: CommandREPL,
  tidal: TidalREPL,
  sclang: SclangREPL,
  remote_sclang: RemoteSclangREPL,
  foxdot: FoxDotREPL,
  renardo: RenardoREPL,
  mercury: MercuryREPL,
  sardine: SardineREPL,
  dummy: DummyREPL
};

function createREPLFor(repl: string, ctx: CommandREPLContext) {
  if (replClasses[repl]) {
    return new replClasses[repl](ctx);
  }

  const replClass = replClasses.default;
  return new replClass({ ...ctx, command: repl });
}

function readPackageMetadata() {
  const packageJsonPath = path.resolve(
    __dirname,
    path.join("..", "package.json")
  );
  const rawBody = fs.readFileSync(packageJsonPath);
  const body = JSON.parse(rawBody.toString());
  return body["flok"];
}

export {
  replClasses,
  createREPLFor,
  readPackageMetadata,
  BaseREPL,
  BaseREPLContext,
  CommandREPL,
  CommandREPLContext,
};
