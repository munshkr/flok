// FIXME more colors?
const COLORS = ["#ff0000", "#00ff00", "#0000ff"];

class ShareDBCodeMirror {
  /**
   * @constructor
   * @param {CodeMirror} codeMirror - a CodeMirror editor instance
   * @param {Object} options - configuration options:
   *    - key: string; required. The key in the ShareDB doc at which to store the
   *      CodeMirror value. Deeply nested paths are currently not supported.
   *    - errorHandler: optional. A handler to which a single error message is
   *      provided. The default behavior is to print error messages to the console.
   *    - verbose: optional. If true, log messages will be printed to the console.
   * @return {ShareDBCodeMirror} the created ShareDBCodeMirror object
   */
  constructor(codeMirror, options) {
    this.codeMirror = codeMirror;
    this.key = options.key;
    this.user = options.user || {};
    this.errorHandler =
      options.errorHandler ||
      (error => {
        console.error(error);
      });
    const verbose = Boolean(options.verbose);
    this.log = (...args) => {
      if (verbose) {
        console.debug(...args);
      }
    };

    this.users = {};
    this.bookmarks = {};

    this.suppressChange = false;
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

  setBookmarks() {
    Object.keys(this.users).forEach(userId => {
      this.setBookmarkForUser(userId);
    });
  }

  setBookmarkForUser(userId) {
    const marker = this.bookmarks[userId];
    if (marker) {
      marker.clear();
    }

    const { codeMirror } = this;

    const userData = this.users[userId];
    const cursorPos = { line: userData.l, ch: userData.c };

    // Generate DOM node (marker / design you want to display)
    const cursorCoords = codeMirror.cursorCoords(cursorPos);
    const cursorElement = document.createElement("span");
    cursorElement.style.borderLeftStyle = "solid";
    cursorElement.style.borderLeftWidth = "2px";
    const color =
      COLORS[Object.keys(this.users).indexOf(userId) % COLORS.length];
    console.log(`${userId}: ${color}`);
    cursorElement.style.borderLeftColor = color;
    cursorElement.style.height = `${cursorCoords.bottom - cursorCoords.top}px`;
    cursorElement.style.padding = 0;
    cursorElement.style.zIndex = 0;

    // Set the generated DOM node at the position of the cursor sent from another client
    // setBookmark first argument: The position of the cursor sent from another client
    // Second argument widget: Generated DOM node
    this.bookmarks[userId] = codeMirror.setBookmark(cursorPos, {
      widget: cursorElement
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
    this.detachDoc();
    doc.subscribe(error => {
      if (error) {
        if (!callback) {
          console.error(error);
        }
      } else {
        this.doc = doc;
        this.log("ShareDBCodeMirror: subscribed to doc", doc);
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
      this.log("ShareDBCodeMirror: creating emtpy doc");

      const data = {};

      // Empty document
      data[this.key] = "";

      // Add current user
      this.users = {};
      this.users[this.user.id] = { l: 0, c: 0, n: this.user.name };
      this.log(`Current users: ${JSON.stringify(this.users)}`);

      data.users = this.users;

      doc.create(data, error => {
        if (error) {
          this.errorHandler(error);
        }
      });
    } else {
      this.log("ShareDBCodeMirror: document already exists; add user");

      // Update current users map from document
      this.users = doc.data.users;
      this.log(`Current users: ${JSON.stringify(this.users)}`);

      this.setBookmarks();

      // Add current user
      this.sendOP([
        { p: ["users", this.user.id], oi: { l: 0, c: 0, n: this.user.name } }
      ]);
    }

    if (!doc.cm || doc.cm.version !== doc.version) {
      const cmDoc = new codeMirror.constructor.Doc(doc.data[this.key]);
      doc.cm = { doc: cmDoc };
    }
    codeMirror.swapDoc(doc.cm.doc);
    codeMirror.on("beforeChange", this.codeMirrorBeforeChange);
    codeMirror.on("changes", this.codeMirrorChanges);
    codeMirror.on("cursorActivity", this.codeMirrorCursorActivity);
    doc.on("op", this.shareDBOp);
    doc.on("del", this.shareDBDel);
    doc.on("error", this.shareDBError);

    // Set extra keys for code evaluation
    codeMirror.setOption("extraKeys", {
      "Shift-Enter": this.evaluateLine,
      "Ctrl-Enter": this.evaluateParagraph,
      "Cmd-Enter": this.evaluateParagraph
    });
  }

  /**
   * Stops listening for changes from the CodeMirror instance and the ShareDB document.
   */
  detachDoc() {
    const { doc } = this;
    if (!doc) {
      return;
    }
    doc.cm.version = doc.version;
    const { codeMirror } = this;
    codeMirror.off("beforeChange", this.codeMirrorBeforeChange);
    codeMirror.off("changes", this.codeMirrorChanges);
    doc.removeListener("op", this.shareDBOp);
    doc.removeListener("del", this.shareDBDel);
    doc.removeListener("error", this.shareDBError);
    delete this.doc;
    this.log("ShareDBCodeMirror: unsubscribed from doc");
  }

  /**
   * Asserts that the CodeMirror instance's value matches the document's content
   * in order to ensure that the two copies haven't diverged.
   */
  assertValue() {
    const expectedValue = this.doc.data[this.key];
    const editorValue = this.codeMirror.getValue();
    if (expectedValue !== editorValue) {
      console.error(
        "ShareDBCodeMirror: value in CodeMirror does not match expected value:",
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

    this.log("ShareDBCodeMirror: applying ops", ops);
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
        this.log(`Current users: ${JSON.stringify(this.users)}`);
        this.setBookmarkForUser(userId);
      }
    }

    this.suppressChange = false;

    this.assertValue();
  }

  onDocDelete(_data, _source) {
    this.detachDoc();
    this.codeMirror.setValue("Document deleted");
  }

  onDocError(error) {
    this.errorHandler(error);
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

    const op = [{ p: [this.key], t: "text0", o: this.ops }];
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
        p: ["users", this.user.id],
        od: this.users[this.user.id],
        oi: { l: line, c: ch, n: this.user.name }
      }
    ]);
  }

  evaluateLine = () => {
    const { codeMirror } = this;

    const currentLine = codeMirror.getCursor().line;
    const lines = codeMirror.getValue().split("\n");
    const code = lines[currentLine].trim();

    console.log(`Evaluate: ${JSON.stringify(code)}`);
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
      console.log([begin + 1, end + 1]);
      console.log(`Evaluate: ${JSON.stringify(code)}`);

      // Send evaluate OP

      let marker = codeMirror.markText(
        { line: begin, ch: 0 },
        { line: end, ch: 100 },
        { className: "flash-selection" }
      );
      setTimeout(() => {
        marker.clear();
      }, 150);
    }
  };

  sendOP(op) {
    this.log("ShareDBCodeMirror: submitting op", op);
    this.doc.submitOp(op, error => {
      if (error) {
        this.errorHandler(error);
      }
    });
  }
}

module.exports = ShareDBCodeMirror;
