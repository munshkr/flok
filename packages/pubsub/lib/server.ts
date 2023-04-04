import { WebSocketServer, type WebSocket } from "ws";
import { v1 as uuidv1 } from "uuid";
import debugModule from "debug";

const debug = debugModule("flok:pubsub:server");

export class PubSubServer {
  pingTimeout: number = 30000;

  protected _wss: WebSocketServer;
  protected _subscribers: { [topic: string]: Set<string> } = {};
  protected _clients: { [id: string]: WebSocket } = {};
  protected _isAlive: { [id: string]: boolean } = {};
  protected _pingIntervalId: any;

  constructor(wss: WebSocketServer) {
    this._wss = wss;
    this._addEventListeners();
    this._setPingInterval();
  }

  protected _handleListening(...args: any[]) {
    debug("listening", ...args);
  }

  protected _handleClose() {
    debug("closed");
    clearInterval(this._pingIntervalId);
  }

  protected _handleError(err: Error) {
    debug("error", err);
  }

  protected _handleConnection(ws: WebSocket) {
    const id = uuidv1();
    this._clients[id] = ws;

    debug(`[${id}] connection`);

    this._isAlive[id] = true;

    ws.on("message", (rawData) => {
      const data = JSON.parse(rawData.toString());
      debug(`[${id}] message`, data);

      const { type, payload } = data;
      switch (type) {
        case "publish": {
          const { topic, msg } = payload;
          this._publish(topic, msg);
          break;
        }
        case "subscribe": {
          const { topic } = payload;
          this._subscribe(topic, id);
          break;
        }
        case "unsubscribe": {
          const { topic } = payload;
          this._unsubscribe(topic, id);
          break;
        }
        case "unsubscribe-all": {
          this._unsubscribeAll(id);
          break;
        }
        case "state": {
          const { topics } = payload;
          this._updateState(id, topics);
          break;
        }
        default: {
          debug("ignoring unknown message type", type);
        }
      }
    });

    ws.on("error", (err) => {
      debug(`[${id}] error`, err);
    });

    ws.on("pong", () => {
      this._isAlive[id] = true;
    });

    ws.on("close", () => {
      debug(`[${id}] close`);
      // Remove ws from all subscribed topics
      this._unsubscribeAll(id);
      delete this._clients[id];
      debug("clients after `close`:", this._clients);
    });
  }

  protected _addEventListeners() {
    this._wss.on("listening", this._handleListening.bind(this));
    this._wss.on("connection", this._handleConnection.bind(this));
    this._wss.on("close", this._handleClose.bind(this));
    this._wss.on("error", this._handleError.bind(this));
  }

  protected _setPingInterval() {
    this._pingIntervalId = setInterval(() => {
      Object.entries(this._clients).forEach(([id, ws]) => {
        if (!this._isAlive[id]) return ws.terminate();
        this._isAlive[id] = false;
        ws.ping();
      });
    }, this.pingTimeout);
  }

  protected _publish(topic: string, msg: any) {
    const subs = this._subscribers;
    if (!(topic in subs) || subs[topic].size === 0) return;

    subs[topic].forEach((id) => {
      const data = JSON.stringify({ topic, payload: msg });
      this._clients[id].send(data, (err) => {
        if (!err) return;
        debug(`error publishing to client ${id}`, err);
      });
    });
  }

  protected _subscribe(topic: string, subscriber: string) {
    const subs = this._subscribers;
    if (!(topic in subs)) subs[topic] = new Set();
    subs[topic].add(subscriber);
    debug("subscribers after `subscribe`:", this._subscribers);
  }

  protected _unsubscribe(topic: string, subscriber: string) {
    const subs = this._subscribers;
    if (subs[topic]) subs[topic].delete(subscriber);
    if (subs[topic] && subs[topic].size === 0) delete subs[topic];
    debug("subscribers after `unsubscribe`:", this._subscribers);
  }

  protected _unsubscribeAll(subscriber: string) {
    Object.values(this._subscribers).forEach((subs) => {
      subs.delete(subscriber);
    });
    this._deleteEmptySubscriberSets();
    debug("subscribers after `unsubscribeAll`:", this._subscribers);
  }

  protected _deleteEmptySubscriberSets() {
    const topics = Object.keys(this._subscribers);
    topics.forEach((topic) => {
      if (this._subscribers[topic].size === 0) delete this._subscribers[topic];
    });
  }

  protected _updateState(subscriber: string, topics: string[]) {
    this._unsubscribeAll(subscriber);
    topics.forEach((topic) => this._subscribe(topic, subscriber));
  }
}
