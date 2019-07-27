const express = require("express");
const next = require("next");
const http = require("http");
const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const backend = new ShareDB();

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
  });
}

createDoc(startServer);
