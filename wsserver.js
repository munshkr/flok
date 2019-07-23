const http = require("http");
const express = require("express");
const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");

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
  // Create a web server to serve files and listen to WebSocket connections
  const app = express();
  const server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  const wss = new WebSocket.Server({ server });

  function noop() {}
  function heartbeat() {
    this.isAlive = true;
  }

  wss.on("connection", (ws, _req) => {
    // eslint-disable-next-line no-param-reassign
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  setInterval(function ping() {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();
      // eslint-disable-next-line no-param-reassign
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 30000);

  server.listen(8080);
  // eslint-disable-next-line no-console
  console.log("Listening on http://localhost:8080");
}

createDoc(startServer);
