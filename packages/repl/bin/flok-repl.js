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
const knownTypes = ["command", ...Object.keys(replClasses).filter(
  (repl) => repl !== "default"
)];
const program = new Command();

program.version(packageInfo.version);
program
  .option("-t, --types <types...>", "Type/s of REPL", ["command"])
  .option("-H, --hub <url>", "Server (or \"hub\") address", "ws://localhost:3000")
  .option("-s, --session-name <name>", "Session name", "default")
  .option("-n, --target-name <name>", "Use the specified target name")
  .option("-T, --tags <tags...>", "Tags for REPL messages")
  .option("--config <configfile>", "JSON configuration file")
  .option("--extra <options>", "Extra options in JSON")
  .option("--list-types", "List all known types of REPLs")
  .option("--path <path>", "Evaluation WebSockets server path", "/pubsub")
  .parse(process.argv);

const opts = program.opts();

// Try to read config file (if --config was provided, or FLOK_CONFIG env var is defined)
const configPath = opts.config || process.env.FLOK_CONFIG;
const config = configPath ? readConfig(configPath) : {};

// Override config with command line options
const options = [
  "types",
  "hub",
  "sessionName",
  "targetName",
  "tags",
  "path",
];
options.forEach(opt => {
  config[opt] = config[opt] || opts[opt];
});

const {
  hub,
  sessionName,
  targetName,
  tags,
  path: pubSubPath,
} = config;

// Remove duplicates
const types = [...new Set(config.types)];

// Prepare command and arguments
const cmd = program.args[0];
const args = program.args.slice(1);

// If asked to list types, print and exit
if (opts.listTypes) {
  console.log("Known types:", knownTypes);
  process.exit(0);
}

const useDefaultREPL = types.some(type => type === "command");

// If using default REPL and no command was specified, throw error
if (useDefaultREPL && !cmd) {
  console.error("You specified a 'command' type, but forgot to specify a REPL command (e.g.: flok-repl -- cat)");
  program.outputHelp();
  process.exit(1);
}

// Check if all types are known
if (!useDefaultREPL) {
  const unknownTypes = [...new Set(types.filter(type => !knownTypes.includes(type)))];
  if (unknownTypes.length > 0) {
    console.error(`Unknown types: ${unknownTypes.join(', ')}. Must be one of:`, knownTypes);
    process.exit(1);
  }
}

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
console.log("Hub address:", hub);
console.log("Session name:", sessionName);
if (targetName) console.log("Target name:", targetName);
console.log("Types:", types);
if (Object.keys(extraOptions).length > 0) console.log("Extra options:", extraOptions);

types.forEach(type => {
  const useDefaultREPL = type === "command";

  // Set target based on name or type
  const target = targetName || (useDefaultREPL ? cmd : type);

  let replClient;
  if (useDefaultREPL) {
    replClient = new CommandREPL({
      command: cmd,
      args: args,
      target,
      session: sessionName,
      tags,
      hub,
      pubSubPath,
      extraOptions,
    });
  } else {
    const replClass = replClasses[type];
    replClient = new replClass({
      target,
      session: sessionName,
      tags,
      hub,
      pubSubPath,
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
})
