#!/usr/bin/env node

const program = require('commander');
const packageInfo = require('../package.json');
const { CommandREPL, replClasses } = require('../lib/index');

const knownTypes = Object.keys(replClasses).filter(repl => repl !== 'default');

program
  .version(packageInfo.version)
  .option('-t, --type <type>', 'Type of REPL', 'command')
  .option('-H, --hub <url>', 'Hub address', 'ws://localhost:3000')
  .option('-s, --session-name <name>', 'Session name', 'default')
  .option('-n, --target-name <name>', 'Use the specified target name')
  .option('--path <path>', 'Evaluation WebSockets server path', '/pubsub')
  .option('--extra <options>', 'Extra options in JSON')
  .option('--list-types', 'List all known types of REPLs')
  .parse(process.argv);

const { args, type, hub, sessionName, targetName, path, listTypes, extra } = program;
const cmd = program.args[0];

if (listTypes) {
  console.log('Known types:', knownTypes);
  process.exit(0);
}

const useDefaultREPL = type === 'command';

if (useDefaultREPL && !cmd) {
  console.error('Missing REPL command (e.g.: flok-repl -- cat)');
  program.outputHelp();
  process.exit(1);
}

// TODO Check if type is one of knownTypes
if (!useDefaultREPL && !knownTypes.includes(type)) {
  console.error(`Unknown type ${type}. Must be one of:`, knownTypes);
  process.exit(1);
}

const target = targetName || (useDefaultREPL ? 'default' : type);

let extraOptions = {};
if (extra) {
  try {
    extraOptions = JSON.parse(extra);
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
console.log(`Extra options:`, extraOptions);

let replClient;
if (useDefaultREPL) {
  replClient = new CommandREPL({
    command: args[0],
    args: args.slice(1),
    target,
    session: sessionName,
    hub,
    pubSubPath: path,
    extraOptions,
  });
} else {
  const replClass = replClasses[type];
  replClient = new replClass({
    target,
    session: sessionName,
    hub,
    pubSubPath: path,
    extraOptions,
  });
}

replClient.start();

replClient.emitter.on('data', data => {
  const shortClientId = replClient.pubSub._id.slice(0, 7);
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
