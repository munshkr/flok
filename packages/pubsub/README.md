# @flok-editor/pubsub

WebSocket-based Pub/Sub client and server, used for remote code execution and
message passing in Flok.

## Features

* Basic Publish/Subscribe functionality: `subscribe`, `unsubscribe`, `publish`,
  `unsubscribeAll`.
* Payload is JSON serialized, topics are any string.
* Allows subscribing or unsubscribing without being connected by storing state
  on the client.
* Automatically reconnects if connection is lost, recovering client's state.
* Ping/pong mechanism for detecting and closing broken connections both on
  client and server.

## Usage

### Server

```js
import { WebSocketServer } from "ws"
import { PubSubServer } from "@flok-editor/pubsub"

// To use the server, you need to create a `WebSocketServer` and pass it to
// `PubSubServer`.
const wss = new WebSocketServer({ port: 4000 });
const server = new PubSubServer({ wss });

console.log(`PubSub server listening on`, wss.address())
```

### Client

```js
import { PubSubClient } from "@flok-editor/pubsub"

const client = new PubSubClient({ url: "ws://localhost:4000" });

// Subscribe to topics
client.subscribe("b");
client.subscribe("a");

client.start();

// Wait for the connection to be made, otherwise published messages are discarded.
let internalId;
client.on("open", () => {
  // Publish a message (any JSON serializable object) to a topic
  internalId = setInterval(() => {
    client.publish("a", { salutation: "hello!" })
  }, 2000);
})

// Add an error event handler to ignore connection errors
client.on("error", () => { });

client.on("close", () => clearInterval(internalId))

setTimeout(() => {
  // Unsubscribe from a topic
  client.unsubscribe("b");
  // ... or from all topics with a single call
  client.unsubscribeAll();
}, 5000)

// you can add a listener for all message events
client.on("message", (topic, data) => {
  console.log("message", topic, data)
})

// ...or only from a specific topic
client.on("message:a", (data) => {
  console.log("message from topic 'a'", data)
})

// Finally, you can subscribe and listen to messages in a single call
client.subscribe("c", (data) => {
  console.log("message from 'c'", data);
});
```

## Development

Run `npm install` to install dependencies.

Run `npm run build` to build package.
