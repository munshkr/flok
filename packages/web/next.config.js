/* eslint-disable no-param-reassign */
// next.config.js
const withCSS = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const process = require("process");

module.exports = withCSS(
  withSass({
    publicRuntimeConfig: {
      USE_WSS: process.env.USE_WSS
    },

    webpack(config) {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: "empty"
      };

      config.module.rules.push({
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 100000,
            name: "[name].[ext]"
          }
        }
      });

      return config;
    }
  })
);
