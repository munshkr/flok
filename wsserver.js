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
    if (doc.type === null) {
      console.log("Document created");
      doc.create({ content: "hi!" }, callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  const app = express();
  const server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws, _req) => {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  server.listen(8080);
  // eslint-disable-next-line no-console
  console.log("Listening on http://localhost:8080");
}

createDoc(startServer);
