import * as Y from "yjs";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness.js";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { PubSubClient } from "@flok/core";
import * as random from "lib0/random";
import EventEmitter from "events";

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
  user?: string;
};

export class FlokSession {
  hostname: string;
  port: number;
  isSecure: boolean;
  name: string;

  yDoc!: Y.Doc;
  awareness!: Awareness;

  _user: string;
  _userColor: UserColor;
  _targets: Set<string> = new Set();

  _idbProvider!: IndexeddbPersistence;
  _webrtcProvider!: WebrtcProvider;
  _wsProvider!: WebsocketProvider;
  _pubSubClient!: PubSubClient;

  _emitter: EventEmitter = new EventEmitter();

  constructor(name: string, opts: FlokSessionOptions = {}) {
    this.name = name;
    this.hostname = opts?.hostname || "localhost";
    this.port = opts?.port || 3000;
    this.isSecure = opts?.isSecure || false;

    this._user = opts?.user || "Anonymous " + Math.floor(Math.random() * 100);
    this._userColor = userColors[random.uint32() % userColors.length];

    this._prepareYjs();
    this._preparePubSub();
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

  addTargets(...items: string[]) {
    const newTargets = new Set(
      items.filter((item) => !this._targets.has(item))
    );
    items.forEach((item) => this._targets.add(item));
    newTargets.forEach((target) => this._subscribeToTarget(target));
  }

  removeTargets(...items: string[]) {
    items.forEach((item) => {
      this._targets.delete(item);
      this._pubSubClient.unsubscribe(item);
    });
  }

  clearTargets() {
    this._targets.forEach((item) => this._pubSubClient.unsubscribe(item));
    this._targets.clear();
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
    this._idbProvider = new IndexeddbPersistence(this.name, this.yDoc);
    // this._idbProvider.on("synced", () => {
    //   console.log("Data from IndexexDB loaded");
    // });

    this._webrtcProvider = new WebrtcProvider(this.name, this.yDoc, {
      awareness: this.awareness,
      signaling: [`${this._wsUrl}/signal`],
    });

    this._wsProvider = new WebsocketProvider(
      `${this._wsUrl}/doc`,
      this.name,
      this.yDoc,
      { awareness: this.awareness }
    );

    // this._wsProvider.on("status", (event: any) => {
    //   console.log(event.status);
    // });
  }

  _preparePubSub() {
    this._pubSubClient = new PubSubClient(`${this._wsUrl}/pubsub`, {
      connect: true,
      reconnect: true,
    });
  }

  _subscribeToTarget(target: string) {
    // Subscribe to messages directed to a specific target
    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:eval`,
      (content) => this._emitter.emit("eval", { target, content })
    );

    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:out`,
      (content) => this._emitter.emit("message", { target, content })
    );

    // Subscribes to messages directed to ourselves
    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:user:${this.user}:out`,
      (content) => this._emitter.emit("message:user", { target, content })
    );
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
