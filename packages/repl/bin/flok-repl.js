#!/usr/bin/env node

const program = require("commander");
const packageInfo = require("../package.json");
const { REPL } = require("../lib/repl");

program
  .version(packageInfo.version)
  .option("-H, --hub [HUB]", "Hub address", "ws://localhost:3000")
  .option("-t, --target [NAME]", "Use the specified name as target", "default")
  .option("--path [PATH]", "Evaluation WebSockets server path", "/pubsub")
  .parse(process.argv);

const cmd = program.args[0];

if (!cmd) {
  console.error("Missing REPL command (e.g.: flok-repl -- sclang)");
  program.outputHelp();
  process.exit(1);
}

console.log(`Hub address: ${program.hub}`);
console.log(`Target: ${program.target}`);
console.log(`Spawn: ${JSON.stringify(program.args)}`);

const replClient = new REPL({
  command: program.args.join(" "),
  target: program.target,
  hub: program.hub,
  pubSubPath: program.path
});
replClient.start();

replClient.emitter.on("data", data => {
  const line = data.lines.join("\n> ");
  if (line) {
    if (data.type === "stderr") {
      process.stderr.write(`> ${line}\n`);
    } else if (data.type === "stdout") {
      process.stdout.write(`> ${line}\n`);
    } else if (data.type === "stdin") {
      process.stdout.write(`< ${line}\n`);
    } else {
      process.stdout.write(`[data] ${JSON.stringify(data)}\n`);
    }
  }
});

replClient.emitter.on("close", ({ code }) => {
  process.exit(code);
});
