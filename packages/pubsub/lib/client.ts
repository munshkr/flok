import WebSocket from "isomorphic-ws";
import debugModule from "debug";
import { EventEmitter } from "events";

const debug = debugModule("flok:pubsub:client");

type MessageType =
  | "publish"
  | "subscribe"
  | "unsubscribe"
  | "unsubscribe-all"
  | "state";

export class PubSubClient {
  readonly url: string;
  reconnectTimeout: number = 1000;
  serverPingTimeout: number = 30000;

  protected _ws: WebSocket;
  protected _started: boolean = false;
  protected _connected: boolean = false;
  protected _subscriptions: Set<string> = new Set();
  protected _pingTimeoutId: any;
  protected _emitter: EventEmitter = new EventEmitter();

  constructor({
    url = "ws://localhost:3000/",
    reconnectTimeout = 1000,
    serverPingTimeout = 30000,
  }: {
    url: string;
    reconnectTimeout?: number;
    serverPingTimeout?: number;
  }) {
    this.url = url;
    this.reconnectTimeout = reconnectTimeout;
    this.serverPingTimeout = serverPingTimeout;
  }

  start() {
    if (this._started) return;
    this._connect();
    this._started = true;
  }

  stop() {
    if (!this._started) return;
    this._ws.close();
    this._subscriptions.clear();
    this._started = false;
  }

  on(eventName: string | symbol, cb: (...args: any[]) => void) {
    this._emitter.on(eventName, cb);
  }

  off(eventName: string | symbol, cb: (...args: any[]) => void) {
    this._emitter.off(eventName, cb);
  }

  once(eventName: string | symbol, cb: (...args: any[]) => void) {
    this._emitter.once(eventName, cb);
  }

  removeAllListeners(eventName: string) {
    this._emitter.removeAllListeners(eventName);
  }

  publish(topic: string, msg: any) {
    if (this._connected) this._send("publish", { topic, msg });
  }

  subscribe(topic: string, cb?: (...args: any[]) => void) {
    if (this._connected) this._send("subscribe", { topic });
    this._subscriptions.add(topic);
    if (cb) this.on(`message:${topic}`, cb);
  }

  unsubscribe(topic: string) {
    if (this._connected) this._send("unsubscribe", { topic });
    this._subscriptions.delete(topic);
    this.removeAllListeners(`message:${topic}`);
  }

  unsubscribeAll() {
    if (this._connected) this._send("unsubscribe-all");
    this._subscriptions.clear();
  }

  protected _connect() {
    this._ws = new WebSocket(this.url);

    this._ws.on("open", () => {
      debug("open");
      this._connected = true;
      this._notifyState();
      this._heartbeat();
      this._emitter.emit("open");
    });

    this._ws.on("close", () => {
      debug("close");
      this._connected = false;
      clearTimeout(this._pingTimeoutId);
      if (this._started)
        setTimeout(() => this._connect(), this.reconnectTimeout);
      this._emitter.emit("close");
    });

    this._ws.on("error", (err: Error) => {
      debug("error", err);
      this._emitter.emit("error", err);
    });

    this._ws.on("ping", () => {
      this._heartbeat();
    });

    this._ws.on("message", (rawData) => {
      const data = JSON.parse(rawData.toString());
      const { topic, payload } = data;
      debug("message", topic, payload);
      this._emitter.emit("message", topic, payload);
      this._emitter.emit(`message:${topic}`, payload);
    });
  }

  protected _heartbeat() {
    clearTimeout(this._pingTimeoutId);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this._pingTimeoutId = setTimeout(() => {
      this._ws.terminate();
    }, this.serverPingTimeout + 1000);
  }

  protected _notifyState() {
    this._send("state", { topics: [...this._subscriptions] });
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
