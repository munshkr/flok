import url from "url";
import path from "path";
import fs from "fs";
import WebSocket from "ws";
import process from "process";
import https from "https";
import connect from "connect";
import { map } from "lib0";
import { PubSub } from "@flok/core";
import { setupWSConnection } from "./y-websocket-server.js";
import { getFileDirname } from "./utils.js";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
// const wsReadyStateClosing = 2; // eslint-disable-line
// const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

const __dirname = getFileDirname();
const sslCertPath = path.resolve(__dirname, "..", "cert", "localhost.crt");
const sslKeyPath = path.resolve(__dirname, "..", "cert", "localhost.key");

export default class Server {
  host: string;
  port: number;
  isDevelopment: boolean;
  secure: boolean;
  started: boolean;

  _topics: Map<string, Set<any>>;

  constructor(ctx) {
    const { host, port, isDevelopment, secure } = ctx;

    this.host = host || "0.0.0.0";
    this.port = port || 3001;
    this.isDevelopment = isDevelopment || false;
    this.secure = secure || false;

    this.started = false;
    this._topics = new Map();
  }

  get scheme() {
    return this.secure ? "https" : "http";
  }

  start(cb) {
    if (this.started) return this;

    function addClient(uuid) {
      console.log("[pubsub] Add client", uuid);
    }

    function removeClient(uuid) {
      console.log("[pubsub] Remove client", uuid);
    }

    const app = connect();

    const wss = new WebSocket.Server({ noServer: true });
    const docWss = new WebSocket.Server({ noServer: true });
    const pubsubWss = new WebSocket.Server({ noServer: true });

    const server = createServer(app, this.secure);

    server.on("upgrade", (request, socket, head) => {
      const { pathname } = url.parse(request.url);

      if (pathname.startsWith("/signal")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws);
        });
      } else if (pathname.startsWith("/doc")) {
        docWss.handleUpgrade(request, socket, head, (ws) => {
          docWss.emit("connection", ws);
        });
      } else if (pathname.startsWith("/pubsub")) {
        pubsubWss.handleUpgrade(request, socket, head, (ws) => {
          pubsubWss.emit("connection", ws);
        });
      } else {
        console.warn("[server] Ignoring request to path:", pathname);
        socket.destroy();
      }
    });

    wss.on("connection", (conn) => this.onSignalingServerConnection(conn));
    docWss.on("connection", () => setupWSConnection);

    // Prepare PubSub WebScoket server (pubsub)
    const pubSubServer = new PubSub({
      wss: pubsubWss,
      onConnection: addClient,
      onDisconnection: removeClient,
    });

    if (process.env.REDIRECT_HTTPS) {
      console.log("> Going to redirect http to https");
      app.use(
        sslRedirect({
          port: process.env.NODE_ENV === "production" ? null : this.port,
        })
      );
    }

    server.listen(this.port, this.host, () => {
      console.log(`> Flok server listening on ${this.host}, port ${this.port}`);
      if (cb) cb();
    });

    return this;
  }

  onSignalingServerConnection(conn) {
    const subscribedTopics = new Set<string>();
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
      subscribedTopics.forEach((topicName) => {
        const subs = this._topics.get(topicName) || new Set();
        subs.delete(conn);
        if (subs.size === 0) {
          this._topics.delete(topicName);
        }
      });
      subscribedTopics.clear();
      closed = true;
    });

    conn.on("message", (message: any) => {
      if (typeof message === "string") {
        message = JSON.parse(message);
      }
      if (message && message.type && !closed) {
        switch (message.type) {
          case "subscribe":
            /** @type {Array<string>} */ (message.topics || []).forEach(
              (topicName) => {
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
              (topicName) => {
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
                receivers.forEach((receiver) => send(receiver, message));
              }
            }
            break;
          case "ping":
            send(conn, { type: "pong" });
            break;
          default:
        }
      }
    });
  }
}

const createServer = (app, secure) => {
  if (secure) {
    return https.createServer(
      {
        key: fs.readFileSync(
          process.env.SSL_KEY ? process.env.SSL_KEY : sslKeyPath,
          "utf8"
        ),
        cert: fs.readFileSync(
          process.env.SSL_CERT ? process.env.SSL_CERT : sslCertPath,
          "utf8"
        ),
      },
      app
    );
  }

  return https.createServer(app);
};

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

/**
 * Force load with https on production environment
 * https://devcenter.heroku.com/articles/http-routing#heroku-headers
 *
 * Based on https://www.npmjs.com/package/heroku-ssl-redirect
 */
const sslRedirect = ({ port, status }: { port: number; status?: number }) => {
  status = status || 302;
  return (req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      res.redirect(
        status,
        `https://${req.hostname}${port ? `:${port}` : ""}${req.originalUrl}`
      );
    } else {
      next();
    }
  };
};
