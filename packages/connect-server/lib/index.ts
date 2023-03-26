import url from "url";
import WebSocket from "ws";
import http from "http";
import { PubSub } from "@flok/pubsub";
import onYjsWsConnection from "./y-websocket-server.js";
import onWsConnection from "./ws-server.js";
import debugModule from "debug";

const debug = debugModule("flok:server");

type FlokServer = http.Server & { _pubSubServer: PubSub };

export default function withFlokServer(server: http.Server): FlokServer {
  const topics: Map<string, Set<any>> = new Map();

  const wss = new WebSocket.Server({ noServer: true });
  const docWss = new WebSocket.Server({ noServer: true });
  const pubsubWss = new WebSocket.Server({ noServer: true });

  const newServer = server as FlokServer;

  newServer.on("upgrade", (request, socket, head) => {
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
      debug("Ignoring request to path:", pathname);
      socket.destroy();
    }
  });

  wss.on("connection", (conn) => onWsConnection(conn, topics));
  docWss.on("connection", () => onYjsWsConnection);

  // Prepare PubSub WebScoket server (pubsub) for code evaluation
  newServer._pubSubServer = new PubSub({
    wss: pubsubWss,
    onConnection: (uuid: string) => {
      debug("Add pubsub client", uuid);
    },
    onDisconnection: (uuid: string) => {
      debug("Remove pubsub client", uuid);
    },
  });

  return newServer;
}
