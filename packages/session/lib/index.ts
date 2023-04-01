import type { Text } from "yjs";
import { uint32 } from "lib0/random";
import EventEmitter from "events";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness.js";
import { PubSubClient } from "@flok/pubsub";
import { Doc } from "yjs";
import debugModule from "debug";

const debug = debugModule("flok:codemirror:session");

type Provider = "webrtc" | "websocket" | "indexeddb";

export interface UserColor {
  color: string;
  light: string;
}

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

export interface EvalContext {
  editorId: string;
  from: number | null;
  to: number | null;
}

export interface SessionOptions {
  hostname?: string;
  port?: number;
  isSecure?: boolean;
  user?: string;
  providers?: Provider[];
  extraSignalingServers?: string[];
}

export class Session {
  hostname: string;
  port?: number;
  isSecure: boolean;
  name: string;

  yDoc: Doc;
  awareness: Awareness;

  _user: string;
  _userColor: UserColor;
  _targets: Set<string> = new Set();
  _providers: Provider[];
  _extraSignalingServers: string[];

  _idbProvider: IndexeddbPersistence;
  _webrtcProvider: WebrtcProvider;
  _wsProvider: WebsocketProvider;
  _pubSubClient: PubSubClient;

  _emitter: EventEmitter = new EventEmitter();

  constructor(name: string, opts: SessionOptions = {}) {
    this.name = name;

    this.hostname = opts?.hostname || "localhost";
    this.port = opts?.port;
    this.isSecure = opts?.isSecure || false;

    this._user = opts?.user || "Anonymous " + Math.floor(Math.random() * 100);
    this._userColor = userColors[uint32() % userColors.length];
    this._providers = opts?.providers || ["webrtc", "websocket", "indexeddb"];
    this._extraSignalingServers = opts?.extraSignalingServers || [];

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

  getText(id: string): Text {
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

  evaluate(target: string, body: string, context: EvalContext) {
    this._pubSubClient.publish(`session:${this.name}:target:${target}:eval`, {
      body,
      user: this.user,
      ...context,
    });
  }

  on(eventName: string, cb: (...args: any[]) => void) {
    this._emitter.on(eventName, cb);
  }

  dispose() {
    this._pubSubClient.disconnect();
    if (this._wsProvider && this._wsProvider.wsconnected)
      this._wsProvider.destroy();
    if (this._webrtcProvider && !this._webrtcProvider.closed)
      this._webrtcProvider.destroy();
    if (this._idbProvider) this._idbProvider.destroy();
    this.yDoc.destroy();
    this.awareness.destroy();
  }

  _prepareYjs() {
    this.yDoc = new Doc();
    this.awareness = new Awareness(this.yDoc);
    this._updateUserStateField();
    this._createProviders();
  }

  _createProviders() {
    if (this._providers.includes("indexeddb")) {
      this._idbProvider = new IndexeddbPersistence(this.name, this.yDoc);
      this._idbProvider.on("synced", () => {
        debug("Synced data from IndexedDB");
      });
    }

    if (this._providers.includes("webrtc")) {
      this._webrtcProvider = new WebrtcProvider(this.name, this.yDoc, {
        awareness: this.awareness,
        signaling: [`${this._wsUrl}/signal`, ...this._extraSignalingServers],
      });
    }

    if (this._providers.includes("websocket")) {
      this._wsProvider = new WebsocketProvider(
        `${this._wsUrl}/doc`,
        this.name,
        this.yDoc,
        { awareness: this.awareness }
      );

      this._wsProvider.on("status", (event: any) => {
        debug("Websocket status:", event.status);
      });
    }
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
      (args) => {
        debug(`session:${this.name}:target:${target}:eval`, args);
        this._emitter.emit(`eval`, args);
        this._emitter.emit(`eval:${target}`, args);

        // Notify to flok-repls
        this._pubSubClient.publish(
          `session:${this.name}:target:${target}:in`,
          args
        );
      }
    );

    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:out`,
      (args) => {
        debug(`session:${this.name}:target:${target}:out`, args);
        this._emitter.emit(`message`, args);
        this._emitter.emit(`message:${target}`, args);
      }
    );

    // Subscribes to messages directed to ourselves
    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:user:${this.user}:out`,
      (args) => {
        debug(
          `session:${this.name}:target:${target}:user:${this.user}:out`,
          args
        );
        this._emitter.emit(`message`, args);
        this._emitter.emit(`message:${target}`, args);
      }
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
    return `${schema}://${this.hostname}${this.port ? `:${this.port}` : ""}`;
  }
}

export default Session;
