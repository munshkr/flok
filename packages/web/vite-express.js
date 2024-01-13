import express from "express";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let Vite;
try {
  Vite = await import("vite");
} catch (err) { }


const _State = {
  viteConfig: undefined
};

function clearState() {
  _State.viteConfig = undefined;
}

const Config = {
  mode: (process.env.NODE_ENV === "production" || !Vite
    ? "production"
    : "development"),
  inlineViteConfig: undefined,
  viteConfigFile: undefined,
  ignorePaths: undefined,
  transformer: undefined,
};

function info(msg) {
  const timestamp = new Date().toLocaleString("en-US").split(",")[1].trim();
  console.log(
    `${pc.dim(timestamp)} ${pc.bold(pc.cyan("[flok-web]"))} ${pc.green(msg)}`
  );
}

function isStaticFilePath(path) {
  return path.match(/(\.\w+$)|@vite|@id|@react-refresh/);
}

async function getTransformedHTML(html, req) {
  return Config.transformer ? Config.transformer(html, req) : html;
}

function getDefaultViteConfig() {
  return {
    root: process.cwd(),
    base: "/",
    build: { outDir: "dist" },
  };
}

function getViteConfigPath() {
  if (Config.viteConfigFile && fs.existsSync(Config.viteConfigFile))
    return Config.viteConfigFile;
  else if (fs.existsSync("vite.config.js")) return "vite.config.js";
  else if (fs.existsSync("vite.config.ts")) return "vite.config.ts";
  throw new Error("Unable to locate Vite config");
}

async function resolveConfig() {
  if (Config.inlineViteConfig) {
    info(
      `${pc.yellow("Inline config")} detected, ignoring ${pc.yellow(
        "Vite config file"
      )}`
    );

    return {
      ...getDefaultViteConfig(),
      ...Config.inlineViteConfig,
    };
  }

  try {
    const { resolveConfig } = await import("vite");
    try {
      const config = await resolveConfig(
        {
          configFile: Config.viteConfigFile,
        },
        "build"
      );
      info(
        `Using ${pc.yellow("Vite")} to resolve the ${pc.yellow("config file")}`
      );
      return config;
    } catch (e) {
      console.error(e);
      info(
        pc.red(
          `Unable to use ${pc.yellow("Vite")}, running in ${pc.yellow(
            "viteless"
          )} mode`
        )
      );
    }
  } catch (e) {
    1;
  }

  try {
    const config = fs.readFileSync(getViteConfigPath(), "utf8");

    const root = config.match(/"?root"?\s*:\s*"([^"]+)"/)?.[1];
    const base = config.match(/"?base"?\s*:\s*"([^"]+)"/)?.[1];
    const outDir = config.match(/"?outDir"?\s*:\s*"([^"]+)"/)?.[1];

    const defaultConfig = getDefaultViteConfig();

    return {
      root: root ?? defaultConfig.root,
      base: base ?? defaultConfig.base,
      build: { outDir: outDir ?? defaultConfig.build.outDir },
    };
  } catch (e) {
    info(
      pc.red(
        `Unable to locate ${pc.yellow(
          "vite.config.*s file"
        )}, using default options`
      )
    );

    return getDefaultViteConfig();
  }
}

async function getViteConfig() {
  if (!_State.viteConfig) {
    _State.viteConfig = await resolveConfig();
  }

  return _State.viteConfig;
}

async function getDistPath() {
  const config = await getViteConfig();
  return path.resolve(config.root, config.build.outDir);
}

async function serveStatic() {
  const distPath = await getDistPath();

  if (!fs.existsSync(distPath)) {
    info(`${pc.red(`Static files at ${pc.gray(distPath)} not found!`)}`);
    info(
      `${pc.yellow(
        `Did you forget to run ${pc.bold(pc.green("vite build"))} command?`
      )}`
    );
  } else {
    info(`${pc.green(`Serving static files from ${pc.gray(distPath)}`)}`);
  }

  return express.static(distPath, { index: false });
}

const stubMiddleware = (req, res, next) => next();

async function injectStaticMiddleware(app, middleware) {
  const config = await getViteConfig();
  app.use(config.base, middleware);

  const stubMiddlewareLayer = app._router.stack.find(
    (layer) => layer.handle === stubMiddleware
  );

  if (stubMiddlewareLayer !== undefined) {
    const serveStaticLayer = app._router.stack.pop();
    app._router.stack = app._router.stack.map((layer) => {
      return layer === stubMiddlewareLayer ? serveStaticLayer : layer;
    });
  }
}

function isIgnoredPath(path, req) {
  if (Config.ignorePaths === undefined) return false;

  return Config.ignorePaths instanceof RegExp
    ? path.match(Config.ignorePaths)
    : Config.ignorePaths(path, req);
}

function findClosestIndexToRoot(
  reqPath,
  root
) {
  const basePath = reqPath.slice(0, reqPath.lastIndexOf("/"));
  const dirs = basePath.split("/");

  while (dirs.length > 0) {
    const pathToTest = path.join(root, ...dirs, "index.html");
    if (fs.existsSync(pathToTest)) {
      return pathToTest;
    }
    dirs.pop();
  }
  return undefined;
}

async function injectViteIndexMiddleware(app, server) {
  const config = await getViteConfig();

  app.use(config.base, async (req, res, next) => {
    if (req.method !== "GET") return next();

    if (isIgnoredPath(req.path, req)) return next();

    if (isStaticFilePath(req.path)) next();
    else {
      const indexPath = findClosestIndexToRoot(req.path, config.root);
      if (indexPath === undefined) return next();

      const template = fs.readFileSync(indexPath, "utf8");
      let html = await server.transformIndexHtml(req.originalUrl, template);

      try {
        html = await getTransformedHTML(html, req);
        res.send(html);
      } catch (e) {
        console.error(e);
        res.status(500);
        return next();
      }
    }
  });
}

async function injectIndexMiddleware(app) {
  const distPath = await getDistPath();
  const config = await getViteConfig();

  app.use(config.base, async (req, res, next) => {
    if (isIgnoredPath(req.path, req)) return next();

    const indexPath = findClosestIndexToRoot(req.path, distPath);
    if (indexPath === undefined) return next();

    let html = fs.readFileSync(indexPath, "utf8");

    try {
      html = await getTransformedHTML(html, req);
      res.send(html);
    } catch (e) {
      console.error(e);
      res.status(500);
      return next();
    }
  });
}

async function startServer(server) {
  const { createServer, mergeConfig } = await import("vite");

  const config = await getViteConfig();
  const isUsingViteResolvedConfig = Object.entries(config).length > 3;

  const vite = await createServer(
    mergeConfig(isUsingViteResolvedConfig ? {} : config, {
      configFile: Config.viteConfigFile,
      clearScreen: false,
      appType: "custom",
      server: {
        middlewareMode: true,
        hmr: { server },
      },
    })
  );

  server.on("close", async () => {
    await vite.close();
    server.emit("vite:close");
  });

  return vite;
}

function config(config) {
  if (config.mode !== undefined) Config.mode = config.mode;
  Config.ignorePaths = config.ignorePaths;
  Config.inlineViteConfig = config.inlineViteConfig;
  Config.transformer = config.transformer;
  Config.viteConfigFile = config.viteConfigFile;
}

async function bind(
  app,
  server,
  callback
) {
  info(`Running in ${pc.yellow(Config.mode)} mode`);

  clearState();

  if (Vite && Config.mode === "development") {
    const vite = await startServer(server);
    await injectStaticMiddleware(app, vite.middlewares);
    await injectViteIndexMiddleware(app, vite);
  } else {
    await injectStaticMiddleware(app, await serveStatic());
    await injectIndexMiddleware(app);
  }

  callback?.();
}

export default { config, bind };
