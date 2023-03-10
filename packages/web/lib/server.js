import http from "http";
import { parse } from "url";
import next from "next";
import connect from "connect";
import withFlokServer from "@flok/server";
import { networkInterfaces } from "os";

export async function createServer({ hostname, port, dev, secure, staticDir }) {
  // when using middleware `hostname` and `port` must be provided below
  const nextApp = next({ dev, hostname, port });
  const handle = nextApp.getRequestHandler();

  console.log("> Preparing app...");
  await nextApp.prepare()

  const app = withFlokServer(connect());

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

  return http.createServer(app)
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
