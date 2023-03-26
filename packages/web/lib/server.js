import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import serveStatic from "serve-static";
import { parse } from "url";
import next from "next";
import connect from "connect";
import withFlokServer from "@flok/connect-server";
import { fileURLToPath } from "url";
import { networkInterfaces } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sslCertPath = path.resolve(__dirname, "..", "cert", "localhost.crt");
const sslKeyPath = path.resolve(__dirname, "..", "cert", "localhost.key");

export async function createServer({ hostname, port, dev, secure, staticDir }) {
  // when using middleware `hostname` and `port` must be provided below
  const nextApp = next({ dev, hostname, port });
  const handle = nextApp.getRequestHandler();

  console.log("> Preparing app...");
  await nextApp.prepare()

  const app = withFlokServer(connect());

  if (staticDir) {
    console.log(`> Serving static files at ${staticDir}`)
    app.use(serveStatic(staticDir))
  }

  app.use(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  if (secure) {
    const key = fs.readFileSync(process.env.SSL_KEY || sslKeyPath, "utf8")
    const cert = fs.readFileSync(process.env.SSL_CERT || sslCertPath, "utf8")
    return https.createServer({ key, cert }, app);
  } else {
    return http.createServer(app)
  }
}

export async function startServer({ onReady, ...opts }) {
  try {
    const scheme = opts.secure ? "https" : "http";
    const server = await createServer(opts);

    server.listen(opts.port, onReady || (() => {
      console.log(`> Visit ${scheme}://${opts.hostname || "localhost"}:${opts.port}`);

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
