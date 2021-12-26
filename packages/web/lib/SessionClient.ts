import * as Y from "yjs";
import { WebrtcProvider } from "./y-webrtc";
import { WebsocketProvider } from "./y-websocket";
import { IndexeddbPersistence } from "./y-indexeddb";
import { CodeMirrorBinding } from "./y-codemirror";
import CodeMirror from "codemirror";

// FIXME Replace callbacks for Promises

export type IceServerType = {
  urls: string;
  username?: string;
  credential?: string;
};

type SessionClientContext = {
  signalingServerUrl: string;
  websocketServerUrl: string;
  extraIceServers?: IceServerType[];
  sessionName?: string;
  sessionPassword?: string;
  userName?: string;
  onJoin?: Function;
  onInitialSync?: Function;
};

class SessionClient {
  userName: string;
  sessionName: string;
  sessionPassword: string;
  signalingServerUrl: string;
  websocketServerUrl: string;
  extraIceServers: IceServerType[];
  onJoin: Function;
  onInitialSync: Function;

  _doc: Y.Doc;
  _provider: any;
  _websocketProvider: any;
  _indexedDbProvider: any;
  _editorBindings: {
    [editorId: string]: CodeMirrorBinding;
  };

  /**
   * @constructor
   * @param {Object} options - configuration options:
   *    - userName: user name
   *    - signalingServerUrl: WebSocket URL for the signaling server
   *    - sessionName: optional. Session name (default: "default")
   *    - sessionPassword: optional. Session password (default: null)
   *      Use sessionPassword only if signaling server is secure (wss://)
   * @return {SessionClient} the created SessionClient object
   */
  constructor(ctx: SessionClientContext) {
    const {
      signalingServerUrl,
      websocketServerUrl,
      extraIceServers,
      sessionName,
      sessionPassword,
      userName,
      onJoin,
      onInitialSync,
    } = ctx;

    this.signalingServerUrl = signalingServerUrl;
    this.websocketServerUrl = websocketServerUrl;
    this.extraIceServers = extraIceServers || [];
    this.userName = userName;
    this.sessionName = sessionName || "default";
    this.sessionPassword = sessionPassword;
    this.onJoin = onJoin || (() => {});
    this.onInitialSync = onInitialSync || (() => {});

    // Create document and provider
    this._doc = new Y.Doc();
    this._editorBindings = {};
  }

  join() {
    const {
      signalingServerUrl,
      websocketServerUrl,
      extraIceServers,
      sessionName,
      sessionPassword,
    } = this;
    console.debug("[WebRTC] ICE servers:", extraIceServers);

    const roomName = `flok:${sessionName}`;

    // Main provider via WebRTC
    const provider = new WebrtcProvider(roomName, this._doc, {
      password: sessionPassword,
      signaling: [signalingServerUrl],
      extraIceServers,
    });
    this._provider = provider;

    // WebSocket fallback provider, in case WebRTC does not work for some peers
    const websocketProvider = new WebsocketProvider(
      websocketServerUrl,
      roomName,
      this._doc
    );
    this._websocketProvider = websocketProvider;

    // A third fallback provider, this allows us to cache documents locally on browser.
    const idbProvider = new IndexeddbPersistence(roomName, this._doc);
    this._indexedDbProvider = idbProvider;

    // Handle initial sync for sending the content of all editors
    if (this.onInitialSync) {
      websocketProvider.on("sync", (synced) => {
        if (synced) this._handleInitialSync("websocket");
      });
      provider.on("synced", ({ synced }) => {
        if (synced) this._handleInitialSync("webrtc");
      });
      idbProvider.whenSynced.then(() => {
        this._handleInitialSync("indexeddb");
      });
    }

    this.onJoin();
  }

  isSignalingServerSecure() {
    const protocol = this.signalingServerUrl.split(":")[0];
    return protocol === "wss:";
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
  attachEditor(id: string, editor: CodeMirror) {
    // Bind text with CodeMirror editor
    const text = this._doc.getText(`editors:${id}`);
    const binding = new CodeMirrorBinding(
      text,
      editor,
      this.userName,
      this._provider
        ? this._provider.awareness
        : this._websocketProvider.awareness
    );
    this._editorBindings[id] = binding;
  }

  /**
   * Stops listening for changes from the CodeMirror instance and the ShareDB document.
   */
  release() {
    for (let i = 0; i < Object.keys(this._editorBindings).length; i++) {
      const binding = this._editorBindings[i];
      binding.destroy();
    }

    if (this._provider) {
      this._provider.destroy();
    }
    if (this._websocketProvider) {
      this._websocketProvider.destroy();
    }
    if (this._indexedDbProvider) {
      this._indexedDbProvider.destroy();
    }
  }

  setUsername(newName: string) {
    if (this._provider) {
      this._provider.awareness.setLocalStateField("user", { name: newName });
    }
    if (this._websocketProvider) {
      this._websocketProvider.awareness.setLocalStateField("user", {
        name: newName,
      });
    }
  }

  flash(editorId: string, fromLine: number, toLine: number) {
    const editorBinding = this._editorBindings[editorId];
    const editor = editorBinding.target;

    // Mark text with .flash-selection class
    const marker = editor.markText(
      { line: fromLine, ch: 0 },
      { line: toLine + 1, ch: 0 },
      { className: "flash-selection" }
    );
    marker.className = "";

    // Clear marker after timeout
    setTimeout(() => {
      marker.clear();
    }, 600);
  }

  _handleInitialSync = (method: string) => {
    let texts = {};
    Object.entries(this._editorBindings).forEach(
      ([key, binding]: [string, CodeMirrorBinding]) => {
        texts[key] = binding.target.getValue();
      }
    );
    this.onInitialSync(method, texts);
  };
}

export default SessionClient;
