#!/usr/bin/env node

const program = require("commander");
const packageInfo = require("../package.json");
const Server = require("../lib/Server");
const { networkInterfaces } = require("os");

const getPossibleIpAddresses = () => {
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  return results;
};

program
  .version(packageInfo.version)
  .option("-H, --host [HOST]", "Server host", "0.0.0.0")
  .option("-P, --port [PORT]", "Server port", 3000)
  .option("-s, --secure", "Serve on https (use SSL)", false)
  .option("--static-dir [PATH]", "Path to static files (optional)")
  .parse(process.argv);

const server = new Server({
  host: program.host,
  port: program.port,
  secure: program.secure,
  staticDir: program.staticDir,
});

server.start(() => {
  const netResults = getPossibleIpAddresses();
  if (netResults.length > 1) {
    console.log("> Possible URLs to access from:");
    Object.entries(netResults).map(([k, v]) => {
      console.log(`\t${k}: ${server.scheme}://${v}:${server.port}`);
    });
  } else {
    console.log(
      `> Visit ${server.scheme}://${Object.values(netResults)[0]}:${
        server.port
      }`
    );
  }
});
