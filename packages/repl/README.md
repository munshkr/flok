# flok-repl

REPL client for interfacing with a Flok server and live coding interpreters.

See [Flok](https://github.com/munshkr/flok) for more.

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
to use SuperCollider for a session named `myJam`, just run:

```sh
flok-repl -t sclang -s myJam
```

This will start sclang interpreter and connect it to Flok. Now when you (or
someone else) evaluates code in Flok, it will be sent to `sclang`.

The default hub is your own computer (i.e. `ws://localhost:3000`).  If you want
to connect to a remote hub on your LAN, for example to 192.168.0.5:

```sh
flok-repl -t sclang -s myJam -H ws://192.168.0.5:3000
```

There is a list of known interpreters. Use `flok-repl --list-types` to list
them.  You can run any command that accepts input from the standard input, like
any language REPL.  For instance, to use with `cat`:

```sh
flok-repl cat
```


### Remote server

**WARNING - Please Read**: As of today, using a public remote hub is dangerous
as *anyone* can evaluate code on your computer via Flok, be it sound playing or
writing files on your disk (any general purpose programming language can do
that), so unless you made `flok-repl` run on a sandboxed environment, please,
make sure only trusted users are using your session when you use a public hub.
I will not be responsible for any damaged caused by Flok.  You have been
warned.

To start a REPL for a remote server/hub, you must provide a `--hub/-H` option.

There's currently a hub on `flok-hub.herokuapp.com`.  This public server runs
on https, so you have to use `wss://` instead of `ws://` as you would normally
on local servers.  For example, to start a `tidal` REPL, run the following:

```
flok-repl -H wss://flok-hub.herokuapp.com -t tidal -s myJam
```


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
