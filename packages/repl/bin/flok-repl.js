#!/usr/bin/env node

const program = require('commander');
const packageInfo = require('../package.json');
const { REPL, replClasses } = require('../lib/repl');

const knownTypes = Object.keys(replClasses).filter(repl => repl !== 'default');

program
  .version(packageInfo.version)
  .option('-t, --type <type>', 'Type of REPL', 'command')
  .option('-H, --hub <url>', 'Hub address', 'ws://localhost:3000')
  .option('-n, --target-name <name>', 'Use the specified target name')
  .option('--path <path>', 'Evaluation WebSockets server path', '/pubsub')
  .option('--list-types', 'List all known types of REPLs')
  .parse(process.argv);

const { args, type, hub, targetName, path, listTypes } = program;
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

console.log(`Hub address: ${hub}`);
console.log(`Target name: ${target}`);
console.log(`Spawn: ${JSON.stringify(args)}`);

let replClient;
if (useDefaultREPL) {
  replClient = new REPL({
    command: args.join(' '),
    target,
    hub,
    pubSubPath: path,
  });
} else {
  const replClass = replClasses[type];
  replClient = new replClass({
    target,
    hub: hub,
    pubSubPath: path,
  });
}

replClient.start();

replClient.emitter.on('data', data => {
  const line = data.lines.join('\n> ');
  if (line) {
    if (data.type === 'stderr') {
      process.stderr.write(`> ${line}\n`);
    } else if (data.type === 'stdout') {
      process.stdout.write(`> ${line}\n`);
    } else if (data.type === 'stdin') {
      process.stdout.write(`< ${line}\n`);
    } else {
      process.stdout.write(`[data] ${JSON.stringify(data)}\n`);
    }
  }
});

replClient.emitter.on('close', ({ code }) => {
  process.exit(code);
});
