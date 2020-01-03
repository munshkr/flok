#!/usr/bin/env node

const program = require("commander");
const packageInfo = require("../package.json");
const { Server } = require("../index");

program
  .version(packageInfo.version)
  .option("-H, --host [HOST]", "Server host", "localhost")
  .option("-P, --port [PORT]", "Server port", 3000)
  .option("--secure", "Use secure connection (wss://)", false)
  .option("-d, --dev", "Enable development mode", false)
  .option("--mongodb-uri URI", "Use MongoDB at URI as document database")
  .parse(process.argv);

const server = new Server({
  host: program.host,
  port: program.port,
  isSecure: program.secure,
  isDevelopment: program.dev,
  mongoDbUri: program.mongodb_uri
});

server.start();
