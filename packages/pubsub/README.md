# @flok/pubsub

WebSocket-based Pub/Sub client and server, used for remote code execution and
message passing in Flok.

## Usage

### Server

```js
import { WebSocketServer } from "ws"
import { PubSubServer } from "@flok/pubsub"

// To use the server, you need to create a `WebSocketServer` and pass it to
// `PubSubServer`.
const wss = new WebSocketServer({ port: 4000 });
const server = new PubSubServer(wss);

console.log(`PubSub server listening on`, wss.address())
```

### Client

```js
import { PubSubClient } from "@flok/pubsub"

const client = new PubSubClient({ port: 4000 });

client.connect();

// Wait for the connection to be made
client.on("open", () => {
  // Subscribe to topics
  client.subscribe("b");
  client.subscribe("a");

  // Publish a message (any JSON serializable object) to a topic
  setInterval(() => {
    client.publish("a", { salutation: "hello!" })
  }, 2000);

  setTimeout(() => {
    // Unsubscribe from a topic
    client.subscribe("b");
    // ... or from all topics with a single call
    client.unsubscribeAll();
  }, 5000)
})

// you can add a listener for all message events
client.on("message", (topic, data) => {
  console.log("message", topic, data)
})

// ...or only from a specific topic
client.on("message:a", (data) => {
  console.log("message from topic 'a'", data)
})
```

## Development

Run `npm install` to install dependencies.

Run `npm run build` to build package.
