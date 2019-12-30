/* eslint-disable strict */
/* eslint-disable import/no-extraneous-dependencies */

"use strict";

import { app, ipcMain, BrowserWindow } from "electron";
import shellPath from "shell-path";
import * as path from "path";
import { format as formatUrl } from "url";
import { createREPLFor } from "flok/lib/repl";

if (process.platform === "darwin") {
  process.env.PATH =
    shellPath.sync() ||
    [
      "./node_modules/.bin",
      "/.nodebrew/current/bin",
      "/usr/local/bin",
      process.env.PATH
    ].join(":");
}

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    title: "flok REPL",
    width: 800,
    height: 600,
    frame: true,
    resizable: true
  });

  window.setMenuBarVisibility(false);

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    const url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`;
    window.loadURL(url);
  } else {
    const url = formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    });
    window.loadURL(url);
  }

  window.on("closed", () => {
    mainWindow = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
  mainWindow = createMainWindow();
});

ipcMain.on("start-repl", (event, msg) => {
  console.log(`Start REPL: ${JSON.stringify(msg)}`);

  const { hub, repl, target } = msg;
  const replClient = createREPLFor(repl, { target, hub });
  replClient.start();

  replClient.emitter.on("data", data => {
    event.reply("data", { target, ...data });
  });
});
