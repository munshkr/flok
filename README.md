# flok

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)

> Web-based collaborative editor for live coding music and graphics

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

flok is written in Node and Javascript. In the future we will release packaged
executables but for now you will have to download or clone the repository.

After unpacking or cloning, from the directory of the repository run:

```sh
yarn
```

This will install all dependencies.


## Usage

### Local server

To that the server (hub), run:

```sh
yarn start
```

Then go to [http://localhost:3000](http://localhost:3000) and enter a session
name.  Users should enter the same session name to edit the same document.

You should now run a REPL for your language. For example, to run `sclang`
(SuperCollider):

```
./repl.js -- sclang
```

This will start sclang interpreter and connect it to flok. Now when you (or
someone else) evaluates code in flok, it will be sent to sclang.

### Remote server

There's currently a remote hub on `flok-hub.herokuapp.com`. To start a REPL for
that hub, you should run repl.js with SSL enabled.  For example, to start a
`tidal` REPL, run the following:

```
./repl.js -H flok-hub.herokuapp.com -P 443 --secure -- tidal
```


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
