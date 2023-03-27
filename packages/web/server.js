import express from "express";
import ViteExpress from "vite-express";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { networkInterfaces } from "os";
import withFlokServer from "@flok/connect-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sslCertPath = path.resolve(__dirname, "..", "cert", "localhost.crt");
const sslKeyPath = path.resolve(__dirname, "..", "cert", "localhost.key");

export async function createServer(app, { secure }) {
  if (secure) {
    const key = fs.readFileSync(process.env.SSL_KEY || sslKeyPath, "utf8")
    const cert = fs.readFileSync(process.env.SSL_CERT || sslCertPath, "utf8")
    return https.createServer({ key, cert }, app);
  } else {
    return http.createServer(app)
  }
}

export async function startServer({ onReady, staticDir, ...opts }) {
  try {
    const app = withFlokServer(express());

    if (staticDir) {
      console.log(`> Serving static files at ${staticDir}`)
      app.use(express.static(staticDir))
    }

    const scheme = opts.secure ? "https" : "http";
    const server = await createServer(app, opts);

    ViteExpress.config({ vitePort: opts.port })
    ViteExpress.bind(app, server);

    server.listen(opts.port, onReady || (() => {
      const netResults = getPossibleIpAddresses();
      if (netResults.length > 1) {
        console.log("> If on LAN, try sharing with your friends one of these URLs:");
        Object.entries(netResults).map(([k, v]) => {
          console.log(`\t${k}: ${scheme}://${v}:${opts.port}`);
        });
      } else {
        console.log(
          `> If on LAN, try sharing with your friends ${scheme}://${Object.values(netResults)[0]}:${opts.port}`);
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
