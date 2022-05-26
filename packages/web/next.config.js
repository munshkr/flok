/* eslint-disable no-param-reassign */
// next.config.js
const process = require("process");
const path = require("path");
const fs = require("fs");

const packageConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"))
);

module.exports = {
  swcMinify: true,

  publicRuntimeConfig: {
    flokVersion: packageConfig.version,
    isDevelopment: process.env.NODE_ENV !== "production",
    iceStunUrl: process.env.ICE_STUN_URL,
    iceTurnUrl: process.env.ICE_TURN_URL,
    iceStunCredentials: process.env.ICE_STUN_USERPASS,
    iceTurnCredentials: process.env.ICE_TURN_USERPASS,
  },

  webpack(config) {
    // Fixes npm packages that depend on `fs` module
    config.resolve.fallback = {
      fs: false,
    };

    // Skip the following modules from transpiling
    config.externals = [
      ...config.externals,
      'lib0',
      'y-protocols',
      'y-indexeddb'
    ];

    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: "url-loader",
        options: {
          limit: 100000,
          name: "[name].[ext]",
        },
      },
    });

    return config;
  },
};
