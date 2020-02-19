/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const express = require("express");
const next = require("next");
const http = require("http");
const url = require("url");
const path = require("path");
const WebSocket = require("ws");
const map = require("lib0/dist/map.cjs");
const { PubSub } = require("flok-core");

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

/**
 * @param {any} conn
 * @param {object} message
 */
const send = (conn, message) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    conn.close();
  }
  try {
    conn.send(JSON.stringify(message));
  } catch (e) {
    conn.close();
  }
};

class Server {
  constructor(ctx) {
    const { host, port, isDevelopment } = ctx;

    this.host = host || "0.0.0.0";
    this.port = port || 3000;
    this.isDevelopment = isDevelopment || false;

    this.started = false;
    this._topics = new Map();
  }

  start() {
    if (this.started) return this;

    const nextApp = next({
      dev: this.isDevelopment,
      dir: path.join(__dirname, "..")
    });
    const handle = nextApp.getRequestHandler();

    // const backend = new ShareDB(backendOptions);

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

        if (pathname === "/signal") {
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

      wss.on("connection", conn => this.onSignalingServerConnection(conn));

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
        console.log(`> Listening on http://${this.host}:${this.port}`);
      });
    });

    return this;
  }

  onSignalingServerConnection(conn) {
    /**
     * @type {Set<string>}
     */
    const subscribedTopics = new Set();
    let closed = false;
    // Check if connection is still alive
    let pongReceived = true;
    const pingInterval = setInterval(() => {
      if (!pongReceived) {
        conn.close();
        clearInterval(pingInterval);
      } else {
        pongReceived = false;
        try {
          conn.ping();
        } catch (e) {
          conn.close();
        }
      }
    }, pingTimeout);

    conn.on("pong", () => {
      pongReceived = true;
    });

    conn.on("close", () => {
      subscribedTopics.forEach(topicName => {
        const subs = this._topics.get(topicName) || new Set();
        subs.delete(conn);
        if (subs.size === 0) {
          this._topics.delete(topicName);
        }
      });
      subscribedTopics.clear();
      closed = true;
    });

    conn.on(
      "message",
      /** @param {object} message */ message => {
        if (typeof message === "string") {
          message = JSON.parse(message);
        }
        if (message && message.type && !closed) {
          switch (message.type) {
            case "subscribe":
              /** @type {Array<string>} */ (message.topics || []).forEach(
                topicName => {
                  if (typeof topicName === "string") {
                    // add conn to topic
                    const topic = map.setIfUndefined(
                      this._topics,
                      topicName,
                      () => new Set()
                    );
                    topic.add(conn);
                    // add topic to conn
                    subscribedTopics.add(topicName);
                  }
                }
              );
              break;
            case "unsubscribe":
              /** @type {Array<string>} */ (message.topics || []).forEach(
                topicName => {
                  const subs = this._topics.get(topicName);
                  if (subs) {
                    subs.delete(conn);
                  }
                }
              );
              break;
            case "publish":
              if (message.topic) {
                const receivers = this._topics.get(message.topic);
                if (receivers) {
                  receivers.forEach(receiver => send(receiver, message));
                }
              }
              break;
            case "ping":
              send(conn, { type: "pong" });
              break;
            default:
          }
        }
      }
    );
  }
}

module.exports = Server;
