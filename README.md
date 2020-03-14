# Flok

Web-based P2P collaborative editor for live coding music and graphics

*Work in progress*


## Features / Ideas

* Similar to Etherpad, but focused on code evaluation for livecoding.
* REPL plugins: allows user to locally evaluate code from interpreters (like
  Haskell, Ruby, Python, etc.):
  - [TidalCycles](https://tidalcycles.org/)
  - [SuperCollider](https://supercollider.github.io/) (sclang)
  - [FoxDot](https://foxdot.org/)
  - [SonicPi](https://sonic-pi.net/)
  - ... any interpreter with a REPL (Python, Ruby, etc.)
* Web Plugins, for languages embedded in editor (*not implemented yet*):
  - [Hydra](https://github.com/ojack/hydra)
  - [VEDA.js](https://github.com/fand/vedajs)
  - [p5.js](https://p5js.org/)
  - [Tilt](https://github.com/munshkr/tilt)


## Install

Flok is written in TypeScript and Nodejs.  You will need to have installed Node
versions 10 or 12.

Go [here](https://nodejs.org/) to download Node.

*Note*: Currently Node 13 is not supported because of a Hydra dependency that
does not support that version.

Right now, the easiest way to use Flok is to install the `repl` and `web`
packages.

```sh
npm install -g flok-repl flok-web
```

In the future there will also be a single portable [GUI
application](https://github.com/munshkr/flok-gui) that will run everything, but
for now you'll have to use the terminal.


## Usage

### Public server

**WARNING - Please Read**: Using a public server can be dangerous as *anyone*
can execute code on your computer via Flok, so *please* make sure you only
share your session URL to trusted users and friends when you use a public
server.  I will not be held responsible for any damaged caused by Flok.  You
have been warned.  There is an
[issue](https://github.com/munshkr/flok/issues/2) assigned to mitigate this
security problem.

This is a list of known public servers (up-to-date):

* [flok.clic.cf](https://flok.clic.cf)
* [flok-hub.herokuapp.com](https://flok-hub.herokuapp.com)

#### Create a session

When you enter a Flok server, you will be prompted to enter a list of targets.
A target is the language or tool that Flok will communicate to create sound
through `flok-repl`.

Enter the name of the targets, separated with commas.  You can use a target
multiple times and Flok will create that many number of slots to write code.
Currently the maximum number of slots is 8.

Examples:

* `tidal,foxdot,hydra`: 3 slots, with tidal, foxdot and hydra respectively.
* `sclang,sclang,sclang,hydra,hydra`: 5 slots total, the first 3 with `sclang`
  and the last 2 with `hydra`.

Now click on *Create session*.

You will now be shown a **token** and asked for a nickname. Save the token, as
you will need it next for starting the REPL.  Enter your nickname and click on
*Join*.

You are ready to start writing.  Share the URL to your friends so they can join
the session! :-)

#### Connect REPLs to Flok

The last step is to start `flok-repl`, to connect Flok with your REPLs.

You will need to specify the server (prefixing with `wss://`) where you created
the session (or where you were invited to), the session *token* and the kind of
REPL you want to start.

For example, if your session token is `1a0c2df3-5931-46dd-9c7c-52932de15a5d`,
to start a `tidal` REPL, run the following:

```sh
flok-repl -H wss://flok-hub.herokuapp.com -t tidal -s 1a0c2df3-5931-46dd-9c7c-52932de15a5d
```

If you need to start multiple REPLs, you will need to run them on separate
terminals as currently `flok-repl` supports only one REPL at a time.


### Local server

In case you don't have an Internet connection and/or you don't want to play
Flok on a public server, you can easily start a local Flok server.

To start the server, simply run:

```sh
flok-web
```

Your local server will be available on
[http://localhost:3000](http://localhost:3000) from your computer.  To share
the URL with your friends, change `localhost` with your local IP. See
[how to find your local and external IP address](https://lifehacker.com/how-to-find-your-local-and-external-ip-address-5833108).

Follow the instructions on *Remote server - Create a session* section above.

When starting the REPL, make sure to use `ws://`, not `wss://`, because
currently the local server runs only on http, not https.

Using the same example as in the previous section:

```sh
flok-repl -h ws://localhost:3000 -t tidal -s 1a0c2df3-5931-46dd-9c7c-52932de15a5d
```

Your friends would need to use your local IP. Suppose your IP is 192.168.0.5,
then they should run:

```sh
flok-repl -h ws://192.168.0.5:3000 -t tidal -s 1a0c2df3-5931-46dd-9c7c-52932de15a5d
```


## Development

After unpacking or cloning, from the directory of the repository run:

```sh
yarn
```

This will install dependencies from all packages, and prepare (build) packages.

`web`, `repl` and `core` packages are stored on the `packages/` directory, and
there is a root packaged managed by [Lerna](https://github.com/lerna/lerna).

Lerna allows us to manage interdependant packages easily. In the case of Flok,
the `core` package is used both by `web` and `repl`, and even though they have
`flok-core` dependency on their `package.json`, Lerna creates symbolic links to
the local `core` package automatically.  It also makes it easy to publish new
versions by bumping them together.

To bump a new version on all packages and release them together, run `yarn release`.


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
