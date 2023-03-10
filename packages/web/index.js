import { startServer } from "./lib/server.js";

startServer({
  hostname: "localhost",
  port: 3000,
  dev: process.env.NODE_ENV !== "production"
})
