import { PubSubClient } from "../dist/index.js";

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
    client.publish("a", { salutation: "hello!" });
  }, 2000);
});

// Add an error event handler to ignore connection errors
client.on("error", () => {});

client.on("close", () => clearInterval(internalId));

setTimeout(() => {
  // Unsubscribe from a topic
  client.unsubscribe("b");
  // ... or from all topics with a single call
  client.unsubscribeAll();
}, 5000);

// you can add a listener for all message events
client.on("message", (topic, data) => {
  console.log("message", topic, data);
});

// ...or only from a specific topic
client.on("message:a", (data) => {
  console.log("message from topic 'a'", data);
});
