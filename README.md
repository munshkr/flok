# flok

Web-based collaborative editor for live coding music and graphics

*Work in progress*


## Features / Ideas

* Web and DB server (similar to Etherpad, but focused on code evaluation for
  livecoding).
* REPL plugins: allows user to locally evaluate code from interpreters (like
  Haskell, Ruby, Python, etc.):
  - TidalCycles
  - SuperCollider (sclang)
  - FoxDot
  - SonicPi
  - ... any interpreter with a REPL (Python, Ruby, etc.)
* Web Plugins, for languages embedded in editor (*not implemented yet*):
  - Hydra
  - Tilt


## Install

flok is written in TypeScript (currently migrating from JavaScript).  We
recently started making (still experimental) releases on GitHub and NPM
repositories. The easiest way to use Flok is to install the `web` and `repl`
packages.

```sh
npm install -g flok-web flok-repl
```

In the future there will also be a single portable [GUI
application](https://github.com/munshkr/flok-gui) that will run everything, but
for now you'll have to use the terminal.


## Usage

### Local server

To that the server (hub), simply run:

```sh
flok-web
```

Then go to [http://localhost:3000](http://localhost:3000) and enter a session
name and yout nickname.  Users should enter the same session name to edit the
same document.

You should now run a REPL for your language/interpreter. For example, to run
`sclang` (SuperCollider interpreter):

```sh
flok-repl -t sclang
```

This will start sclang interpreter and connect it to flok. Now when you (or
someone else) evaluates code in flok, it will be sent to `sclang`.

The default hub is your own computer (i.e. `ws://localhost:3000`).  If you want
to connect to a remote hub on your LAN, for example to 192.168.0.5:

```sh
flok-repl -t sclang -H ws://192.168.0.5:3000
```

There is a list of known interpreters. Use `flok-repl --list-types` to list
them.  You can run any command that accepts input from the standard input, like
any language REPL.  For instance, to use with `cat`:

```sh
flok-repl cat
```


### Remote server

**WARNING - Please Read**: As of today, using a public remote hub is extremely
dangerous as *anyone* can evaluate code on your computer via flok, be it sound
playing or writing files on your disk (any general purpose programming language
can do that), so unless you made `flok-repl` run on a sandboxed environment,
please, make sure only trusted users are using your session when you use a
public hub.  I will not be held responsible for any damaged caused by flok.
You have been warned.

There's currently a hub on `flok-hub.herokuapp.com`.  This public server runs
on https, so you have to use `wss://` instead of `ws://` as you would normally
on local servers.  For example, to start a `tidal` REPL, run the following:

```
flok-repl -H wss://flok-hub.herokuapp.com -t tidal
```


## Development

After unpacking or cloning, from the directory of the repository run:

```sh
yarn
```

This will install dependencies from all packages, and prepare (build) packages.

`web`, `repl` and `core` packages are stored on the `packages/` directory, and
there is a root packaged managed by [Lerna](https://github.com/lerna/lerna).

Lerna allows us to manage interdependant packages easily. In the case of flok,
the `core` package is used both by `web` and `repl`, and even though they have
`flok-core` dependency on their `package.json`, Lerna creates symbolic links to
the local `core` package automatically.  It also makes it easy to publish new
versions by bumping them together.


## Acknowledgments

* [Etherpad](https://github.com/ether/etherpad-lite)
* [Troop](https://github.com/Qirky/Troop)
* [TidalBridge](https://gitlab.com/colectivo-de-livecoders/tidal-bridge)


## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok). This project is intended to be a safe,
welcoming space for collaboration, and contributors are expected to adhere to
the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

This project is licensed under GPL 3+. Refer to [LICENSE.txt](LICENSE.txt)
