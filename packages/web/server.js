const Server = require("./lib/Server");

module.exports = { Server };

// Enable development mode if NODE_ENV != production
// eslint-disable-next-line global-require
const process = require("process");
const host = process.env.HOST;
const port = process.env.PORT;
const secure = process.env.SECURE === "1";
const isDevelopment = process.env.NODE_ENV !== "production";

const server = new Server({
host,
port,
secure,
isDevelopment,
});
server.start();
