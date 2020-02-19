#!/usr/bin/env node

const program = require("commander");
const packageInfo = require("../package.json");
const { Server } = require("../index");

program
  .version(packageInfo.version)
  .option("-H, --host [HOST]", "Server host", "0.0.0.0")
  .option("-P, --port [PORT]", "Server port", 3000)
  .parse(process.argv);

const server = new Server({
  host: program.host,
  port: program.port
});

server.start();
