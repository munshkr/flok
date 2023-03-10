import startServer from "./lib/server.js";

startServer({
  hostname: "localhost",
  port: 3000,
  isDevelopment: process.env.NODE_ENV !== "production"
})
