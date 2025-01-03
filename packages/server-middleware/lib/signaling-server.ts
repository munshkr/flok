import { map } from "lib0";
import debugModule from "debug";

const debug = debugModule("flok:server:signaling-server");

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

export default (conn: any, topics: Map<string, Set<any>>) => {
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
      const subs = topics.get(topicName) || new Set();
      subs.delete(conn);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
  });

  conn.on("message", (data: Buffer) => {
    const message = JSON.parse(data.toString());
    if (message && message.type && !closed) {
      switch (message.type) {
        case "subscribe":
          /** @type {Array<string>} */ (message.topics || []).forEach(
            (topicName: string) => {
              if (typeof topicName === "string") {
                // add conn to topic
                const topic = map.setIfUndefined(
                  topics,
                  topicName,
                  () => new Set(),
                );
                topic.add(conn);
                // add topic to conn
                subscribedTopics.add(topicName);
              }
            },
          );
          break;
        case "unsubscribe":
          /** @type {Array<string>} */ (message.topics || []).forEach(
            (topicName: string) => {
              const subs = topics.get(topicName);
              if (subs) {
                subs.delete(conn);
              }
            },
          );
          break;
        case "publish":
          if (message.topic) {
            const receivers = topics.get(message.topic);
            if (receivers) {
              message.clients = receivers.size;
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
};

const send = (conn: WebSocket, message: object) => {
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
