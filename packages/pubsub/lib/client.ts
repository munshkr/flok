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

  protected _ws: WebSocket;
  protected _started: boolean = false;
  protected _connected: boolean = false;
  protected _subscriptions: Set<string> = new Set();
  protected _emitter: EventEmitter = new EventEmitter();

  constructor({
    url = "ws://localhost:3000/",
    reconnectTimeout = 1000,
  }: {
    url: string;
    reconnectTimeout?: number;
  }) {
    this.url = url;
    this.reconnectTimeout = reconnectTimeout;
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
    if (cb) {
      const event = `message:${topic}`;
      this.removeAllListeners(event);
      this.on(event, cb);
    }
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
    debug("create WebSocket on", this.url);
    this._ws = new WebSocket(this.url);

    this._ws.onopen = () => {
      debug("open");
      this._connected = true;
      this._notifyState();
      this._emitter.emit("open");
    };

    this._ws.onclose = () => {
      debug("close");
      this._connected = false;
      if (this._started)
        setTimeout(() => this._connect(), this.reconnectTimeout);
      this._emitter.emit("close");
    };

    this._ws.onerror = (err: any) => {
      debug("error", err);
      this._emitter.emit("error", err);
    };

    this._ws.onmessage = (event) => {
      const data = JSON.parse(event.data.toString());
      const { topic, payload } = data;
      debug("message", topic, payload);
      this._emitter.emit("message", topic, payload);
      this._emitter.emit(`message:${topic}`, payload);
    };
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
