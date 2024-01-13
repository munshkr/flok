import { WebSocketServer } from "ws"
import { PubSubServer } from "../dist/server.js"

const wss = new WebSocketServer({ port: 4000 });
const server = new PubSubServer({ wss });

console.log(`PubSub server listening on`, wss.address())
