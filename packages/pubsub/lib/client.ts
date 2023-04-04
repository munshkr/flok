import WebSocket from "isomorphic-ws";
import debugModule from "debug";
import { EventEmitter } from "events";

const debug = debugModule("flok:pubsub:client");

type MessageType = "publish" | "subscribe" | "unsubscribe" | "unsubscribe-all";

export class PubSubClient {
  readonly host: string;
  readonly port: number;
  readonly isSecure: boolean;

  protected _ws: WebSocket;
  protected _connected: boolean = false;
  protected _subscriptions: Set<string> = new Set();
  protected _emitter: EventEmitter = new EventEmitter();

  constructor({
    host = "localhost",
    port = 3000,
    isSecure = false,
  }: {
    host: string;
    port: number;
    isSecure: boolean;
  }) {
    this.host = host;
    this.port = port;
    this.isSecure = isSecure;
  }

  async connect() {
    if (this._connected) return;

    this._ws = new WebSocket(this._wsUrl);

    this._ws.on("open", () => {
      debug("open");
      this._emitter.emit("open");
    });

    this._ws.on("close", () => {
      debug("close");
      // TODO: Reconnect?

      this._connected = false;
      this._emitter.emit("close");
    });

    this._ws.on("error", (err: Error) => {
      debug("err", err);
      this._emitter.emit("error", err);
    });

    this._ws.on("message", (rawData) => {
      const data = JSON.parse(rawData.toString());
      const { topic, payload } = data;
      debug("message", topic, payload);
      this._emitter.emit("message", topic, payload);
      this._emitter.emit(`message:${topic}`, payload);
    });

    this._connected = true;
  }

  on(eventName: string | symbol, cb: (...args: any[]) => void) {
    return this._emitter.on(eventName, cb);
  }

  off(eventName: string | symbol, cb: (...args: any[]) => void) {
    return this._emitter.off(eventName, cb);
  }

  once(eventName: string | symbol, cb: (...args: any[]) => void) {
    return this._emitter.once(eventName, cb);
  }

  disconnect() {
    if (!this._connected) return;
    this._ws.close();
  }

  publish(topic: string, msg: string) {
    this._send("publish", { topic, msg });
  }

  subscribe(topic: string) {
    if (this._connected) this._send("subscribe", { topic });
    this._subscriptions.add(topic);
  }

  unsubscribe(topic: string) {
    if (this._connected) this._send("unsubscribe", { topic });
    this._subscriptions.delete(topic);
  }

  unsubscribeAll() {
    if (this._connected) this._send("unsubscribe-all");
    this._subscriptions.clear();
  }

  get _wsUrl() {
    const schema = this.isSecure ? `wss` : `ws`;
    return `${schema}://${this.host}${this.port ? `:${this.port}` : ""}`;
  }

  protected _send(
    type: MessageType,
    payload?: any,
    cb?: (err?: Error) => void
  ) {
    const data = JSON.stringify({ type, payload });
    this._ws.send(data, (err?: Error) => {
      debug("send", type);
      if (err) debug("error on send", err);
      cb && cb(err);
    });
  }
}
