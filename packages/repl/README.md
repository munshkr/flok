# flok-repl

REPL client for interfacing with a Flok server and live coding interpreters.

See [flok](https://github.com/munshkr/flok) for more.

*Work in progress*


## Install

```
npm install -g flok-repl
```


## Usage

To start a REPL connected to some hub:

```
flok-repl -- CMD [ARGS...]
```

Run `flok-repl --help` to see all available options.

### Local server

If you have a local web server running (see
[flok-web](https://github.com/munshkr/flok/tree/master/packages/web), and want
to use SuperCollider, just run:

```
flok-repl -- sclang
```

This will start the `sclang` interpreter and connect it to your local flok. Now
when you (or someone else) evaluates code in flok, it will be sent to `sclang`.

### Remote server

To start a REPL for a remote server/hub, you must provide a `--hub/-H` option.

There is currently a remote hub on `flok-hub.herokuapp.com`.  For example, to
start a `tidal` REPL for this particular hub, run the following:

```
flok-repl -H wss://flok-hub.herokuapp.com -- tidal
```

**Note**: Usually to start the TidalCycles interpreter, you have to run GHCI
with some options and a bootstrap script, but you can use this [wrapper
script](https://gist.github.com/munshkr/4cf8745a4983f3cd361826978481bd74) to
simplify this process and use it with flok (Linux and macOS only, for now).
Follow the instructions there.


## Development

This project uses [Yarn](https://yarnpkg.com). If you don't have it installed,
read [this page](https://yarnpkg.com/lang/en/docs/install/) and follow the
instructions.

After unpacking or cloning this repository, *cd* into it and run `yarn` to
install all dependencies.

Run `yarn flok-repl` or `node bin/flok-repl.js` to execute the binary script.

With `yarn test` you can run tests.


## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok). This project is intended to be a
safe, welcoming space for collaboration, and contributors are expected to
adhere to the [Contributor Covenant](http://contributor-covenant.org) code of
conduct.


## License

This project is licensed under GPL 3+.
