# flok-web

Web server for Flok.

See [flok](https://github.com/munshkr/flok) for more.

*Work in progress*


## Install

```
npm install -g flok-web
```


## Usage

To start a local server/hub, just run on your terminal:

```
flok-web
```

Run `flok-web --help` to see all available options.


## Development

This project uses [Yarn](https://yarnpkg.com). If you don't have it installed,
read [this page](https://yarnpkg.com/lang/en/docs/install/) and follow the
instructions.

After unpacking or cloning this repository, *cd* into it and run `yarn` to
install all dependencies.

Run `yarn dev` to start a development server. It automatically reloads the page
on any browser if it detects any changes.

With `yarn test` you can run tests.

To run in production mode, you will have to build the app first:

```
yarn build
yarn start
```


## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/munshkr/flok). This project is intended to be a
safe, welcoming space for collaboration, and contributors are expected to
adhere to the [Contributor Covenant](http://contributor-covenant.org) code of
conduct.


## License

This project is licensed under GPL 3+.
