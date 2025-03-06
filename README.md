# Flok

Web-based P2P collaborative editor for live coding music and graphics

## Features

- Similar to Etherpad, but focused on code evaluation for livecoding.
- Multiple separate slots for different languages and tools.
- REPL plugins: allows user to locally evaluate code from interpreters (like
  Haskell, Ruby, Python, etc.):
  - [TidalCycles](https://tidalcycles.org/)
  - [SuperCollider](https://supercollider.github.io/) (sclang)
  - [FoxDot](https://foxdot.org/)
  - [Renardo](https://renardo.org/)
  - [Mercury](#mercury)
  - [Sardine](https://sardine.raphaelforment.fr)
  - [SonicPi](https://sonic-pi.net/) (_not implemented yet_, see [#29](https://github.com/munshkr/flok/issues/29))
  - ... any interpreter with a REPL (Python, Ruby, etc.)
- Web Plugins, for languages embedded in editor:
  - [Hydra](https://github.com/ojack/hydra)
  - [p5.js](https://p5js.org/)
  - [Strudel](https://strudel.cc/)
  - [Mercury Web](https://www.timohoogland.com/mercury-livecoding/)
  - [VEDA.js](https://github.com/fand/vedajs) (_not implemented yet_, see [#82](https://github.com/munshkr/flok/pull/82))

## Usage

### Keybindings

*Some keybindings may differ depending on the language/target you choose, and the operating system*

| Keybinding                 | Function                             |
| -------------------------- | ------------------------------------ |
| `alt/option` `enter`       | Evaluate all                         |
| `ctrl/cmd` `enter`         | Evaluate block, Evaluate selection   |
| `shift` `enter`            | Evaluate line                        |
| `ctrl/cmd/option/alt` `.`  | Silence (output depends on language) |
| `cmd/ctrl` `shift/alt` `h` | Show/Hide editor panels              |
| `cmd/ctrl` `x`             | Cut selected text                    |
| `cmd/ctrl` `c`             | Copy selected text                   |
| `cmd/ctrl` `v`             | Paste cut/copied text                |
| `cmd/ctrl` `z/u`           | Undo edit                            |
| `cmd/ctrl` `shift` `z/u`   | Redo edit                            |
| `cmd/ctrl` `}`             | add indentation                      |
| `cmd/ctrl` `{`             | remove indentation                   |
| `cmd/ctrl` `f`             | search and replace                   |

*On Mac:*

| `ctrl` `e` | jump to end of the line |
| `ctrl` `a` | jump to the beginning of the line |
| `ctrl` `t` | move character one step right |
| `ctrl` `y` | delete selected text |
| `ctrl` `o` | insert linebreak |
| `ctrl` `d` | delete character on the right of cursor |
| `ctrl` `h` | backspace character on the left of cursor |
| `ctrl` `l` | select whole line after cursor |
| `ctrl` `v` | jump to bottom end |
| `ctrl` `b` | move cursor to the left |
| `ctrl` `n` | move cursor down |

### Public server

**WARNING - Please Read**: Using a public server can be dangerous as _anyone_
can execute code on your computer via Flok, so _please_ make sure you only
share your session URL to trusted users and friends when you use a public
server. I will not be held responsible for any damaged caused by Flok. You
have been warned.

This is a list of known public servers:

- [flok.cc](https://flok.cc)

#### Create a session

When you enter a Flok server, you will be shown an empty session with a single
slot, with a _target_ selected (usually `hydra`). You can either change the
target by clicking on the target selector at the top-left corner of the slot, or
add more slots by clicking on the _Command button_ (at the top-right corner of the
screen), and then clicking on _Add Pane_, or _Configure_.

A _target_ is the language or tool that Flok will communicate to create sound or
images within the web page, or through `flok-repl`.

If you clicked on _Configure_, enter the name of the targets, separated with
commas. You can use a target multiple times and Flok will create that many
number of slots to write code. Currently the maximum number of slots is 8.

Examples:

- `tidal, foxdot, hydra`: 3 slots, with tidal, foxdot and hydra respectively.
- `sclang, sclang, sclang, hydra, hydra`: 5 slots total, the first 3 with
  `sclang` and the last 2 with `hydra`.
- `mercury, hydra`: 2 slots total, one with Mercury and one with Hydra.

You will also be asked to enter a nickname. This is the name that will be shown
to other users under your cursor, when you write code. You can change it any
time by clicking on the _Change Username_ inside the _Command_ menu.

Now, just copy the URL and share it with your friends! They will be able to
join the session and write code with you :-)

If you are using any target that requires a REPL, you will need to start it
separately. See the _Connect REPLs to Flok_ section below.

#### Connect REPLs to Flok

The last step is to start `flok-repl`, to connect Flok with your REPLs.

Just click on the _REPLs_ button at the top-right corner of the screen, and
copy the command shown there. It will look something like this:

```sh
npx flok-repl@latest -H wss://next.flok.cc \
  -s mammoth-tan-roundworm-17a5d501 \
  -t tidal \
  -T user:munshkr
```

This command will automatically try to download and install `flok-repl` and
start it, connecting it to your session. If you have multiple different targets
with REPLs, the command will start one process for each target from the same
command.

### Local server

In case you want to use Flok without Internet connection and/or you don't want
to play Flok on a public server, you can easily start a local Flok server.

To start the server, simply run:

```sh
npx flok-web@latest
```

You can also install both `web` and `repl` packages beforehand (e.g. if you
already know you won't have internet access on the venue) with:

```sh
npm install -g flok-web@latest flok-repl@latest
```

This will download and install the latest Flok web version and start a server.

Your local server will be available on
[http://localhost:3000](http://localhost:3000) from your computer. To share the
URL with your friends, change `localhost` with your local LAN IP. `flok-web`
will try to guess your local IP in your LAN, and show it on the console, but it
might not always work.

#### Secure mode (https)

In some cases, it's needed to run Flok in secure mode, using https. This is
needed for some browsers, like Chrome, to allow access to the microphone and
camera (which might be needed for some targets, like Hydra). You can easily
run Flok in secure mode by passing the `--secure` parameter:

```sh
npx flok-web@latest --secure
```

#### Note about remote users (not LAN)

Sharing your local server to other users in the Internet is a bit more
complicated, and it depends on your router and network configuration. You will
need to configure your router to forward the port 3000 to your computer, and
then share your public IP with your friends. You can find your public IP by
visiting [https://whatismyipaddress.com/](https://whatismyipaddress.com/). Also
make sure to check your firewall settings, to allow incoming connections to
port 3000. It's possible that some of your remote friends won't be able to
connect to your local server, because of their own network configuration.

### Supported REPL targets

#### Dummy

The "dummy" target is a REPL target that forwards messages to an OSC server. It
does not have any syntax highlighting and can be used for any purpose you like.
This is useful if you want to use a language that is not yet supported in Flok,
and can receive OSC messages.

Use `flok-repl` with the `-t dummy` parameter. 

By default, it will send OSC messages to port 3001. Code evaluations are sent as
a string (including all line breaks, whitespaces, etc.) to the OSC address
`/flok`. If you use the `panic` shortcut key, you will receive the OSC message
`/flok silence`, which you can use to stop all your audio/visual processes.

#### TidalCycles

Use `flok-repl` with the `-t tidal` parameter.

You can specify custom options with the `--extra` parameter, by passing a JSON
object, like this:

`--extra '{ "bootScript": "/path/to/my/boot.hs", "useStack": true }'`

##### Extra options

- `bootScript`: Path to a custom initialization script.

- `useStack`: Uses `stack exec -- ghci` instead of plain `ghci`. Use this if
  you installed Tidal using Stack.

- `ghci`: Use a specific Ghci command instead of plain `ghci`.
  This overrides `useStack` option, if used too.

#### Sardine

Use `flok-repl` with the `-t sardine` parameter. In order to make it work,
the `sardine` REPL must be included to your PATH. It should already be the
case if you followed a regular install.

##### Extra options

- `python`: Path to your custom `sardine` Python REPL. Use this if you need
  to target a specific install of Sardine (Python version, different path, etc).

#### FoxDot

Use `flok-repl` with the `-t foxdot` parameter.

##### Extra options

- `python`: Path to Python binary. Use this if you need to use a custom Python
  version.

#### Renardo

[Renardo](https://renardo.org) is a new maintained fork of FoxDot with new features.

Use `flok-repl` with the `-t renardo` parameter.

##### Extra options

- `python`: Path to Python binary. Use this if you need to use a custom Python
  version.

#### SuperCollider

In the case of SuperCollider, there are two types of REPLs: `sclang` and
`remote_sclang`. The first one tries to run a `sclang` process and interact
with it, while the second one uses
[FlokQuark](https://github.com/munshkr/FlokQuark) to communicate with SC. Read
[more](https://github.com/munshkr/FlokQuark/blob/master/README.md) for
installing and using it.

##### `sclang` vs. `remote_sclang`

- As of today `sclang` does not currently work on Windows, you will have to use
  `remote_sclang`.

- `remote_sclang` needs SC IDE to be running, and you need FlokQuark installed
  and running there. Be sure to start your flok-repl with both `-t remote_sclang`
  and `-n sclang` flags.

- If you use `remote_sclang`, you won't see Post messages from Flok, because
  FlokQuark does not currently capture Post messages and errors. It is
  recommended to deattach the Post window and have it visible while using Flok.

- `sclang` can't use any GUI object (like Scopes, Proxy mixers, etc.). You will
  need to use `remote_sclang` + SC IDE for this.

#### Hydra

[Hydra](https://hydra.ojack.xyz/) is a video synth and coding environment, inspired in
analog video synthesis, that runs directly in the browser and is already included in
the web App. You don't need to install anything as it runs on the browser. Just use
the `hydra` target to execute Hydra code.

You can also use [p5.js](https://p5js.org/) within a `hydra` target, like you would in
the official Hydra editor.

##### `P()` function

The `P()` function allows you to use strudel mini-patterns in Hydra.
It uses the same timing information as Strudel itself, so it will be synchronized with the audio.

**Note**: It will only work, if strudel is already initialized, because that will load the modules we need.
**Note**: You can not use any strudel functions on the pattern.
**Note**: Currently we do not have mini-highlighting for Hydra panes.

##### `useStrudelCanvas(source)`

Will initialise the given source (`s0`, `s1`, etc) to use the strudel canvas as a source.
Will also hide the strudel canvas, so it will not overlap.

**Note**: Strudel will have to be initialized, otherwise this will not work.

##### `fft()` function

The `fft()` function is a special function that allows you to get the FFT data
from web targets.

**Note: Only Strudel is supported at the moment.**

**You can disable the FFT visualizer in the display settings. This might help with performance.**

```ts
fft(index: number,
    buckets: number = 8,
    options?: { min?: number; max?: number, scale?: number, analyzerId?: string }): number
```

Parameters:

- `index: number` : The index of the bucket to return the value from.
- `buckets: number`: The number of buckets to combine the underlying FFT data
  too. Defaults to 8.
- `options?: { min?: number; max?: number, scale?: number }`:
  - `min?: number`: Minimum clamp value of the underlying data. Defaults to
    -150.
  - `max?: number`: Maximum clamp value of the underlying data. Defaults to 0.
  - `scale?: number`: Scale of the output. Defaults to 1 (so the output is
    from 0 to 1)
  - `analyzerId?: string`: Which Strudel analyser to listen to. Defaults to
    `flok-master`, which is also automatically added to all strudel patterns.
    Can be used to route different patterns to different parts of the hydra
    visualiser

Example:

```js
solid(() => fft(0, 1), 0)
  .mask(shape(5, 0.05))
  .rotate(() => 50 * fft(0, 40)); // we need to supply a function
// for the parameter, for it to update automaticaly.
```

**Caveat**: Because of how we setup the analyze node on Strudel, every Strudel pane
needs a re-eval after the Hydra code decides that we need to get the fft data.
This does not happen automatically, manual re-eval is necessary.

#### Mercury

[Mercury](https://github.com/tmhglnd/mercury) is a minimal and human readable
language for livecoding of algorithmic electronic music. Below is a link to steps for
connecting Flok to either the Mercury Playground (browser based) or the Max8 version
of the livecoding environment:

[Follow the step-by-step guide here](https://tmhglnd.github.io/mercury/collaborate.html)

Bug reports are welcome in the issues. If the issue is more Mercury than Flok related please
report [here](https://github.com/tmhglnd/mercury/issues/new)

## Development

### Basic setup

Install all dependencies and build all subpackages with:

```sh
npm install
npm run build
```

Then, to run web server:

```sh
cd packages/web
npm run dev
```

To run production build:

```sh
npm start
```

To run the repl while developing go to:

```sh
cd packages/repl/
```

```sh
npm exec -- flok-repl -H ws://localhost:3000 -s <session> -t <target> -T user:<name>
```

### Packages overview

This repository is a monorepo, with multiple modular packages. Each package
has its own README with more information. Here is a brief overview of the
packages:

#### App packages

- [`flok-web`](packages/web): Web Server for Flok
- [`flok-repl`](packages/repl): REPL Client for Flok
- [`flok-server`](packages/server): Flok server, handles sessions and
  communication between clients.

#### Lib packages

- [`@flok-editor/pubsub`](packages/pubsub): Pub/Sub client-server, used for
  remote code execution and message passing on Flok
- [`@flok-editor/session`](packages/session): Flok session package
- [`@flok-editor/server-middleware`](packages/server-middleware): Server
  middleware for Flok, handles WebSocket connections and WebRTC signaling
- [`@flok-editor/cm-eval`](packages/cm-eval): CodeMirror 6 extension for code
  evaluation
- [`@flok-editor/lang-tidal`](packages/lang-tidal): TidalCycles language support
  for CodeMirror 6

#### Examples

- [`example-vanilla-js`](packages/example-vanilla-js): Example of a Flok-based
  collaborative editor written in pure JS and Vite

### Design constraints (v1.0)

- Include a simplified vanilla JS example
- Use [CodeMirror 6](https://codemirror.net/)
  - Best code editor library for the Web
  - Latest version (v6) comes with better extensibility and accesability
- Use [Yjs](https://yjs.dev/) for collaborative editor
  - Battle-tested and updated
  - Now supports CodeMirror 6:
    [y-codemirror.next](https://github.com/yjs/y-codemirror.next)
- More modular and extensible, similar to CodeMirror extensions, e.g.:
  - Line/block-based evaluation: `@flok-editor/cm-eval`
  - TidalCycles pattern and RMS decorators: `@flok-editor/cm-tidalcycles-decorators`
  - TidalCycles autocompletion: `@flok-editor/cm-tidalcycles-autocompletion`
  - Hydra synth autocompletion: `@flok-editor/cm-hydra-autocompletion`
- Better UI for customizing editor and session configuration
  - Menu, toast, dialogs
- _nice to have_ Import external JS libraries dynamically, instead of bundling
  them with Flok
  - Similar to JS playgrounds, like [codesandbox.io](https://codesandbox.io/)
  - User can have their own set of libraries to be loaded automatically or
    easily on new sketches
  - Connect to local filesystem for files and libraries

### Hash parameters

- `username` (string): Default user name. Eg: `#username=arbor`
- `targets` (list of strings): If session is empty, configure it with the
  specified targets by default. Eg: `#targets=hydra,strudel`
- `c0`, `c1`, ..., `c7` (string): Default code to load on each document/pane
  (if available). **Code must be encoded in Base64**. Eg:
  `#c0=bm9pc2UoKS5vdXQoKQ%253D%253D` (decodes to `noise().out()`).
- `code` (string): An alias of `c0` (see above)

### Query parameters

- `readOnly` (boolean): Disable editing. If true, it won't ask for a user name
  when loading.
- `bgOpacity` (number): Background opacity. Valid range: [0, 1]
- `noWebEval` (list of strings): Disable evaluation of the specified web
  targets. Useful for embedding Flok in a website, where the website already has
  its own evaluation mechanism. This still sends messages to parent window.
  Options: `*`, `[webTarget]`. Eg: `?noWebEval=hydra` disables only Hydra.
  `?noWebEval=*` disables all web targets.
- `hideErrors` (boolean): Do not show errors for web targets (hydra, strudel, etc)

### Window messages

Flok will post messages to the parent window on specific events. This is useful
for embedding Flok in a website, where the website can handle the evaluation of
the code.

#### Events

- `change`: When the session changes. This usually happens at the beginning,
  when the session is empty, and when the user changes the targets.

```json
{
  "event": "change",
  "documents": [
    {
      "id": "1",
      "target": "hydra",
      "content": "osc().out()"
    },
    {
      "id": "2",
      "target": "tidal",
      "content": "d1 $ s \"bd\""
    }
  ]
}
```

- `eval`: On evaluation. This happens when the user presses the "Run" button or
  when the user presses one of the shortcuts for evaluating (e.g. `Ctrl+Enter`)
  on the editor. Only the content of the document that was evaluated is sent.

```json
{
  "event": "eval",
  "id": "2",
  "content": "d1 silence",
  "user": "munshkr"
}
```

## Acknowledgments

- [Etherpad](https://github.com/ether/etherpad-lite)
- [Troop](https://github.com/Qirky/Troop)
- [TidalBridge](https://gitlab.com/colectivo-de-livecoders/tidal-bridge)

## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok). This project is intended to be a safe,
welcoming space for collaboration, and contributors are expected to adhere to
the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

This project is licensed under GPL 3+. Refer to [LICENSE.txt](LICENSE.txt).

Punctual is licensed under GPL 3+. Refer to 
[LICENSE](https://github.com/dktr0/Punctual/blob/main/LICENSE).

Favicon based on "Origami" by Andrejs Kirma, from [Noun
Project](https://thenounproject.com/browse/icons/term/origami/) (CC BY 3.0)
