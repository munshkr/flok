import type * as Y from "yjs";
import { uint32 } from "lib0/random";
import EventEmitter from "events";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness.js";
import { PubSubClient } from "@flok/pubsub";
import { Doc } from "yjs";
import debugModule from "debug";
import { Document } from "./document.js";

const debug = debugModule("flok:session");

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

  setActiveDocuments(items: { id: string; target?: string }[]) {
    const targets = this._yTargets();

    // Remove duplicates on items (duplicate ids) by creating an object/map
    const newTargets = Object.fromEntries(
      items.map(({ id, target }) => [id, target])
    );

    // Calculate ids to delete and ids to create
    const newIds = Object.keys(newTargets);
    const oldIds = Array.from(targets.keys());
    const toDelete = oldIds.filter((id) => !newIds.includes(id));
    const toAdd = newIds.filter((id) => !oldIds.includes(id));

    this.yDoc.transact(() => {
      toDelete.forEach((id) => targets.delete(id));
      toAdd.forEach((id) => targets.set(id, newTargets[id]));
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

  evaluate(
    editorId: string,
    target: string,
    body: string,
    context: EvalContext
  ) {
    this._pubSubClient.publish(`session:${this.name}:target:${target}:eval`, {
      editorId,
      body,
      user: this.user,
      ...context,
    });
  }

  on(eventName: string, cb: (...args: any[]) => void) {
    this._emitter.on(eventName, cb);
  }

  destroy() {
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
    }
  }

  _preparePubSub() {
    this._pubSubClient = new PubSubClient({ url: `${this._wsUrl}/pubsub` });
    this._pubSubClient.on("error", (err) => {
      debug("error on pubsub", err);
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

  get _wsUrl() {
    const schema = this.isSecure ? `wss` : `ws`;
    return `${schema}://${this.hostname}${this.port ? `:${this.port}` : ""}`;
  }

  _yTargets(): Y.Map<string> {
    return this.yDoc.getMap("targets");
  }

  _yText(id: string): Y.Text {
    return this.yDoc.getText(`text:${id}`);
  }
}

export default Session;
