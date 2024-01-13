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
  .option("-s, --secure", "Serve on https (use SSL)", false)
  .option("--ssl-cert [PATH]", "Path to SSL certificate file (optional)")
  .option("--ssl-key [PATH]", "Path to SSL key file (optional)")
  .option("--static-dir [PATH]", "Path to static files (optional)")
  .parse(process.argv);

const opts = program.opts();

if (!opts.sslKey) {
  opts.sslKey = path.resolve(__dirname, "../cert/key.pem");
}
if (!opts.sslCert) {
  opts.sslCert = path.resolve(__dirname, "../cert/cert.pem");
}

startServer({
  hostname: opts.host,
  port: opts.port,
  secure: opts.secure,
  sslCert: opts.sslCert,
  sslKey: opts.sslKey,
  staticDir: opts.staticDir
})
