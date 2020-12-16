#!/usr/bin/env node

require('dotenv').config();

const process = require('process');
const fs = require('fs');
const program = require('commander');
const packageInfo = require('../package.json');
const { CommandREPL, replClasses } = require('../lib/index');

const readConfig = path => {
  const raw = fs.readFileSync(path);
  return JSON.parse(raw);
};

const knownTypes = Object.keys(replClasses).filter(repl => repl !== 'default');

program
  .version(packageInfo.version)
  .option('-t, --type <type>', 'Type of REPL', 'command')
  .option('-H, --hub <url>', 'Hub address', 'ws://localhost:3000')
  .option('-s, --session-name <name>', 'Session name', 'default')
  .option('-n, --target-name <name>', 'Use the specified target name')
  .option('-N, --nickname <nickname>', 'Send output/error messages to named user')
  .option('--notify-to-all', 'Notify output/error messages to all connected users')
  .option('--path <path>', 'Evaluation WebSockets server path', '/pubsub')
  .option('--list-types', 'List all known types of REPLs')
  .option('--config <configfile>', 'JSON configuration file')
  .option('--extra <options>', 'Extra options in JSON')
  .parse(process.argv);

// Try to read config file (if --config was provided, or FLOK_CONFIG env var is defined)
const configPath = program.config || process.env.FLOK_CONFIG;
const config = configPath ? readConfig(configPath) : {};

// Override config with command line options
const options = ['type', 'hub', 'sessionName', 'targetName', 'path', 'nickname', 'notifyToAll'];
for (let i = 0; i < options.length; i++) {
  const opt = options[i];
  config[opt] = config[opt] || program[opt];
}

const { type, hub, sessionName, targetName, path, nickname, notifyToAll } = config;

// Prepare command and arguments
const cmd = program.args[0];
const args = program.args.slice(1);

// If asked to list type, print and exit
if (program.listTypes) {
  console.log('Known types:', knownTypes);
  process.exit(0);
}

const useDefaultREPL = type === 'command';

// If using default REPL and no command was specified, throw error
if (useDefaultREPL && !cmd) {
  console.error('Missing REPL command (e.g.: flok-repl -- cat)');
  program.outputHelp();
  process.exit(1);
}

// Check if type is one of knownTypes
if (!useDefaultREPL && !knownTypes.includes(type)) {
  console.error(`Unknown type ${type}. Must be one of:`, knownTypes);
  process.exit(1);
}

// Set target based on name or type
const target = targetName || (useDefaultREPL ? 'default' : type);

// Extra options
const { extra } = program;
let extraOptions = config.extra || {};
if (extra) {
  try {
    extraOptions = Object.assign(extraOptions, JSON.parse(extra));
  } catch {
    console.error('Invalid extra options JSON object:', extra);
    process.exit(1);
  }
}

// Start...
console.log(`Hub address: ${hub}`);
console.log(`Session name: ${sessionName}`);
console.log(`Target name: ${target}`);
console.log(`Type: ${type}`);
if (notifyToAll) {
  console.log(`Notify messages to all users`);
}
if (nickname) {
  console.log(`Notify messages to user named "${nickname}"`);
}
console.log(`Extra options:`, extraOptions);

let replClient;
if (useDefaultREPL) {
  replClient = new CommandREPL({
    command: cmd,
    args: args,
    target,
    session: sessionName,
    hub,
    pubSubPath: path,
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
    pubSubPath: path,
    nickname,
    notifyToAll,
    extraOptions,
  });
}

replClient.start();

replClient.emitter.on('data', data => {
  const shortClientId = replClient.pubSub._id ? replClient.pubSub._id.slice(0, 7) : 'unknown';
  const line = data.lines.join('\n> ');
  if (line) {
    if (data.type === 'stderr') {
      process.stderr.write(`[${shortClientId} err] ${line}\n`);
    } else if (data.type === 'stdout') {
      process.stdout.write(`[${shortClientId} out] ${line}\n`);
    } else if (data.type === 'stdin') {
      process.stdout.write(`[${shortClientId} in ] ${line}\n`);
    } else {
      process.stdout.write(`[${shortClientId} ???] ${JSON.stringify(data)}\n`);
    }
  }
});

replClient.emitter.on('close', ({ code }) => {
  process.exit(code);
});
