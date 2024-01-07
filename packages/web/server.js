import withFlokServer from "@flok-editor/server-middleware";
import express from "express";
import fs from "fs";
import http from "http";
import https from "https";
import { networkInterfaces } from "os";
import pc from "picocolors";
import process from "process";
import ViteExpress from "vite-express";

function info(msg) {
  const timestamp = new Date().toLocaleString("en-US").split(",")[1].trim();
  console.log(
    `${pc.dim(timestamp)} ${pc.bold(pc.cyan("[flok-web]"))} ${pc.green(
      msg,
    )}`,
  );
}

export async function startServer({ onReady, staticDir, ...opts }) {
  try {
    const app = express();

    if (staticDir) {
      info(`Serving extra static files at ${pc.gray(staticDir)}`)
      app.use(express.static(staticDir))
    }

    let viteServer;
    if (opts.secure) {
      info(`Using SSL certificate at ${pc.gray(opts.sslCert)} (key at ${pc.gray(opts.sslKey)})`)
      const key = fs.readFileSync(opts.sslKey);
      const cert = fs.readFileSync(opts.sslCert);
      viteServer = https.createServer({ key, cert }, app);
    } else {
      viteServer = http.createServer(app);
    }

    ViteExpress.config({ vitePort: opts.port });
    ViteExpress.bind(app, viteServer);

    const server = withFlokServer(viteServer);

    server.listen(opts.port, onReady || (() => {
      const netResults = getPossibleIpAddresses();
      const schema = opts.secure ? "https" : "http";
      info(`Listening on ${schema}://localhost:${opts.port}`);
      if (netResults.length > 1) {
        info("If on LAN, try sharing with your friends one of these URLs:");
        Object.entries(netResults).map(([k, v]) => {
          info(`\t${k}: ${schema}://${v}:${opts.port}`);
        });
      } else {
        info(
          `If on LAN, try sharing with your friends ${schema}://${Object.values(netResults)[0]}:${opts.port}`);
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
