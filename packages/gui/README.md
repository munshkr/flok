# flok-gui

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)

> A cross-platform GUI application for using Flok for collaborative live coding.

See [flok](https://github.com/munshkr/flok) for more.

*Work in progress*: Soon there will be cross-platform binaries to download at
the [Releases page](https://github.com/munshkr/flok-gui/releases)


## Development

This repository is based on the `electron-webpack` template, that comes packed
with...

* Use of [`webpack-dev-server`](https://github.com/webpack/webpack-dev-server)
  for development
* HMR for both `renderer` and `main` processes
* Use of [`babel-preset-env`](https://github.com/babel/babel-preset-env) that
  is automatically configured based on your `electron` version
* Use of
  [`electron-builder`](https://github.com/electron-userland/electron-builder)
  to package and build a distributable electron application

Make sure to check out [`electron-webpack`'s
documentation](https://webpack.electron.build/) for more details.

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```


## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok-gui). This project is intended to be a
safe, welcoming space for collaboration, and contributors are expected to
adhere to the [Contributor Covenant](http://contributor-covenant.org) code of
conduct.


## License

This project is licensed under GPL 3+. Refer to [LICENSE.txt](LICENSE.txt)
