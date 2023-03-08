import { Command } from "commander";
import { readPackageFile, getPossibleIpAddresses } from "./utils.js";
import Server from "./server.js";

const program = new Command();
const packageInfo = readPackageFile();

program
  .version(packageInfo.version)
  .option("-H, --host [HOST]", "Server host", "0.0.0.0")
  .option("-P, --port [PORT]", "Server port", "3001")
  .option("-s, --secure", "Serve on https (use SSL)", false)
  .parse(process.argv);

const opts = program.opts();

const server = new Server({
  host: opts.host,
  port: opts.port,
  secure: opts.secure,
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
      `> Connect your web session and REPL to ${server.scheme}://${
        Object.values(netResults)[0]
      }:${server.port}`
    );
  }
});
