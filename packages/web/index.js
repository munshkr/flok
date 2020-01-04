const Server = require("./lib/server");

module.exports = { Server };

// When running this file as a script, run server with default parameters
// Enable development mode if NODE_ENV != production
if (require.main === module) {
  // eslint-disable-next-line global-require
  const process = require("process");
  const isDevelopment = process.env.NODE_ENV !== "production";

  const server = new Server({ isDevelopment });
  server.start();
}
