import express from "express";
import compression from "compression";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let Vite;
try {
  Vite = await import("vite");
} catch (err) { }

const { NODE_ENV } = process.env;

const Config = {
  mode: ((NODE_ENV === "production" || !Vite) ? "production" : "development"),
  vitePort: 5173,
  viteServerSecure: false,
};

function getViteHost() {
  return `${Config.viteServerSecure ? "https" : "http"}://localhost:${Config.vitePort
    }`;
}

export function info(msg) {
  const timestamp = new Date().toLocaleString("en-US").split(",")[1].trim();
  console.log(
    `${pc.dim(timestamp)} ${pc.bold(pc.cyan("[flok-web]"))} ${pc.green(
      msg
    )}`
  );
}

function isStaticFilePath(path) {
  return path.match(/\.\w+$/);
}

async function serveStatic(app) {
  info(`Running in ${pc.yellow(Config.mode)} mode`);

  app.use(compression());

  if (Config.mode === "production") {
    const root = path.resolve(__dirname);
    const distPath = path.resolve(root, "dist");

    app.use(express.static(distPath));

    if (!fs.existsSync(distPath)) {
      info(`${pc.yellow(`Static files at ${pc.gray(distPath)} not found!`)}`);
      await build();
    }

    info(`${pc.green(`Serving static files from ${pc.gray(distPath)}`)}`);
  } else {
    app.use((req, res, next) => {
      if (isStaticFilePath(req.path)) {
        fetch(`${getViteHost()}${req.path}`).then((response) => {
          if (!response.ok) return next();
          res.redirect(response.url);
        });
      } else next();
    });
  }
}

async function startDevServer() {
  const server = await Vite.createServer({
    clearScreen: false,
    server: { port: Config.vitePort },
  });

  const vitePort = server.config.server.port;
  if (vitePort && vitePort !== Config.vitePort) Config.vitePort = vitePort;

  Config.viteServerSecure = Boolean(server.config.server.https);

  // info(`Vite is listening ${pc.gray(getViteHost())}`);

  return server;
}

async function serveHTML(app) {
  if (Config.mode === "production") {
    const root = path.resolve(__dirname);
    const distPath = path.resolve(root, "dist");

    app.use("*", (_, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    app.get("/*", async (req, res, next) => {
      if (isStaticFilePath(req.path)) return next();

      fetch(getViteHost())
        .then((res) => res.text())
        .then((content) =>
          content.replace(
            /(\/@react-refresh|\/@vite\/client)/g,
            `${getViteHost()}$1`
          )
        )
        .then((content) =>
          res.header("Content-Type", "text/html").send(content)
        );
    });
  }
}

function config(config) {
  if (config.mode) Config.mode = config.mode;
  if (config.vitePort) Config.vitePort = config.vitePort;
}

async function bind(
  app,
  server,
  callback
) {
  if (Config.mode === "development") {
    const devServer = await startDevServer();
    server.on("close", () => devServer?.close());
  }

  await serveStatic(app);
  await serveHTML(app);

  info(`Visit ${pc.bold(pc.green(getViteHost()))}`);

  callback?.();
}

function listen(app, port, callback) {
  const server = app.listen(port, () => bind(app, server, callback));
  return server;
}

async function build() {
  info("Build starting...");
  await Vite.build();
  info("Build completed!");
}

export async function createServer(
  callback
) {
  const app = express();

  await serveStatic(app);
  await serveHTML(app);

  let server;
  if (Vite && Config.mode === "development") {
    const devServer = await startDevServer();
    server = devServer.httpServer;
  } else {
    server = http.createServer(app);
  }

  info(`Visit ${pc.bold(pc.green(getViteHost()))}`);

  callback?.();

  return server;
}

export default { config, bind, listen, build, createServer };
