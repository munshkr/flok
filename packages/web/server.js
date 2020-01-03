const express = require("express");
const next = require("next");
const http = require("http");
const url = require("url");
const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const { PubSub } = require("flok-core");

const host = process.env.HOST || "127.0.0.1";
const port = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

let backendOptions = {
  disableDocAction: true,
  disableSpaceDelimitedActions: true
};

if (process.env.MONGODB_URI) {
  const db = require("sharedb-mongo")(process.env.MONGODB_URI);
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

  server.listen(port, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${host}:${port}`);
  });
});
