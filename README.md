# Flok

[![build status](https://img.shields.io/travis/munshkr/flok/master.svg?style=flat-square)](https://travis-ci.org/munshkr/flok)
[![gitter chat](https://img.shields.io/gitter/room/munshkr/flok.svg?style=flat-square)](https://gitter.im/munshkr/flok)

Web-based P2P collaborative editor for live coding music and graphics

**New version v1.0 in the works. Visit branch [`flok-next`](https://github.com/munshkr/flok/tree/flok-next) for more info!**

**Check out the new version (still WIP!) online here: https://next.flok.cc/**


## Features

* Similar to Etherpad, but focused on code evaluation for livecoding.
* REPL plugins: allows user to locally evaluate code from interpreters (like
  Haskell, Ruby, Python, etc.):
  - [TidalCycles](https://tidalcycles.org/)
  - [SuperCollider](https://supercollider.github.io/) (sclang)
  - [FoxDot](https://foxdot.org/)
  - [Mercury](#mercury)
  - [Sardine](https://sardine.raphaelforment.fr)
  - [SonicPi](https://sonic-pi.net/) (*not implemented yet*)
  - ... any interpreter with a REPL (Python, Ruby, etc.)
* Web Plugins, for languages embedded in editor:
  - [Hydra](https://github.com/ojack/hydra)
  - [p5.js](https://p5js.org/)
  - [VEDA.js](https://github.com/fand/vedajs) (*not implemented yet*, see [#82](https://github.com/munshkr/flok/pull/82))
  - [Tilt](https://github.com/munshkr/tilt) (*not implemented yet*)


## Requirements

Flok is written in TypeScript and Nodejs.  You will need to have installed Node
versions 10+.  The LTS version (currently 14) is recommended.

Go [here](https://nodejs.org/) to download Node.



## Install

Right now, the easiest way to use Flok is to install the `repl` and `web`
packages.

```sh
npm install -g flok-repl flok-web
```

If this command fails with permission errors (known issue on some Debian/Ubuntu
installs), you should follow [this
guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

In the future there will also be a single portable [GUI
application](https://github.com/munshkr/flok-gui) that will contain everything,
but for now you'll have to use the terminal.


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

* [flok.cc](https://flok.cc)

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
* `mercury, hydra`: 2 slots total, one with Mercury and one with Hydra.

Now click on *Create session*.

You will now be shown a **token** and asked for a nickname. Save the token, as
you will need it next for starting the REPL. Optionally copy the repl-code to
easily paste in the terminal and hook up your repl. Enter your nickname and
click on *Join*.

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

### Supported REPL targets

#### TidalCycles

Use `flok-repl` with the `-t tidal` parameter.

You can specify custom options with the `--extra` parameter, by passing a JSON
object, like this:

`--extra '{ "bootScript": "/path/to/my/boot.hs", "useStack": true }'`

##### Extra options

* `bootScript`: Path to a custom initialization script.

* `useStack`: Uses `stack exec -- ghci` instead of plain `ghci`. Use this if
  you installed Tidal using Stack.

* `ghci`: Use a specific Ghci command instead of plain `ghci`.
  This overrides `useStack` option, if used too.

#### Sardine

Use `flok-repl` with the `-t sardine` parameter. In order to make it work, 
the `fishery` REPL must be included to your PATH. It should already be the
case if you followed a regular install.

##### Extra options

* `python`: Path to your custom `fishery` Python REPL. Use this if you need
  to target a specific install of Sardine (Python version, different path, etc).

#### FoxDot

Use `flok-repl` with the `-t foxdot` parameter.

##### Extra options

* `python`: Path to Python binary. Use this if you need to use a custom Python
  version.


#### SuperCollider

In the case of SuperCollider, there are two types of REPLs: `sclang` and
`remote_sclang`. The first one tries to run a `sclang` process and interact
with it, while the second one uses
[FlokQuark](https://github.com/munshkr/FlokQuark) to communicate with SC.  Read
[more](https://github.com/munshkr/FlokQuark/blob/master/README.md) for
installing and using it.


##### `sclang` vs. `remote_sclang`

* As of today `sclang` does not currently work on Windows, you will have to use
`remote_sclang`.

* `remote_sclang` needs SC IDE to be running, and you need FlokQuark installed
  and running there.

* If you use `remote_sclang`, you won't see Post messages from Flok, because
  FlokQuark does not currently capture Post messages and errors.  It is
  recommended to deattach the Post window and have it visible while using Flok.

* `sclang` can't use any GUI object (like Scopes, Proxy mixers, etc.). You will
  need to use `remote_sclang` + SC IDE for this.


#### Hydra

Hydra is already included in the web App. You don't need to install anything as
it runs on the browser.  Just use the `hydra` target to execute Hydra code.

If you want to use the screen capturing feature, you will need to install a
specific [Chrome
extension](https://github.com/munshkr/flok-hydra-chrome-extension) for Flok,
that gives permissions to capture the desktop screen from within the current
public servers.

Read
[more](https://github.com/munshkr/flok-hydra-chrome-extension/blob/master/README.md)
on how to install the extension.

#### Mercury

[Mercury](https://github.com/tmhglnd/mercury) is a minimal and human readable
language for livecoding of algorithmic electronic music. Below is a link to steps for
connecting Flok to either the Mercury Playground (browser based) or the Max8 version
of the livecoding environment:

[Follow the step-by-step guide here](https://tmhglnd.github.io/mercury/collaborate.html)

Bug reports are welcome in the issues. If the issue is more Mercury than Flok related please
report [here](https://github.com/tmhglnd/mercury/issues/new)

## Development

After unpacking or cloning, from the directory of the repository run:

```sh
yarn
```

This will install dependencies from all packages, and prepare (build) packages.

If you have Node 13+, you might have an error about an incompatible package
(`meyda`).  Try running `yarn --ignore-engines` to skip that check.  You can
also config yarn to ignore this automatically from now on, by running `yarn
config set ignore-engines true`.

`web`, `repl` and `core` packages are stored on the `packages/` directory, and
there is a root packaged managed by [Lerna](https://github.com/lerna/lerna).

Lerna allows us to manage interdependant packages easily. In the case of Flok,
the `core` package is used both by `web` and `repl`, and even though they have
`flok-core` dependency on their `package.json`, Lerna creates symbolic links to
the local `core` package automatically.  It also makes it easy to publish new
versions by bumping them together.

To bump a new version on all packages and release them together, run `yarn
release`.


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
