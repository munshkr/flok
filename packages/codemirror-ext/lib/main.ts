import * as Y from "yjs";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness.js";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import * as random from "lib0/random";

export type UserColor = {
  color: string;
  light: string;
};

export const userColors: UserColor[] = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
];

export type FlokSessionOptions = {
  hostname?: string;
  port?: number;
  isSecure?: boolean;
  room?: string;
  user?: string;
};

export class FlokSession {
  hostname: string;
  port: number;
  isSecure: boolean;
  room: string;

  yDoc!: Y.Doc;
  awareness!: Awareness;

  _user: string;
  _userColor: UserColor;

  _idbProvider!: IndexeddbPersistence;
  _webrtcProvider!: WebrtcProvider;
  _wsProvider!: WebsocketProvider;

  constructor(opts: FlokSessionOptions = {}) {
    this.hostname = opts?.hostname || "localhost";
    this.port = opts?.port || 3000;
    this.isSecure = opts?.isSecure || false;
    this.room = opts?.room || "default";

    this._user = opts?.user || "Anonymous " + Math.floor(Math.random() * 100);
    this._userColor = userColors[random.uint32() % userColors.length];

    this._prepareYjs();
  }

  get user(): string {
    return this._user;
  }

  get userColor(): UserColor {
    return this._userColor;
  }

  set user(newUser: string) {
    this._user = newUser;
    this._updateUserStateField();
  }

  set userColor(newUserColor: UserColor) {
    this._userColor = newUserColor;
    this._updateUserStateField();
  }

  getText(id: string): Y.Text {
    return this.yDoc.getText(id);
  }

  getTextString(id: string) {
    return this.getText(id).toString();
  }

  _prepareYjs() {
    this._createDoc();
    this._createProviders();
  }

  _createDoc() {
    this.yDoc = new Y.Doc();

    // Awareness
    this.awareness = new Awareness(this.yDoc);
    this._updateUserStateField();
  }

  _createProviders() {
    this._idbProvider = new IndexeddbPersistence(this.room, this.yDoc);
    // this._idbProvider.on("synced", () => {
    //   console.log("Data from IndexexDB loaded");
    // });

    this._webrtcProvider = new WebrtcProvider(this.room, this.yDoc, {
      awareness: this.awareness,
      signaling: [`${this._wsUrl}/signal`],
    });

    this._wsProvider = new WebsocketProvider(
      `${this._wsUrl}/doc`,
      this.room,
      this.yDoc,
      { awareness: this.awareness }
    );

    // this._wsProvider.on("status", (event: any) => {
    //   console.log(event.status);
    // });
  }

  _updateUserStateField() {
    this.awareness.setLocalStateField("user", {
      name: this.user,
      color: this._userColor.color,
      colorLight: this._userColor.light,
    });
  }

  get _wsUrl() {
    const schema = this.isSecure ? `wss` : `ws`;
    return `${schema}://${this.hostname}:${this.port}`;
  }
}

export function evalKeymap() {
  const evalCode = (msg: any) => {
    console.log("eval", msg);
  };

  return keymap.of([
    {
      key: "Ctrl-Enter",
      run() {
        evalCode("ctrl");
        return true;
      },
    },
    {
      key: "Cmd-Enter",
      run() {
        evalCode("cmd");
        return true;
      },
    },
  ]);
}

export const flokCollabSetup = (session: FlokSession, textId: string) => {
  return [
    keymap.of([...yUndoManagerKeymap]),
    Prec.high(evalKeymap()),
    yCollab(session.yDoc.getText(textId), session.awareness),
  ];
};
