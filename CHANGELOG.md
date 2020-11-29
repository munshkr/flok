# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

* web: Upgrade to Hydra 1.3.4

### Added

* web: New shortcut for evaluating web-target (e.g. Hydra) code only on local
  client (Ctrl-Alt-Enter for block execution, Shift-Alt-Enter for line
  execution).

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
