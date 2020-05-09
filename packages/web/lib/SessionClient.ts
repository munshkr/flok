import * as Y from "yjs";
import { WebrtcProvider } from "./y-webrtc";
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
  extraIceServers?: IceServerType[];
  sessionName?: string;
  sessionPassword?: string;
  userName?: string;
  onJoin?: Function;
};

class SessionClient {
  userName: string;
  sessionName: string;
  sessionPassword: string;
  signalingServerUrl: string;
  extraIceServers: IceServerType[];
  onJoin: Function;

  _doc: Y.Doc;
  _provider: any;
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
      extraIceServers,
      sessionName,
      sessionPassword,
      userName,
      onJoin
    } = ctx;

    this.signalingServerUrl = signalingServerUrl;
    this.extraIceServers = extraIceServers || [];
    this.userName = userName;
    this.sessionName = sessionName || "default";
    this.sessionPassword = sessionPassword;
    this.onJoin = onJoin || (() => { });

    // Create document and provider
    this._doc = new Y.Doc();
    this._editorBindings = {};
  }

  join() {
    const {
      signalingServerUrl,
      extraIceServers,
      sessionName,
      sessionPassword
    } = this;
    console.debug("[WebRTC] ICE servers:", extraIceServers);
    const provider = new WebrtcProvider(`flok:${sessionName}`, this._doc, {
      password: sessionPassword,
      signaling: [signalingServerUrl],
      extraIceServers
    });
    this._provider = provider;
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
      this._provider.awareness
    );

    // Save editor content on local storage whenever it changes
    editor.on('change', (cm) => {
      this._setLocalStorage(id, cm.getValue());
    });

    // If text is empty, try to load buffer from localStorage
    if (text.toString() === "") {
      editor.setValue(this._getLocalStorage(id) || "");
    }

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
  }

  setUsername(newName: string) {
    if (this._provider) {
      this._provider.awareness.setLocalStateField("user", { name: newName });
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

    // Clear marker after timeout
    setTimeout(() => {
      marker.clear();
    }, 150);
  }

  _getLocalStorage(editorId: string) {
    const key = this._localStorageKey(editorId);
    return localStorage.getItem(key);
  }

  _setLocalStorage(editorId: string, value: string) {
    const key = this._localStorageKey(editorId)
    return localStorage.setItem(key, value);
  }

  _localStorageKey(editorId: string) {
    const { sessionName } = this;
    return `session:${sessionName}:editor:${editorId}`;
  }
}

export default SessionClient;
