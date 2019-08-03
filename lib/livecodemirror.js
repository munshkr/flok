import ReconnectingWebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";

// FIXME more colors?
const COLORS = ["#ff0000", "#00ff00", "#0000ff"];

class LiveCodeMirror {
  /**
   * @constructor
   * @param {CodeMirror} codeMirror - a CodeMirror editor instance
   * @param {String} WebSocket url - a URL string of the WebSocket server
   * @param {Object} options - configuration options:
   *    - userId: user id
   *    - verbose: optional. If true, log messages will be printed to the console.
   *    - onError: optional. A handler to which a single error message is
   *      provided. The default behavior is to print error messages to the console.
   *    - onConnectionOpen: optional. Handler for WebSockets 'open' event
   *    - onConnectionClose: optional. Handler for WebSockets 'close' event
   *    - onConnectionError: optional. Handler for WebSockets 'error' event
   *    - onUsersChange: optional. A handler called whenever a new user connects
   *      or disconnects.
   *    - onEvaluateCode: optional. A handler called whenever someone evaluates code
   * @return {LiveCodeMirror} the created LiveCodeMirror object
   */
  constructor(codeMirror, websocketsUrl, options) {
    this.codeMirror = codeMirror;
    this.websocketsUrl = websocketsUrl;

    this.onError =
      options.onError ||
      (error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    this.onConnectionOpen = options.onConnectionOpen || (() => {});
    this.onConnectionClose = options.onConnectionClose || (() => {});
    this.onConnectionError = options.onConnectionError || (() => {});
    this.onUsersChange = options.onUsersChange || (() => {});
    this.onEvaluateCode = options.onEvaluateCode || (() => {});

    this.extraKeys = options.extraKeys;

    const verbose = Boolean(options.verbose);
    this.log = (...args) => {
      if (verbose) {
        // eslint-disable-next-line no-console
        console.debug(...args);
      }
    };

    // FIXME Use a safer way to generate a unique user id than random numbers...
    this.userId =
      options.userId || Math.floor(Math.random() * Math.floor(99999));
    this.userName = `anonymous-${this.userId}`;

    this.users = {};

    this.bookmarks = {};
    this.suppressChange = false;

    // FIXME Are they needed?
    this.codeMirrorBeforeChange = (...args) => {
      this.beforeLocalChange(...args);
    };
    this.codeMirrorChanges = (...args) => {
      this.afterLocalChanges(...args);
    };
    this.codeMirrorCursorActivity = (...args) => {
      this.cursorActivity(...args);
    };
    this.shareDBOp = (...args) => {
      this.onRemoteChange(...args);
    };
    this.shareDBDel = (...args) => {
      this.onDocDelete(...args);
    };
    this.shareDBError = (...args) => {
      this.onDocError(...args);
    };
  }

  initSocket() {
    this.socket = new ReconnectingWebSocket(this.websocketsUrl);

    this.socket.addEventListener("open", (...args) => {
      // this.heartbeat();
      this.onConnectionOpen(...args);
    });

    this.socket.addEventListener("close", (...args) => {
      // clearTimeout(this.pingTimeout);
      this.onConnectionClose(...args);
    });

    this.socket.addEventListener("error", (...args) => {
      this.onConnectionError(...args);
    });
  }

  initConnection() {
    if (!this.socket) this.initSocket();
    this.connection = new ShareDB.Connection(this.socket);
  }

  attachDocument(collectionName, documentId) {
    if (!this.connection) this.initConnection();

    this.doc = this.connection.get(collectionName, documentId);
    this.attachDoc(this.doc, err => {
      if (err) throw err;
    });
  }

  setUsername(newName) {
    const oldName = this.userName;

    if (newName === oldName) return;

    this.userName = newName;
    if (this.doc) {
      this.sendOP([
        { p: ["users", this.userId, "n"], od: oldName, oi: newName }
      ]);
    }
  }

  updateBookmarks() {
    Object.keys(this.users).forEach(userId => {
      this.updateBookmarkForUser(userId);
    });
  }

  updateBookmarkForUser(userId) {
    const marker = this.bookmarks[userId];
    if (marker) {
      marker.clear();
    }

    const { codeMirror } = this;

    const userData = this.users[userId];
    const cursorPos = { line: userData.l, ch: userData.c };

    // Generate DOM node (marker / design you want to display)
    const cursorCoords = codeMirror.cursorCoords(cursorPos);
    const el = document.createElement("span");
    el.style.borderLeftStyle = "solid";
    el.style.borderLeftWidth = "2px";
    const color =
      COLORS[Object.keys(this.users).indexOf(userId) % COLORS.length];
    el.style.borderLeftColor = color;
    el.style.height = `${cursorCoords.bottom - cursorCoords.top}px`;
    el.style.padding = 0;
    el.style.zIndex = 0;

    // Set the generated DOM node at the position of the cursor sent from another client
    // setBookmark first argument: The position of the cursor sent from another client
    // Second argument widget: Generated DOM node
    this.bookmarks[userId] = codeMirror.setBookmark(cursorPos, {
      widget: el
    });
  }

  /**
   * Attaches a ShareDB document to the CodeMirror instance.
   *
   * @param {sharedb.Doc} doc
   * @param {function (Object)=} callback - optional. Will be called when everything
   *    is hooked up. The first argument will be the error that occurred, if any.
   */
  attachDoc(doc, callback) {
    this.detachDocument();
    doc.subscribe(error => {
      if (error) {
        if (!callback) {
          this.onError(error);
        }
      } else {
        this.doc = doc;
        this.log("LiveCodeMirror: subscribed to doc", doc);
        this.start();
      }
      if (callback) {
        callback(error);
      }
    });
  }

  /**
   * Starts listening for changes from the CodeMirror instance and the ShareDB
   * document. For CodeMirror, it is necessary to register for both
   * `beforeChange` and `changes` events: the first one is the only one to
   * report the positions in the pre-change coordinate system, while the latter
   * marks the end of the batch of operations.
   */
  start() {
    const { doc, codeMirror } = this;

    if (!doc.type) {
      this.log("LiveCodeMirror: creating empty doc");

      const data = {};

      // Empty document
      data.content = "";

      // Add current user
      this.users = {};
      this.users[this.userId] = { l: 0, c: 0, n: this.userName };
      this.triggerUsersChange();

      data.users = this.users;

      doc.create(data, error => {
        if (error) {
          this.onError(error);
        }
      });
    } else {
      this.log("LiveCodeMirror: document already exists; add user");

      // Update current users map from document
      this.users = doc.data.users;
      // FIXME Check if users list *really* changed
      this.triggerUsersChange();

      this.updateBookmarks();

      // Add current user
      this.sendOP([
        { p: ["users", this.userId], oi: { l: 0, c: 0, n: this.userName } }
      ]);
    }

    codeMirror.setValue(doc.data.content);

    codeMirror.on("beforeChange", this.codeMirrorBeforeChange);
    codeMirror.on("changes", this.codeMirrorChanges);
    codeMirror.on("cursorActivity", this.codeMirrorCursorActivity);

    doc.on("op", this.shareDBOp);
    doc.on("del", this.shareDBDel);
    doc.on("error", this.shareDBError);

    this.setExtraKeys();
  }

  /**
   * Stops listening for changes from the CodeMirror instance and the ShareDB document.
   */
  detachDocument() {
    const { doc } = this;
    this.log("detaching");
    this.log(doc);
    if (!doc) {
      return;
    }
    if (doc.cm) doc.cm.version = doc.version;
    const { codeMirror } = this;
    codeMirror.off("beforeChange", this.codeMirrorBeforeChange);
    codeMirror.off("changes", this.codeMirrorChanges);
    doc.removeListener("op", this.shareDBOp);
    doc.removeListener("del", this.shareDBDel);
    doc.removeListener("error", this.shareDBError);
    delete this.doc;
    this.log("LiveCodeMirror: unsubscribed from doc");
  }

  /**
   * Asserts that the CodeMirror instance's value matches the document's content
   * in order to ensure that the two copies haven't diverged.
   */
  assertValue() {
    const expectedValue = this.doc.data.content;
    const editorValue = this.codeMirror.getValue();
    if (expectedValue !== editorValue) {
      this.onError(
        "LiveCodeMirror: value in CodeMirror does not match expected value:",
        "\n\nExpected value:\n",
        expectedValue,
        "\n\nEditor value:\n",
        editorValue
      );

      this.suppressChange = true;
      this.codeMirror.setValue(expectedValue);
      this.suppressChange = false;
    }
  }

  /**
   * Applies the changes represented by the given array of OT operations. It
   * may be ignored if they are an echo of the most recently submitted local
   * operations.
   */
  onRemoteChange(ops, source) {
    if (source) {
      return;
    }

    // this.heartbeat();

    this.log("LiveCodeMirror: applying ops", ops);
    this.suppressChange = true;

    // eslint-disable-next-line no-restricted-syntax
    for (let part of ops) {
      if (part.t === "text0") {
        const op = part.o;
        const { codeMirror } = this;
        if (op.length === 2 && op[0].d && op[1].i && op[0].p === op[1].p) {
          // replace operation
          const from = codeMirror.posFromIndex(op[0].p);
          const to = codeMirror.posFromIndex(op[0].p + op[0].d.length);
          codeMirror.replaceRange(op[1].i, from, to);
        } else {
          // eslint-disable-next-line no-restricted-syntax
          for (part of op) {
            const from = codeMirror.posFromIndex(part.p);
            if (part.d) {
              // delete operation
              const to = codeMirror.posFromIndex(part.p + part.d.length);
              codeMirror.replaceRange("", from, to);
            } else if (part.i) {
              // insert operation
              codeMirror.replaceRange(part.i, from);
            }
          }
        }
      } else if (part.p[0] === "users" && part.oi) {
        // insert or replace user data
        const userId = part.p[1];
        const userData = part.oi;
        this.users[userId] = userData;
        this.triggerUsersChange();
        this.updateBookmarkForUser(userId);
      } else if (part.p[0] === "eval" && part.oi) {
        const { c, b, e } = part.oi;
        this.log(`Remote evaluate (${b}-${e}): ${JSON.stringify(c)}`);
        this.triggerEvaluateCode(c);
        this.flash(b, e);
      }
    }

    this.suppressChange = false;

    this.assertValue();
  }

  onDocDelete(_data, _source) {
    this.detachDocument();
    this.codeMirror.setValue("Document deleted");
  }

  onDocError(error) {
    this.onError(error);
  }

  /**
   * Callback for the CodeMirror `beforeChange` event. It may be ignored if it
   * is an echo of the most recently applied remote operations, otherwise it
   * collects all the operations which are later sent to the server.
   */
  beforeLocalChange(codeMirror, change) {
    if (this.suppressChange) {
      return;
    }

    if (!this.ops) {
      this.ops = [];
    }
    const index = this.codeMirror.indexFromPos(change.from);
    if (change.from !== change.to) {
      // delete operation
      const deleted = codeMirror.getRange(change.from, change.to);
      this.ops.push({ p: index, d: deleted });
    }
    if (change.text[0] !== "" || change.text.length > 0) {
      // insert operation
      const inserted = change.text.join("\n");
      this.ops.push({ p: index, i: inserted });
    }
  }

  /**
   * Callback for the CodeMirror `changes` event. It may be ignored if it is
   * an echo of the most recently applied remote operations, otherwise it
   * sends the previously collected operations to the server.
   */
  afterLocalChanges(_codeMirror, _changes) {
    if (this.suppressChange) {
      return;
    }

    const op = [{ p: ["content"], t: "text0", o: this.ops }];
    delete this.ops;
    this.sendOP(op);

    // Force update cursor activity
    this.cursorActivity();

    this.assertValue();
  }

  cursorActivity(_codeMirror) {
    const { line, ch } = this.codeMirror.getDoc().getCursor();
    this.log("cursorActivity:", line, ch);

    this.sendOP([
      {
        p: ["users", this.userId],
        od: this.users[this.userId],
        oi: { l: line, c: ch, n: this.userName }
      }
    ]);
  }

  evaluateLine = () => {
    const { codeMirror } = this;

    const currentLine = codeMirror.getCursor().line;
    const lines = codeMirror.getValue().split("\n");
    const code = lines[currentLine].trim();

    if (code !== "") {
      this.evaluate(code, currentLine, currentLine);
    }
  };

  evaluateParagraph = () => {
    const { codeMirror } = this;
    const currentLine = codeMirror.getCursor().line;
    const lines = codeMirror.getValue().split("\n");

    let code = "";
    let start = false;
    let stop = false;
    let begin = null;
    let end = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      const lineLength = line.length;
      if (!start) {
        if (!lineLength) {
          code = "";
          begin = i + 1;
          end = begin;
        }
        if (i === currentLine) start = true;
      }
      if (!stop) {
        if (start && !lineLength) {
          stop = true;
          end = i - 1;
        } else if (lineLength) {
          code += `${line}\n`;
        }
      }
    }

    if (code !== "") {
      this.evaluate(code, begin, end);
    }
  };

  evaluate(code, fromLine, toLine) {
    this.log([fromLine, toLine]);
    this.log(`Evaluate (${fromLine}-${toLine}): ${JSON.stringify(code)}`);
    this.triggerEvaluateCode(code);
    this.sendOP([{ p: ["eval"], oi: { c: code, b: fromLine, e: toLine } }]);
    this.flash(fromLine, toLine);
  }

  flash(fromLine, toLine) {
    const { codeMirror } = this;

    // Mark text with .flash-selection class
    const marker = codeMirror.markText(
      { line: fromLine, ch: 0 },
      { line: toLine + 1, ch: 0 },
      { className: "flash-selection" }
    );

    // Clear marker after timeout
    setTimeout(() => {
      marker.clear();
    }, 150);
  }

  sendOP(op) {
    this.log("LiveCodeMirror: submitting op", op);
    this.doc.submitOp(op, error => {
      if (error) {
        this.onError(error);
      }
    });
  }

  triggerUsersChange() {
    this.log(`Current users: ${JSON.stringify(this.users)}`);
    if (this.onUsersChange) {
      this.onUsersChange(
        Object.keys(this.users).map(id => ({ id, name: this.users[id].n }))
      );
    }
  }

  triggerEvaluateCode(code) {
    if (this.onEvaluateCode) {
      this.onEvaluateCode(code);
    }
  }

  heartbeat() {
    clearTimeout(this.pingTimeout);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.pingTimeout = setTimeout(() => {
      this.socket.terminate();
    }, 30000 + 1000);
  }

  setExtraKeys() {
    // Set extra keys for code evaluation
    this.codeMirror.setOption("extraKeys", {
      ...this.extraKeys,
      "Shift-Enter": this.evaluateLine,
      "Ctrl-Enter": this.evaluateParagraph,
      "Cmd-Enter": this.evaluateParagraph
    });
  }
}

module.exports = LiveCodeMirror;
