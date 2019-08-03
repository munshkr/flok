import express from "express";
import next from "next";
import http from "http";
import ShareDB from "sharedb";
import WebSocket from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import PubSub from "./lib/pubsub";

const port = parseInt(process.env.PORT, 10) || 3000;
const evalPort = parseInt(process.env.EVAL_PORT, 10) || 3001;

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

function startEvalServer(app) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  const pubSubServer = new PubSub({ wss });
  // eslint-disable-next-line no-param-reassign
  app.pubsub = pubSubServer;

  server.listen(evalPort, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Evaluation WS server ready on ws://localhost:${evalPort}`);
  });
}

function startServers() {
  nextApp.prepare().then(() => {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // Connect any incoming WebSocket connection to ShareDB
    wss.on("connection", ws => {
      const stream = new WebSocketJSONStream(ws);
      backend.listen(stream);
    });

    // Let Next to handle everything else
    app.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`> Ready on http://localhost:${port}`);
    });

    startEvalServer(app);
  });
}

createDoc(startServers);
