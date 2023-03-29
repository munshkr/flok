# Flok

Web-based P2P collaborative editor for live coding music and graphics

**NOTE: This branch is for the next major version of Flok v1.0, which is meant
to be a full rewrite/refactor. Work in progress**

## Packages

### App packages

* [`@flok/web`](packages/web): Web server for Flok
* [`@flok/repl`](packages/repl): REPL client for Flok
* [`@flok/server`](packages/server): Flok server, handles WebSocket connections
  and WebRTC signaling

### Lib packages

* [`@flok/pubsub`](packages/pubsub): Pub/Sub client-server, used for remote code
  execution and message passing on Flok
* [`@flok/session`](packages/session): Flok session package
* [`@flok/server-middleware`](packages/server-middleware): Connect/Express
  middleware for Flok, handles WebSocket connections and WebRTC signaling
* [`@flok/cm-eval`](packages/cm-eval): CodeMirror 6 extension for code evaluation

### Examples

* [`example-vanilla-js`](packages/example-vanilla-js): Example of a Flok-based
  collaborative editor written in pure JS and Vite

## Design constraints

* Include a simplified vanilla JS example
* Use [CodeMirror 6](https://codemirror.net/)
    * Best code editor library for the Web
    * Latest version (v6) comes with better extensibility and accesability
* Use [Yjs](https://yjs.dev/) for collaborative editor
    * Battle-tested and updated
    * Now supports CodeMirror 6: [y-codemirror.next](https://github.com/yjs/y-codemirror.next)
* More modular and extensible, similar to CodeMirror extensions, e.g.:
    * Line/block-based evaluation: `@flok/cm-eval`
    * TidalCycles pattern and RMS decorators: `@flok/cm-tidalcycles-decorators`
    * TidalCycles autocompletion: `@flok/cm-tidalcycles-autocompletion`
    * Hydra synth autocompletion: `@flok/cm-hydra-autocompletion`
* Better UI for customizing editor and session configuration
    * Menu, toast, dialogs
* *nice to have* Import external JS libraries dynamically, instead of bundling
  them with Flok
    * Similar to JS playgrounds, like [codesandbox.io](https://codesandbox.io/)
    * User can have their own set of libraries to be loaded automatically or
      easily on new sketches
    * Connect to local filesystem for files and libraries

## Development

Install all dependencies and build all subpackages with:

```
npm install
```

Then, to run web server:

```
cd packages/web
npm run dev
```

To build and run production build:

```
npm run build
npm start
```


## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok). This project is intended to be a safe,
welcoming space for collaboration, and contributors are expected to adhere to
the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

This project is licensed under GPL 3+. Refer to [LICENSE.txt](LICENSE.txt)
