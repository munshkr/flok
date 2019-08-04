#!/usr/bin/env node
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

const { target } = program;

let lastUserName = null;

const publishMessage = (body, type) => {
  pubSub.publish(`${target}:out`, { target, type, body });

  if (lastUserName) {
    pubSub.publish(lastUserName, { target, type, body });
  }
};

// Spawn process
const repl = spawn(cmd, cmdArgs);

// Handle stdout and stderr
repl.stdout.on("data", data => {
  // process.stdout.write(data.toString());
  publishMessage(data.toString(), "stdout");
});

repl.stderr.on("data", data => {
  // process.stderr.write(data.toString());
  publishMessage(data.toString(), "stderr");
});

repl.on("close", code => {
  console.log(`child process exited with code ${code}`);
});

// Subscribe to pub sub
pubSub.subscribe(`${target}:in`, message => {
  const { body, userName } = message;
  const text = `${body.trim()}\n`;

  repl.stdin.write(text);
  // process.stdout.write(text);

  lastUserName = userName;
});
