import { EventEmitter } from 'fbemitter';
import WebSocket from 'isomorphic-ws';

interface QueueItem {
  type: string;
  payload: any;
}

interface PubSubClientContext {
  connect: boolean;
  reconnect: boolean;
  onMeMessage?: Function;
  onClose?: Function;
}

class PubSubClient {
  emitter: EventEmitter;
  onMeMessage: Function;
  onClose: Function;

  _connected: boolean;
  _ws: WebSocket;
  _queue: QueueItem[];
  _id: string;
  _listeners: any[];
  _subscriptions: any[];
  _isReconnecting: boolean;
  _url: string;
  _options: PubSubClientContext;
  _reconnectTimeout: NodeJS.Timeout;

  constructor(url: string, options: PubSubClientContext = { connect: true, reconnect: true }) {
    // Binding
    this.reconnect = this.reconnect.bind(this);
    this.connect = this.connect.bind(this);
    this.runSubscriptionQueue = this.runSubscriptionQueue.bind(this);
    this.runQueue = this.runQueue.bind(this);

    this.unsubscribe = this.unsubscribe.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.publish = this.publish.bind(this);

    // status of client connection
    this.emitter = new EventEmitter();
    this._connected = false;
    this._ws = null;
    this._queue = [];
    this._id = null;

    // store listeners
    this._listeners = [];

    // All subscriptions
    this._subscriptions = [];

    // store settings

    this._isReconnecting = false;

    this._url = url;
    this._options = options;

    this.onMeMessage = options.onMeMessage || (() => {});
    this.onClose = options.onClose || (() => {});

    if (this._options && this._options.connect) {
      // auto connect
      this.connect();
    }
  }

  /**
   * Un Subscribe a topic, no longer receive new message of the topic
   * @param topic
   */
  unsubscribe(topic: string) {
    const subscription = this._subscriptions.find(sub => sub.topic === topic);

    if (subscription && subscription.listener) {
      // first need to remove local listener
      subscription.listener.remove();
    }

    // need to tell to the server side that i dont want to receive message from this topic
    this.send({
      action: 'unsubscribe',
      payload: {
        topic,
      },
    });
  }

  /**
   * Subscribe client to a topic
   * @param topic
   * @param cb
   */
  subscribe(topic: string, cb: Function) {
    const listener = this.emitter.addListener(`subscribe_topic_${topic}`, cb);
    // add listener to array
    this._listeners.push(listener);

    // send server with message

    this.send({
      action: 'subscribe',
      payload: {
        topic,
      },
    });

    // let store this into subscriptions for later when use reconnect and we need to run queque to subscribe again
    this._subscriptions.push({
      topic,
      callback: cb || null,
      listener,
    });
  }

  /**
   * Publish a message to topic, send to everyone and me
   * @param topic
   * @param message
   */
  publish(topic: string, message: any) {
    this.send({
      action: 'publish',
      payload: {
        topic,
        message,
      },
    });
  }

  /**
   * Publish a message to the topic and send to everyone, not me
   * @param topic
   * @param message
   */
  broadcast(topic: string, message: any) {
    this.send({
      action: 'broadcast',
      payload: {
        topic,
        message,
      },
    });
  }

  /**
   * Return client conneciton ID
   */
  id(): string {
    return this._id;
  }

  /**
   * Convert string to JSON
   * @param message
   * @returns {*}
   */
  stringToJson(message: string): any {
    let res: any;
    try {
      res = JSON.parse(message);
    } catch (e) {
      console.log(e);
    }

    return res;
  }

  /**
   * Send a message to the server
   * @param message
   */
  send(message: any) {
    let res: string;
    if (this._connected === true && this._ws.readyState === 1) {
      res = JSON.stringify(message);
      this._ws.send(res);
    } else {
      // let keep it in queue
      this._queue.push({
        type: 'message',
        payload: message,
      });
    }
  }

  /**
   * Run Queue after connecting successful
   */
  runQueue() {
    if (this._queue.length) {
      this._queue.forEach((q, index) => {
        switch (q.type) {
          case 'message':
            this.send(q.payload);

            break;

          default:
            break;
        }

        // remove queue

        delete this._queue[index];
      });
    }
  }

  /**
   * Let auto subscribe again
   */
  runSubscriptionQueue() {
    if (this._subscriptions.length) {
      this._subscriptions.forEach(subscription => {
        this.send({
          action: 'subscribe',
          payload: {
            topic: subscription.topic,
          },
        });
      });
    }
  }

  /**
   * Implement reconnect
   */
  reconnect() {
    // if is reconnecting so do nothing
    if (this._isReconnecting || this._connected) {
      return;
    }
    // Set timeout
    this._isReconnecting = true;
    this._reconnectTimeout = setTimeout(() => {
      console.log('Reconnecting....');
      this.connect();
    }, 2000);
  }

  /**
   * Begin connect to the server
   * @param cb
   */
  connect() {
    try {
      // Try to connect allowing unauthorized connections
      this._ws = new WebSocket(this._url, {
        rejectUnauthorized: false,
      });
    } catch (err) {
      // In browser, WebSockets class does not support extra options, so create
      // again WebSocket without options object.
      if (err.name === 'SyntaxError') {
        this._ws = new WebSocket(this._url);
      } else {
        throw err;
      }
    }

    const ws = this._ws;

    // clear timeout of reconnect
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
    }

    ws.onopen = () => {
      // change status of connected
      this._connected = true;
      this._isReconnecting = false;

      console.log('Connected to the server');
      this.send({ action: 'me' });
      // run queue
      this.runQueue();

      this.runSubscriptionQueue();
    };
    // listen a message from the server
    ws.onmessage = message => {
      const jsonMessage = this.stringToJson(message.data.toString());

      const { action } = jsonMessage;
      const { payload } = jsonMessage;

      switch (action) {
        case 'me':
          this._id = payload.id;
          this.onMeMessage(this._id);
          break;

        case 'publish':
          this.emitter.emit(`subscribe_topic_${payload.topic}`, payload.message);
          // let emit this to subscribers
          break;

        default:
          break;
      }
    };
    ws.onerror = err => {
      console.error('unable connect to the server', err.error);

      this._connected = false;
      this._isReconnecting = false;
      this.reconnect();
    };
    ws.onclose = () => {
      console.log('Connection is closed');

      this._connected = false;
      this._isReconnecting = false;
      this.onClose();
      this.reconnect();
    };
  }

  /**
   * Disconnect client
   */
  disconnect() {
    if (this._listeners.length) {
      this._listeners.forEach(listener => {
        listener.remove();
      });
    }
  }
}

export default PubSubClient;
