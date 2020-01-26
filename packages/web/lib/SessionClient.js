import ReconnectingWebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";

// FIXME Replace callbacks for Promises

class SessionClient {
  /**
   * @constructor
   * @param {Object} options - configuration options:
   *    - userId: user/client unique id
   *    - webSocketsUrl: WebSocket url - a URL string of the WebSocket server
   *    - collectionName: optional. ShareDB collection (default: "flok")
   *    - onConnectionOpen: optional. Handler for WebSockets 'open' event
   *    - onConnectionClose: optional. Handler for WebSockets 'close' event
   *    - onConnectionError: optional. Handler for WebSockets 'error' event
   *    - onUsersChange: optional. A handler called whenever a new user connects
   *      or disconnects.
   *    - debug: optional. If true, log messages will be printed to the console.
   * @return {SessionClient} the created SessionClient object
   */
  constructor(ctx) {
    const {
      userId,
      webSocketsUrl,
      collectionName,
      debug,
      onConnectionOpen,
      onConnectionClose,
      onConnectionError,
      onUsersChange
    } = ctx;

    this.webSocketsUrl = webSocketsUrl;
    this.userId = userId;
    this.collectionName = collectionName || "flok";
    this.onConnectionOpen = onConnectionOpen || (() => {});
    this.onConnectionClose = onConnectionClose || (() => {});
    this.onConnectionError = onConnectionError || (() => {});
    this.onUsersChange = onUsersChange || (() => {});

    this.users = {};
    this.editors = {};

    const isDebug = Boolean(debug);
    this.log = (...args) => {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug(...args);
      }
    };
  }

  join(sessionId) {
    if (!this.connection) this._initConnection();

    this.release();
    this.doc = this.connection.get(this.collectionName, `session:${sessionId}`);

    this._attachDoc(err => {
      if (err) throw err;
    });
  }

  /**
   * Starts listening for changes from the CodeMirror editor instance and the
   * ShareDB document.
   *
   * For CodeMirror, it is necessary to register for both `beforeChange` and
   * `changes` events: the first one is the only one to report the positions in
   * the pre-change coordinate system, while the latter marks the end of the
   * batch of operations.
   */
  attachEditor(id, sharedEditor) {
    const { doc } = this;

    this.editors[id] = sharedEditor;

    sharedEditor.attach(this);
  }

  triggerUsersChange() {
    this.log("Current users:", this.users);
    this.onUsersChange(
      Object.keys(this.users).map(id => ({ id, name: this.users[id].n }))
    );
  }

  /**
   * Stops listening for changes from the CodeMirror instance and the ShareDB document.
   */
  release() {
    const { doc } = this;

    this.log("Releasing document");
    this.log(doc);
    if (!doc) return;

    if (doc.cm) doc.cm.version = doc.version;

    // Unsubscribe events from all attached SharedEditor instances
    const editors = Object.values(this.editors);
    for (let i = 0; i < editors.length; i += 1) {
      const sharedEditor = editors[i];
      sharedEditor.detach();
    }

    // Remove doc hooks
    doc.removeListener("op", this._handleRemoteChange);
    doc.removeListener("del", this._handleDocDelete);
    doc.removeListener("error");

    delete this.doc;

    this.log("Unsubscribed from document");
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

  _initConnection() {
    if (!this.socket) this._initSocket();
    this.connection = new ShareDB.Connection(this.socket);
  }

  _initSocket() {
    this.socket = new ReconnectingWebSocket(this.webSocketsUrl, [], {
      minReconnectionDelay: 0
    });

    this.socket.addEventListener("open", (...args) => {
      this.onConnectionOpen(...args);
    });

    this.socket.addEventListener("close", (...args) => {
      this.onConnectionClose(...args);
    });

    this.socket.addEventListener("error", (...args) => {
      this.onConnectionError(...args);
    });
  }

  /**
   * Attaches a ShareDB document to the CodeMirror instance.
   *
   * @param {function (Object)=} callback - optional. Will be called when everything
   *    is hooked up. The first argument will be the error that occurred, if any.
   */
  _attachDoc(callback) {
    const { doc } = this;

    this.log("Document:", doc);

    doc.subscribe(error => {
      if (error) {
        if (!callback) {
          console.error(error);
        }
      } else {
        this.log("Subscribed to document:", doc);
        this._start();
      }
      if (callback) {
        callback(error);
      }
    });
  }

  _start() {
    const { doc } = this;

    if (!doc.type) {
      this.log("Creating empty document");

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
          console.error(error);
        }
      });
    } else {
      this.log("Document already exists; add user");

      // Update current users map from document
      this.users = doc.data.users;

      // FIXME Check if users list *really* changed
      this.triggerUsersChange();

      this._updateEditorBookmarks();

      // Add current user
      this.sendOP([
        { p: ["users", this.userId], oi: { l: 0, c: 0, n: this.userName } }
      ]);
    }

    doc.on("op", this._handleRemoteChange);
    doc.on("del", this._handleDocDelete);
    doc.on("error", error => console.error(error));
  }

  evaluateCode({ body, fromLine, toLine, user }) {
    this.sendOP([
      { p: ["eval"], oi: { c: body, b: fromLine, e: toLine, u: user } }
    ]);
  }

  updateCursorActivity({ line, column }) {
    this.sendOP([
      {
        p: ["users", this.userId],
        od: this.users[this.userId],
        oi: { l: line, c: column, n: this.userName }
      }
    ]);
  }

  _updateEditorBookmarks() {
    const { editors, users } = this;

    // FIXME: Support multiple editors
    const someEditorId = Object.keys(editors)[0];
    const editor = editors[someEditorId];

    if (editor) {
      Object.keys(users).forEach(userId => {
        const userData = users[userId];
        const cursorPos = { line: userData.l, ch: userData.c };
        const userNum = Object.keys(users).indexOf(userId);
        editor.updateBookmarkForUser(userId, userNum, cursorPos);
      });
    }
  }

  /**
   * Applies the changes represented by the given array of OT operations. It
   * may be ignored if they are an echo of the most recently submitted local
   * operations.
   */
  _handleRemoteChange = (ops, source) => {
    if (source) {
      return;
    }

    this.log("Applying OPs:", ops);

    // FIXME: Support multiple editors
    const { editors } = this;
    const someEditorId = Object.keys(editors)[0];
    const sharedEditor = editors[someEditorId];

    sharedEditor.suppressChange = true;

    // eslint-disable-next-line no-restricted-syntax
    for (let part of ops) {
      if (part.t === "text0") {
        const op = part.o;
        const { editor } = sharedEditor;
        if (op.length === 2 && op[0].d && op[1].i && op[0].p === op[1].p) {
          // replace operation
          const from = editor.posFromIndex(op[0].p);
          const to = editor.posFromIndex(op[0].p + op[0].d.length);
          editor.replaceRange(op[1].i, from, to);
        } else {
          // eslint-disable-next-line no-restricted-syntax
          for (part of op) {
            const from = editor.posFromIndex(part.p);
            if (part.d) {
              // delete operation
              const to = editor.posFromIndex(part.p + part.d.length);
              editor.replaceRange("", from, to);
            } else if (part.i) {
              // insert operation
              editor.replaceRange(part.i, from);
            }
          }
        }
      } else if (part.p[0] === "users" && part.oi) {
        // insert or replace user data
        const userId = part.p[1];
        const userData = part.oi;
        this.users[userId] = userData;
        this.triggerUsersChange();

        const cursorPos = { line: userData.l, ch: userData.c };
        const userNum = Object.keys(this.users).indexOf(userId);
        sharedEditor.updateBookmarkForUser(userId, userNum, cursorPos);
      } else if (part.p[0] === "eval" && part.oi) {
        const { c, b, e, _u } = part.oi;
        this.log(`Remote evaluate: (${b}-${e}):`, c);
        // sharedEditor.onEvaluateRemoteCode(c, u);
        sharedEditor.flash(b, e);
      }
    }

    sharedEditor.suppressChange = false;
    sharedEditor.assertValue(this);
  };

  _handleDocDelete = (_data, _source) => {
    this.release();
  };

  sendOP(op) {
    this.log("Submitting OP:", op);
    this.doc.submitOp(op, error => {
      if (error) {
        console.error(error);
      }
    });
  }
}

export default SessionClient;
