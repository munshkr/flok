import url from "url";
import { WebSocketServer, type WebSocket } from "ws";
import http from "http";
import { PubSubServer } from "@flok/pubsub";
import onYjsWsConnection from "./y-websocket-server.js";
import onSignalingWsConnection from "./signaling-server.js";
import debugModule from "debug";

const debug = debugModule("flok:server");

type FlokServer = http.Server & { _pubSubServer: PubSubServer };

export default function withFlokServer(server: http.Server): FlokServer {
  const topics: Map<string, Set<any>> = new Map();

  const wss = new WebSocketServer({ noServer: true });
  const docWss = new WebSocketServer({ noServer: true });
  const pubsubWss = new WebSocketServer({ noServer: true });

  const newServer = server as FlokServer;

  newServer.on("upgrade", (request, socket, head) => {
    const { pathname } = url.parse(request.url);

    if (pathname.startsWith("/signal")) {
      wss.handleUpgrade(request, socket, head, (...args: any[]) => {
        debug("y-webrtc signaling connection");
        wss.emit("connection", ...args);
      });
    } else if (pathname.startsWith("/doc")) {
      docWss.handleUpgrade(request, socket, head, (...args: any[]) => {
        debug("y-websocket connection");
        docWss.emit("connection", ...args);
      });
    } else if (pathname.startsWith("/pubsub")) {
      pubsubWss.handleUpgrade(request, socket, head, (...args: any[]) => {
        debug("pubsub connection");
        pubsubWss.emit("connection", ...args);
      });
    } else {
      debug("Ignoring request to path:", pathname);
      socket.destroy();
    }
  });

  wss.on("connection", (conn: WebSocket) =>
    onSignalingWsConnection(conn, topics)
  );
  docWss.on("connection", (conn: WebSocket, req: http.IncomingMessage) => {
    onYjsWsConnection(conn, req);
  });

  // Prepare PubSub WebScoket server (pubsub) for code evaluation
  newServer._pubSubServer = new PubSubServer({
    wss: pubsubWss,
    pingTimeout: 5000,
  });

  return newServer;
}
