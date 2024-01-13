# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.12] - 2024-01-06

### Added

* web: Toggle comment with Ctrl-/ or Cmd-/
* web(sardine): Free all sound for Sardine

### Changed

* repl(sardine): Changed interpreter name (fishery -> sardine)
* web: Bugfixes related to the server script (flok-web)
* web: Fixed @types/react wrong version

## [0.4.8] - 2022-05-26

### Added

* web: Add key binding Ctrl+Shift+H to hide or show editors

### Changed

* web: Replace yjsdemo WebSocket Yjs server for an embedded WS server
* web: Use a random english name + first 8 chars of uuid as default session name
* web: Upgrade p5 to version 1.4.1
* web: Upgrade hydra-synth to version 1.3.16
* web: Upgrade Next to version 12
* web: Restore package bundle

## [0.4.6] - 2021-10-31

### Added

* web: Print possible network IPs when starting web server locally
* web: New --static-dir option for setting a custom static files directory when
  starting web server.

### Changed

* web: Upgrade hydra-synth to 1.3.8
* web: Upgrade next to 11
* repl: Remove "tidal> " from stdout on tidal target; other minor improvements

## [0.4.5] - 2021-01-05

### Added

* web: Read-only mode by adding a `readonly=1` query parameter to a session URL
* repl: In `foxdot` REPL, call `load_startup_file()` after loading Foxdot package.

### Changed

* web: Upgrade hydra-synth to 1.3.6

## [0.4.4] - 2020-12-23

### Added

* web: Follow remote cursors when moving (jump to line), but only if editor is
  blurred.
* web: Make remote caret visible to current user too.
* web: Properly support block evaluation with parens for
  `sclang`/`remote_sclang` targets.

### Changed

* web: Skip 'hydra' as a flok-repl example when joining a session
* repl: Bugfix when using custom REPL command
* repl: On sclang targets, add semicolons after closing parens

## [0.4.3] - 2020-12-04

### Added

* repl, web: Support for Mercury
* web: When joining session, show flok-repl example based on first target in
  layout.
* web: New shortcut for evaluating web-target (e.g. Hydra) code only on local
  client (Ctrl-Alt-Enter for block execution, Shift-Alt-Enter for line
  execution).

### Changed

* web: Upgrade to Hydra 1.3.4

## [0.4.2] - 2020-11-12

### Changed

* web: Better styles for selected text and remote caret
* repl: Fix path to embedded BootTidal.hs when using fallback

## [0.4.1] - 2020-10-11

### Added

* web: Copy button for copying flok-repl example when joining session
* repl: Add package metadata and data dir, which includes a Tidal bootScript
  file.

### Changed

* web: Disable form when creating session, while session page loads
* repl: If ghc-pkg fails to get tidal data dir, fallback to embedded bootScript
  file.

## [0.4.0] - 2020-10-06

### Added

* repl: Add `--nickname/-N` to send REPL messages (out/err) to named user instead
  of all connected users.
* repl: Add `--notify-to-all` to force send messages to all users (old behaviour).
* repl: Add extra option `ghci` for `tidal` REPL type, for customizing ghci
  binary path.
* web: Show current Flok version when joining session.
* web: Include -N option on flok-repl example when joining session.

### Changed

* Now, by default, `flok-repl` *will not* send messages to all users by default.
  You need to enable the `--notify-to-all` option if you want the old
  behaviour. If `--nickname/-N` and `--notify-to-all` are not present,
  flok-repl won't send any messages, only print them on standard output/error.

## [0.3.17] - 2020-10-06

### Added

* repl: Add new `--config` option for customizing parameters from a JSON file
* repl: Load config file from `FLOK_CONFIG` environment file, if defined. Also,
  load *.env files* automatically.

### Changed

* web: Bugfix: host prop was undefined on first page load, failing to connect
  afterwards.
