#!/usr/bin/env node

import dotenv from "dotenv";
import process from "process";
import path from "path";
import fs from "fs";
import { Command } from "commander";
import { CommandREPL, replClasses } from "../dist/index.js";
import { fileURLToPath } from "url";
import debugModule from "debug";

const debug = debugModule("flok:repl");

dotenv.config();

const readConfig = (path) => {
  const raw = fs.readFileSync(path);
  return JSON.parse(raw.toString());
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageInfo = readConfig(path.resolve(__dirname, "../package.json"));
const knownTypes = Object.keys(replClasses).filter(
  (repl) => repl !== "default"
);
const program = new Command();

program.version(packageInfo.version);
program
  .option("-t, --type <type>", "Type of REPL", "command")
  .option("-H, --hub <url>", "Hub address", "ws://localhost:3000")
  .option("-s, --session-name <name>", "Session name", "default")
  .option("-n, --target-name <name>", "Use the specified target name")
  .option(
    "-N, --nickname <nickname>",
    "Send output/error messages to named user"
  )
  .option(
    "--notify-to-all",
    "Notify output/error messages to all connected users"
  )
  .option("--path <path>", "Evaluation WebSockets server path", "/pubsub")
  .option("--list-types", "List all known types of REPLs")
  .option("--config <configfile>", "JSON configuration file")
  .option("--extra <options>", "Extra options in JSON")
  .parse(process.argv);

const opts = program.opts();

// Try to read config file (if --config was provided, or FLOK_CONFIG env var is defined)
const configPath = opts.config || process.env.FLOK_CONFIG;
const config = configPath ? readConfig(configPath) : {};

// Override config with command line options
const options = [
  "type",
  "hub",
  "sessionName",
  "targetName",
  "path",
  "nickname",
  "notifyToAll",
];
for (let i = 0; i < options.length; i++) {
  const opt = options[i];
  config[opt] = config[opt] || opts[opt];
}

const {
  type,
  hub,
  sessionName,
  targetName,
  path: pubSubPath,
  nickname,
  notifyToAll,
} = config;

// Prepare command and arguments
const cmd = program.args[0];
const args = program.args.slice(1);

// If asked to list type, print and exit
if (opts.listTypes) {
  console.log("Known types:", knownTypes);
  process.exit(0);
}

const useDefaultREPL = type === "command";

// If using default REPL and no command was specified, throw error
if (useDefaultREPL && !cmd) {
  console.error("Missing REPL command (e.g.: flok-repl -- cat)");
  program.outputHelp();
  process.exit(1);
}

// Check if type is one of knownTypes
if (!useDefaultREPL && !knownTypes.includes(type)) {
  console.error(`Unknown type ${type}. Must be one of:`, knownTypes);
  process.exit(1);
}

// Set target based on name or type
const target = targetName || (useDefaultREPL ? "default" : type);

// Extra options
const { extra } = opts;
let extraOptions = config.extra || {};
if (extra) {
  try {
    extraOptions = Object.assign(extraOptions, JSON.parse(extra));
  } catch {
    console.error("Invalid extra options JSON object:", extra);
    process.exit(1);
  }
}

// Start...
debug(`Hub address: ${hub}`);
debug(`Session name: ${sessionName}`);
debug(`Target name: ${target}`);
debug(`Type: ${type}`);
if (notifyToAll) {
  debug(`Notify messages to all users`);
}
if (nickname) {
  debug(`Notify messages to user named "${nickname}"`);
}
debug(`Extra options:`, extraOptions);

let replClient;
if (useDefaultREPL) {
  replClient = new CommandREPL({
    command: cmd,
    args: args,
    target,
    session: sessionName,
    hub,
    pubSubPath,
    nickname,
    notifyToAll,
    extraOptions,
  });
} else {
  const replClass = replClasses[type];
  replClient = new replClass({
    target,
    session: sessionName,
    hub,
    pubSubPath,
    nickname,
    notifyToAll,
    extraOptions,
  });
}

replClient.start();

replClient.emitter.on("data", (data) => {
  const line = data.lines.join("\n");
  if (line) {
    if (data.type === "stdin") {
      console.log(`< ${line}`);
    } else if (data.type === "stdout") {
      console.log(`> ${line}`);
    } else if (data.type === "stderr") {
      console.error(`> ${line}`);
    }
  }
});

replClient.emitter.on("close", ({ code }) => {
  process.exit(code);
});
