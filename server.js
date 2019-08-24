import express from "express";
import next from "next";
import http from "http";
import url from "url";
import ShareDB from "sharedb";
import WebSocket from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import PubSub from "./lib/pubsub";

const port = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const backend = new ShareDB({
  disableDocAction: true,
  disableSpaceDelimitedActions: true
});

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
    console.log(`> Ready on http://localhost:${port}`);
  });
});
