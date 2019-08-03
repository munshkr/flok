#!/usr/bin/env node
// TODO
const program = require("commander");
const { spawn } = require("child_process");
const PubSubClient = require("./lib/pubsub-client");

program
  .version("0.1.0")
  .option("-t, --target [NAME]", "Use the specified name as target")
  .option("-H, --host [HOST]", "Evaluation WebSockets server host", "localhost")
  .option("-P, --port [PORT]", "Evaluation WebSockets server port", 3001)
  .parse(process.argv);

console.log(`Target: ${program.target}`);
console.log(`PubSub server: ws://${program.host}:${program.port}`);
console.log(`Spawn: ${JSON.stringify(program.args)}`);

const cmd = program.args[0];
const cmdArgs = program.args.slice(1);

const pubSub = new PubSubClient("ws://localhost:3001", {
  connect: true,
  reconnect: true
});

const topicName = program.target;

const repl = spawn(cmd, cmdArgs);

repl.stdout.on("data", data => {
  process.stdout.write(data.toString());
  // Publish to another topic stdout
});

repl.stderr.on("data", data => {
  process.stderr.write(data.toString());
  // Publish to another topic stderr
});

repl.on("close", code => {
  console.log(`child process exited with code ${code}`);
});

pubSub.subscribe(topicName, message => {
  const text = `${message.body.trim()}\n`;
  repl.stdin.write(text);
  process.stdout.write(text);
});
