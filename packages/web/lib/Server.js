/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const express = require("express");
const next = require("next");
const http = require("http");
const url = require("url");
const path = require("path");
const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const { PubSub } = require("flok-core");

let createMongoDB;
try {
  createMongoDB = require("sharedb-mongo");
  // eslint-disable-next-line no-empty
} catch {}

class Server {
  constructor(ctx) {
    const { host, port, isDevelopment, mongoDbUri } = ctx;

    this.host = host || "0.0.0.0";
    this.port = port || 3000;
    this.isDevelopment = isDevelopment || false;
    this.mongoDbUri = mongoDbUri;

    this.started = false;
  }

  start() {
    if (this.started) return this;

    const nextApp = next({
      dev: this.isDevelopment,
      dir: path.join(__dirname, "..")
    });
    const handle = nextApp.getRequestHandler();

    let backendOptions = {
      disableDocAction: true,
      disableSpaceDelimitedActions: true
    };

    if (this.mongoDbUri) {
      if (!createMongoDB) {
        throw Error(
          "mongoDbUri was given, but package 'sharedb-mongo' is not installed"
        );
      }
      const db = createMongoDB(this.mongoDbUri);
      backendOptions = { ...backendOptions, db };
    }

    const backend = new ShareDB(backendOptions);

    function addClient(uuid) {
      console.log("[pubsub] Add client", uuid);
    }

    function removeClient(uuid) {
      console.log("[pubsub] Remove client", uuid);
    }

    nextApp.prepare().then(() => {
      const app = express();
      const wss = new WebSocket.Server({ noServer: true });
      const pubsubWss = new WebSocket.Server({ noServer: true });
      const server = http.createServer(app);

      server.on("upgrade", (request, socket, head) => {
        const { pathname } = url.parse(request.url);

        if (pathname === "/db") {
          wss.handleUpgrade(request, socket, head, ws => {
            wss.emit("connection", ws);
          });
        } else if (pathname === "/pubsub") {
          pubsubWss.handleUpgrade(request, socket, head, ws => {
            pubsubWss.emit("connection", ws);
          });
        } else {
          socket.destroy();
        }
      });

      // Connect any incoming WebSocket connection to ShareDB
      wss.on("connection", ws => {
        const stream = new WebSocketJSONStream(ws);
        backend.listen(stream);
      });

      // Prepare PubSub WebScoket server (pubsub)
      const pubSubServer = new PubSub({
        wss: pubsubWss,
        onConnection: addClient,
        onDisconnection: removeClient
      });
      // eslint-disable-next-line no-param-reassign
      app.pubsub = pubSubServer;

      // Let Next to handle everything else
      app.get("*", (req, res) => {
        return handle(req, res);
      });

      server.listen(this.port, this.host, err => {
        if (err) throw err;
        // eslint-disable-next-line no-console
        console.log(`> Ready on http://${this.host}:${this.port}`);
      });
    });

    return this;
  }
}

module.exports = Server;
