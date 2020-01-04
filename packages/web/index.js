const Server = require("./lib/server");

module.exports = { Server };

// When running this file as a script, run server with default parameters
// Enable development mode if NODE_ENV != production
if (require.main === module) {
  // eslint-disable-next-line global-require
  const process = require("process");
  const host = process.env.HOST;
  const port = process.env.PORT;
  const isDevelopment = process.env.NODE_ENV !== "production";

  const mongoDbUri = process.env.MONGODB_URI;

  const server = new Server({ host, port, isDevelopment, mongoDbUri });
  server.start();
}
