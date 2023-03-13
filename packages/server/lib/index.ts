import url from "url";
import WebSocket from "ws";
import { PubSub } from "@flok/core";
import onYjsWsConnection from "./y-websocket-server.js";
import onWsConnection from "./ws-server.js";

export default function (app) {
  const topics: Map<string, Set<any>> = new Map();

  const wss = new WebSocket.Server({ noServer: true });
  const docWss = new WebSocket.Server({ noServer: true });
  const pubsubWss = new WebSocket.Server({ noServer: true });

  app.on("upgrade", (request, socket, head) => {
    const { pathname } = url.parse(request.url);

    if (pathname.startsWith("/signal")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log("/signal upgrade");
        wss.emit("connection", ws);
      });
    } else if (pathname.startsWith("/doc")) {
      docWss.handleUpgrade(request, socket, head, (ws) => {
        console.log("/doc upgrade");
        docWss.emit("connection", ws);
      });
    } else if (pathname.startsWith("/pubsub")) {
      pubsubWss.handleUpgrade(request, socket, head, (ws) => {
        console.log("/pubsub upgrade");
        pubsubWss.emit("connection", ws);
      });
    } else {
      console.warn("[server] Ignoring request to path:", pathname);
      socket.destroy();
    }
  });

  wss.on("connection", (conn) => onWsConnection(conn, topics));
  docWss.on("connection", () => onYjsWsConnection);

  // Prepare PubSub WebScoket server (pubsub) for code evaluation
  app._pubSubServer = new PubSub({
    wss: pubsubWss,
    onConnection: (uuid: string) => {
      console.log("[pubsub] Add client", uuid);
    },
    onDisconnection: (uuid: string) => {
      console.log("[pubsub] Remove client", uuid);
    },
  });

  return app;
}
