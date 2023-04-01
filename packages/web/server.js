import express from "express";
import http from "http";
import process from "process";
import { networkInterfaces } from "os";
import pc from "picocolors";
import withFlokServer from "@flok/server-middleware";
import ViteExpress, { info } from "./vite-express.js";

export async function startServer({ onReady, staticDir, ...opts }) {
  try {
    const app = express();
    const server = withFlokServer(http.createServer(app))

    ViteExpress.config({ vitePort: opts.port })
    ViteExpress.bind(app, server);

    if (staticDir) {
      info(`Serving extra static files at ${pc.gray(staticDir)}`)
      app.use(express.static(staticDir))
    }

    server.listen(opts.port, onReady || (() => {
      const netResults = getPossibleIpAddresses();
      if (netResults.length > 1) {
        info("If on LAN, try sharing with your friends one of these URLs:");
        Object.entries(netResults).map(([k, v]) => {
          info(`\t${k}: http://${v}:${opts.port}`);
        });
      } else {
        info(
          `If on LAN, try sharing with your friends http://${Object.values(netResults)[0]}:${opts.port}`);
      }
    }))
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

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
