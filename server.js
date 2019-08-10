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

// Create initial document then fire callback
function createDoc(callback) {
  const connection = backend.connect();
  const doc = connection.get("flok", "foo");

  doc.fetch(err => {
    if (err) throw err;
    callback();
  });
}

function startServer() {
  nextApp.prepare().then(() => {
    const app = express();
    const wss = new WebSocket.Server({ noServer: true });
    const evalWss = new WebSocket.Server({ noServer: true });
    const server = http.createServer(app);

    server.on("upgrade", (request, socket, head) => {
      const { pathname } = url.parse(request.url);

      if (pathname === "/db") {
        wss.handleUpgrade(request, socket, head, ws => {
          wss.emit("connection", ws);
        });
      } else if (pathname === "/eval") {
        evalWss.handleUpgrade(request, socket, head, ws => {
          evalWss.emit("connection", ws);
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

    // Prepare evaluation WebScoket server (pubsub)
    const pubSubServer = new PubSub({ wss: evalWss });
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
}

createDoc(startServer);
