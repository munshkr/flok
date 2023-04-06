#!/usr/bin/env node

import process from "process";
import path from "path";
import fs from "fs";
import { Command } from "commander";
import { fileURLToPath } from "url";
import { startServer } from "../server.js";

const readConfig = (path) => {
  const raw = fs.readFileSync(path);
  return JSON.parse(raw.toString());
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageInfo = readConfig(path.resolve(__dirname, "../package.json"));
const program = new Command();

program.version(packageInfo.version);
program
  .option("-H, --host [HOST]", "Server host", "0.0.0.0")
  .option("-P, --port [PORT]", "Server port", 3000)
  .option("--static-dir [PATH]", "Path to static files (optional)")
  .parse(process.argv);

const opts = program.opts();

startServer({
  hostname: opts.host,
  port: opts.port,
  secure: opts.secure,
  staticDir: opts.staticDir
})
