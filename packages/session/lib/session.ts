import type * as Y from "yjs";
import { uint32 } from "lib0/random";
import EventEmitter from "events";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness.js";
import { PubSubClient } from "@flok-editor/pubsub";
import { Doc } from "yjs";
import debugModule from "debug";
import { Document } from "./document.js";

const debug = debugModule("flok:session");

type Provider = "webrtc" | "websocket" | "indexeddb";
type SessionEvent =
  | "sync"
  | "eval"
  | "message"
  | "change"
  | `eval:${string}`
  | `message:${string}`
  | `change-target:${string}`
  | "ws:connect"
  | "ws:disconnect"
  | "pubsub:start"
  | "pubsub:stop"
  | "pubsub:open"
  | "pubsub:close"
  | "pubsub:error";

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
  from: number | null;
  to: number | null;
}

export type EvalMode =
  | "default" // publish to :eval and :in topics (for REPL targets)
  | "web" // emit eval events directly and publish to :eval topic (for Web targets)
  | "webLocal"; // emit eval events directly, do not publish to :eval topic

export interface EvalMessage extends EvalContext {
  docId: string;
  body: string;
  user: string;
  mode: EvalMode;
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

  _initialized: boolean = false;
  _synced: boolean = false;
  _wsConnected: boolean = false;
  _user: string;
  _userColor: UserColor;
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

    this._handleObserveSharedTypes = this._handleObserveSharedTypes.bind(this);
  }

  initialize() {
    if (this._initialized) return;
    this._prepareYjs();
    this._preparePubSub();
    this._initialized = true;
    this._emitter.emit("init");
    debug("initialized");
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

  setActiveDocuments(items: { id: string; target?: string }[]) {
    const targets = this._yTargets();
    const oldTargets = Object.fromEntries(targets.entries());

    // Remove duplicates on items (duplicate ids) by creating an object/map
    const newTargets = Object.fromEntries(
      items.map(({ id, target }) => [id, target])
    );

    // Calculate ids to delete and ids to create
    const newIds = Object.keys(newTargets);
    const oldIds = Array.from(targets.keys());
    const toDelete = oldIds.filter((id) => !newIds.includes(id));
    const toAddOrUpdate = newIds.filter(
      (id) => !oldIds.includes(id) || oldTargets[id] !== newTargets[id]
    );
    debug("toDelete", toDelete);
    debug("toAddOrUpdate", toAddOrUpdate);

    this.yDoc.transact(() => {
      toDelete.forEach((id) => targets.delete(id));
      toAddOrUpdate.forEach((id) => targets.set(id, newTargets[id]));
    });
  }

  getDocuments(): Document[] {
    return Array.from(this._yTargets().keys()).map(
      (id) => new Document(this, id)
    );
  }

  getDocument(id: string): Document | null {
    if (!this._yTargets().has(id)) return;
    return new Document(this, id);
  }

  getTarget(id: string): string {
    return this._yTargets().get(id);
  }

  setTarget(id: string, target: string) {
    this._yTargets().set(id, target);
  }

  getText(id: string): Y.Text {
    return this._yText(id);
  }

  getTextString(id: string) {
    return this.getText(id).toString();
  }

  setTextString(id: string, text: string) {
    const ytext = this._yText(id);
    if (ytext.toString() === text) return;
    this.yDoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, text);
    });
  }

  evaluate(
    docId: string,
    target: string,
    body: string,
    context: EvalContext,
    mode: EvalMode = "default"
  ) {
    const msg: EvalMessage = {
      docId,
      body,
      user: this.user,
      mode,
      ...context,
    };

    // If evaluating on browser, emit events directly
    if (mode === "web" || mode === "webLocal") {
      this._emitter.emit(`eval`, msg);
      this._emitter.emit(`eval:${target}`, msg);
    }

    // If not evaluating locally, publish to :eval topic
    if (mode !== "webLocal") {
      this._pubSubClient.publish(
        `session:${this.name}:target:${target}:eval`,
        msg
      );
    }
  }

  on(eventName: SessionEvent, cb: (...args: any[]) => void) {
    this._emitter.on(eventName, cb);
  }

  off(eventName: SessionEvent, cb: (...args: any[]) => void) {
    this._emitter.off(eventName, cb);
  }

  once(eventName: SessionEvent, cb: (...args: any[]) => void) {
    this._emitter.once(eventName, cb);
  }

  removeAllListeners(eventName: SessionEvent) {
    this._emitter.removeAllListeners(eventName);
  }

  destroy() {
    ["error", "open", "close"].forEach((e) =>
      this._pubSubClient.removeAllListeners(e)
    );
    this._synced = false;
    this._initialized = false;
    this._pubSubClient.destroy();
    if (this._wsProvider && this._wsProvider.wsconnected)
      this._wsProvider.destroy();
    if (this._webrtcProvider && !this._webrtcProvider.closed)
      this._webrtcProvider.destroy();
    if (this._idbProvider) this._idbProvider.destroy();
    this._yTargets().unobserve(this._handleObserveSharedTypes);
    this.yDoc.destroy();
    this.awareness.destroy();
  }

  get wsUrl() {
    const schema = this.isSecure ? `wss` : `ws`;
    return `${schema}://${this.hostname}${this.port ? `:${this.port}` : ""}`;
  }

  get synced() {
    return this._synced;
  }

  get wsConnected() {
    return this._wsConnected;
  }

  _prepareYjs() {
    this.yDoc = new Doc();
    this.awareness = new Awareness(this.yDoc);
    this._updateUserStateField();
    this._observeSharedTypes();
    this._createProviders();
  }

  _createProviders() {
    if (this._providers.includes("indexeddb")) {
      this._idbProvider = new IndexeddbPersistence(this.name, this.yDoc);
      this._idbProvider.on("synced", () => {
        if (!this._synced) {
          this._synced = true;
          this._emitter.emit("sync");
          debug("Synced first with IndexedDB");
        }
      });
    }

    if (this._providers.includes("webrtc")) {
      this._webrtcProvider = new WebrtcProvider(this.name, this.yDoc, {
        awareness: this.awareness,
        signaling: [`${this.wsUrl}/signal`, ...this._extraSignalingServers],
      });
      this._webrtcProvider.on("synced", () => {
        if (!this._synced) {
          this._synced = true;
          this._emitter.emit("sync");
          debug("Synced first with WebRTC");
        }
      });
    }

    if (this._providers.includes("websocket")) {
      this._wsProvider = new WebsocketProvider(
        `${this.wsUrl}/doc`,
        this.name,
        this.yDoc,
        { awareness: this.awareness }
      );
      this._wsProvider.on("synced", () => {
        if (!this._synced) {
          this._synced = true;
          this._emitter.emit("sync");
          debug("Synced first with WebSockets");
        }
      });
      this._wsProvider.on("status", ({ status }) => {
        if (status === "connected") {
          this._wsConnected = true;
          this._emitter.emit("ws:connect");
        } else if (status === "disconnected") {
          this._wsConnected = false;
          this._emitter.emit("ws:disconnect");
        }
      });
    }
  }

  _preparePubSub() {
    this._pubSubClient = new PubSubClient({ url: `${this.wsUrl}/pubsub` });
    this._pubSubClient.on("start", () => {
      this._emitter.emit("pubsub:start");
    });
    this._pubSubClient.on("stop", () => {
      this._emitter.emit("pubsub:stop");
    });
    this._pubSubClient.on("error", (err) => {
      debug("error on pubsub", err);
      this._emitter.emit("pubsub:error", err);
    });
    this._pubSubClient.on("open", () => {
      this._emitter.emit("pubsub:open");
    });
    this._pubSubClient.on("close", () => {
      this._emitter.emit("pubsub:close");
    });
    this._pubSubClient.start();
  }

  _subscribeToTarget(target: string) {
    if (!this._pubSubClient) return;

    // Subscribe to messages directed to a specific target
    this._pubSubClient.subscribe(
      `session:${this.name}:target:${target}:eval`,
      (args) => {
        debug(`session:${this.name}:target:${target}:eval`, args);

        const { fromMe, message } = args;
        const { mode } = message;

        // If mode is web or webLocal, and message is from me, do not emit
        // event because we already did it when calling .evaluate()
        if ((mode === "web" || mode === "webLocal") && fromMe) return;

        this._emitter.emit(`eval`, message);
        this._emitter.emit(`eval:${target}`, message);

        // If mode is web or webLocal, do not publish to :in topics (not a REPL target)
        if (mode === "web" || mode === "webLocal") return;

        // Notify to flok-repls
        this._pubSubClient.publish(
          `session:${this.name}:target:${target}:in`,
          message
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

  _unsubscribeTarget(target: string) {
    const topics = [
      `session:${this.name}:target:${target}:eval`,
      `session:${this.name}:target:${target}:out`,
      `session:${this.name}:target:${target}:user:${this.user}:out`,
    ];
    topics.forEach((topic) => this._pubSubClient.unsubscribe(topic));
  }

  _updateUserStateField() {
    this.awareness.setLocalStateField("user", {
      name: this.user,
      color: this._userColor.color,
      colorLight: this._userColor.light,
    });
  }

  _observeSharedTypes() {
    this._yTargets().observe(this._handleObserveSharedTypes);
  }

  protected _handleObserveSharedTypes(event: Y.YMapEvent<string>) {
    const ymap = this._yTargets();
    event.changes.keys.forEach((change, key) => {
      // If a target was added or updated, subscribe and emit change event
      if (change.action === "add" || change.action === "update") {
        const newValue = ymap.get(key);
        debug(
          `Document "${key}" was added or updated. New target: "${newValue}". ` +
            `Previous target: "${change.oldValue}".`
        );
        debug(`Subscribe to ${newValue}`);
        this._subscribeToTarget(newValue);
        this._emitter.emit(`change-target:${key}`, newValue, change.oldValue);
      }

      // If a target is not present anymore, unsubscribe on PubSub
      if (change.action === "update" || change.action === "delete") {
        const targets = Array.from(ymap.values());
        if (!targets.includes(change.oldValue)) {
          debug(`Unsubscribe from ${change.oldValue}`);
          this._unsubscribeTarget(change.oldValue);
        }
      }
    });

    this._emitter.emit("change", this.getDocuments());
  }

  _yTargets(): Y.Map<string> {
    return this.yDoc.getMap("targets");
  }

  _yText(id: string): Y.Text {
    return this.yDoc.getText(`text:${id}`);
  }
}

export default Session;
