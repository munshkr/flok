import ReconnectingWebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";
import SharedCodeMirror from "./SharedCodeMirror";

// FIXME Replace callbacks for Promises

type UserPosData = {
  l: number; // line
  c: number; // col
};

type UserData = {
  es: { [editorId: string]: UserPosData }; // editors
  n: string; // username
};

type DocumentData = {
  contents: { [editorId: string]: string };
  users: { [userId: string]: UserData };
};

type SessionClientContext = {
  userId: string;
  webSocketsUrl: string;
  collectionName?: string;
  onJoin?: Function;
  onConnectionOpen?: Function;
  onConnectionClose?: Function;
  onConnectionError?: Function;
  onUsersChange?: Function;
};

class SessionClient {
  userId: string;
  userName: any;
  collectionName: string;
  webSocketsUrl: string;
  users: { [userId: string]: UserData };
  editors: { [editorId: string]: SharedCodeMirror };
  connection: ShareDB.Connection;
  doc: any;
  socket: ReconnectingWebSocket;
  onJoin: Function;
  onConnectionOpen: Function;
  onConnectionClose: Function;
  onConnectionError: Function;
  onUsersChange: Function;

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
   * @return {SessionClient} the created SessionClient object
   */
  constructor(ctx: SessionClientContext) {
    const {
      userId,
      webSocketsUrl,
      collectionName,
      onJoin,
      onConnectionOpen,
      onConnectionClose,
      onConnectionError,
      onUsersChange
    } = ctx;

    this.webSocketsUrl = webSocketsUrl;
    this.userId = userId;
    this.collectionName = collectionName || "flok";
    this.onJoin = onJoin || (() => {});
    this.onConnectionOpen = onConnectionOpen || (() => {});
    this.onConnectionClose = onConnectionClose || (() => {});
    this.onConnectionError = onConnectionError || (() => {});
    this.onUsersChange = onUsersChange || (() => {});

    this.users = {};
    this.editors = {};
  }

  join(sessionId: string) {
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
  attachEditor(id: string, sharedEditor: SharedCodeMirror) {
    this.editors[id] = sharedEditor;

    sharedEditor.attach(this, id);

    // If this is a new editor, get current content and send OP
    if (!(this.doc.data && this.doc.data.contents[id])) {
      const content = sharedEditor.editor.getValue();
      this.sendOP([{ p: ["contents", id], oi: content }]);
    }

    // If this is a new editor, get current cursor position and send OP
    const { userId } = this;
    console.debug(
      "Going to check for cursor position in editors:",
      this.doc.data
    );
    if (!(this.doc.data && this.doc.data.users[userId].es[id])) {
      const { line, ch } = sharedEditor.editor.getCursor();
      this.sendOP([{ p: ["users", userId, "es", id], oi: { l: line, c: ch } }]);
    }
  }

  triggerUsersChange() {
    console.debug("Current users:", this.users);
    this.onUsersChange(
      Object.keys(this.users).map(id => ({ id, name: this.users[id].n }))
    );
  }

  /**
   * Stops listening for changes from the CodeMirror instance and the ShareDB document.
   */
  release() {
    const { doc } = this;

    if (!doc) return;

    console.debug("Releasing document", doc);

    if (doc.cm) doc.cm.version = doc.version;

    // Unsubscribe events from all attached SharedEditor instances
    const editors = Object.values(this.editors);
    for (let i = 0; i < editors.length; i += 1) {
      const sharedEditor: SharedCodeMirror = editors[i];
      sharedEditor.dettach();
    }

    // Remove doc hooks
    doc.removeListener("op", this._handleRemoteChange);
    doc.removeListener("del", this._handleDocDelete);
    doc.removeListener("error");

    delete this.doc;

    console.debug("Unsubscribed from document");
  }

  setUsername(newName: string) {
    const oldName = this.userName;

    if (newName === oldName) return;

    this.userName = newName;
    if (this.doc) {
      console.debug("setUsername:", newName);
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
  _attachDoc(callback: (error: Error) => void) {
    const { doc } = this;

    console.debug("Document:", doc);

    doc.subscribe((error: Error) => {
      if (error) {
        if (!callback) {
          console.error(error);
        }
      } else {
        console.debug("Subscribed to document:", doc);
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
      console.debug("Creating empty document");

      // Create empty document, with current user
      this.users = {};
      this.users[this.userId] = { es: {}, n: this.userName };
      this.triggerUsersChange();

      const data: DocumentData = { contents: {}, users: this.users };

      doc.create(data, (error: Error) => {
        if (error) {
          console.error(error);
          return;
        }

        this.onJoin();
      });
    } else {
      console.debug("Document already exists; add user");

      // Update current users map from document
      this.users = doc.data.users;

      this.triggerUsersChange();
      this._updateEditorBookmarks();

      // Add current user
      const userData: UserData = { es: {}, n: this.userName };
      this.users[this.userId] = userData;
      this.sendOP([{ p: ["users", this.userId], oi: userData }]);

      this.onJoin();
    }

    doc.on("op", this._handleRemoteChange);
    doc.on("del", this._handleDocDelete);
    doc.on("error", (error: Error) => console.error(error));
  }

  evaluateCode({ editorId, body, fromLine, toLine, user }) {
    this.sendOP([
      {
        p: ["eval"],
        oi: { ed: editorId, c: body, b: fromLine, e: toLine, u: user }
      }
    ]);
  }

  updateCursorActivity({ editorId, line, column }) {
    const { userId } = this;
    this.sendOP([
      { p: ["users", userId, "es", editorId], oi: { l: line, c: column } }
    ]);
  }

  updateContent({ editorId, ops }) {
    this.sendOP([{ p: ["contents", editorId], t: "text0", o: ops }]);
  }

  getContentFromEditor(id: string) {
    const { doc } = this;
    return (doc && doc.data && doc.data.contents[id]) || "";
  }

  _updateEditorBookmarks() {
    const { editors, users } = this;

    // FIXME: Support multiple editors
    Object.keys(editors).forEach(editorId => {
      Object.keys(users).forEach(userId => {
        const editor = editors[editorId];
        // const userData = users[userId];
        const userData: UserPosData = users[userId].es[editorId] || {
          l: null,
          c: null
        };
        const cursorPos = { line: userData.l, ch: userData.c };
        const userNum = Object.keys(users).indexOf(userId);
        editor.updateBookmarkForUser(userId, userNum, cursorPos);
      });
    });
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

    console.debug("Applying OPs:", ops);

    const { editors } = this;

    // eslint-disable-next-line no-restricted-syntax
    for (let part of ops) {
      if (part.p[0] === "contents") {
        const editorId = part.p[1];
        const sharedEditor = editors[editorId];

        sharedEditor.suppressChange = true;

        const { editor } = sharedEditor;

        if (part.oi) {
          console.debug("New buffer");
          editor.setValue(part.oi);
        } else if (part.t === "text0") {
          const op = part.o;
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
        }

        sharedEditor.suppressChange = false;
        sharedEditor.assertValue(this);
      } else if (part.p[0] === "users" && part.oi) {
        if (part.p.length === 2) {
          // New user
          const userId = part.p[1];
          const userData = part.oi;
          this.users[userId] = userData;
          this.triggerUsersChange();
        } else if (part.p.length === 3 && part.p[2] === "n") {
          // Nickname update
          const userId = part.p[1];
          const newName = part.oi;
          this.users[userId].n = newName;
          this.triggerUsersChange();
        } else if (part.p.length === 4 && part.p[2] === "es") {
          // Cursor position update
          const userId = part.p[1];
          const editorId = part.p[3];
          const newPos = part.oi;
          const cursorPos = { line: newPos.l, ch: newPos.c };
          const userNum = Object.keys(this.users).indexOf(userId);
          const sharedEditor = editors[editorId];
          sharedEditor.updateBookmarkForUser(userId, userNum, cursorPos);
        }
      } else if (part.p[0] === "eval" && part.oi) {
        const { c: body, b: begin, e: end, _u, ed: editorId } = part.oi;
        console.debug(
          `Remote evaluate on editor ${editorId}: (${begin}-${end}):`,
          body
        );
        const sharedEditor = editors[editorId];
        sharedEditor.onEvaluateRemoteCode({ body });
        sharedEditor.flash(begin, end);
      }
    }
  };

  _handleDocDelete = (_data, _source) => {
    this.release();
  };

  sendOP(op) {
    console.debug("Submitting OP:", op);
    this.doc.submitOp(op, error => {
      if (error) {
        console.error(error);
      }
    });
  }
}

export default SessionClient;
