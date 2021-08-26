import { Map } from 'immutable';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid';
import Subscription from './Subscription';
import WebSocket from 'isomorphic-ws';

type ClientType = {
  id: string;
  ws: WebSocket;
  userId: string;
  subscriptions: string[];
};

class PubSub {
  wss: WebSocket;
  clients: Map<string, ClientType>;
  subscription: Subscription;
  onConnection: (id: string) => void;
  onDisconnection: (id: string) => void;

  constructor(ctx) {
    this.wss = ctx.wss;

    this.clients = Map();
    this.subscription = new Subscription();

    this.load = this.load.bind(this);
    this.handleReceivedClientMessage = this.handleReceivedClientMessage.bind(this);
    this.handleAddSubscription = this.handleAddSubscription.bind(this);
    this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    this.handlePublishMessage = this.handlePublishMessage.bind(this);
    this.removeClient = this.removeClient.bind(this);

    this.onConnection =
      ctx.onConnection ||
      (() => {
        return;
      });
    this.onDisconnection =
      ctx.onDisconnection ||
      (() => {
        return;
      });

    this.load();
  }

  load() {
    const { wss } = this;

    wss.on('connection', ws => {
      const id = this.autoId();

      const client: ClientType = {
        id,
        ws,
        userId: null,
        subscriptions: [],
      };

      // add new client to the map
      this.addClient(client);

      // listen when receive message from client
      ws.on('message', (message: string) => this.handleReceivedClientMessage(id, message));

      ws.on('close', () => {
        // Find user subscriptions and remove
        const userSubscriptions = this.subscription.getSubscriptions(sub => sub.clientId === id);
        userSubscriptions.forEach(sub => {
          this.subscription.remove(sub.id);
        });

        // now let remove client

        this.removeClient(id);

        this.onDisconnection(id);
      });

      this.onConnection(id);
    });
  }

  /**
   * Handle add subscription
   * @param topic
   * @param clientId = subscriber
   */
  handleAddSubscription(topic: string, clientId: string) {
    const client = this.getClient(clientId);
    if (client) {
      const subscriptionId = this.subscription.add(topic, clientId);
      client.subscriptions.push(subscriptionId);
      this.addClient(client);
    }
  }

  /**
   * Handle unsubscribe topic
   * @param topic
   * @param clientId
   */
  handleUnsubscribe(_topic: string, clientId: string) {
    const client = this.getClient(clientId);

    let clientSubscriptions = _.get(client, 'subscriptions', []);

    const userSubscriptions = this.subscription.getSubscriptions(s => s.clientId === clientId && s.type === 'ws');

    userSubscriptions.forEach(sub => {
      clientSubscriptions = clientSubscriptions.filter((id: string) => id !== sub.id);

      // now let remove subscriptions
      this.subscription.remove(sub.id);
    });

    // let update client subscriptions
    if (client) {
      client.subscriptions = clientSubscriptions;
      this.addClient(client);
    }
  }

  /**
   * Handle publish a message to a topic
   * @param topic
   * @param message
   * @param from
   * @isBroadcast = false that mean send all, if true, send all not me
   */
  handlePublishMessage(topic: string, message: any, from: string, isBroadcast: boolean = false) {
    const subscriptions = isBroadcast
      ? this.subscription.getSubscriptions(sub => sub.topic === topic && sub.clientId !== from)
      : this.subscription.getSubscriptions(subs => subs.topic === topic);
    // now let send to all subscribers in the topic with exactly message from publisher
    subscriptions.forEach(subscription => {
      const { clientId } = subscription;
      const subscriptionType = subscription.type; // email, phone, ....
      console.log('Client id of subscription', clientId, subscription);
      // we are only handle send via websocket
      if (subscriptionType === 'ws') {
        this.send(clientId, {
          action: 'publish',
          payload: {
            topic,
            message,
          },
        });
      }
    });
  }

  /**
   * Handle receive client message
   * @param clientId
   * @param message
   */
  handleReceivedClientMessage(clientId: string, message: any) {
    const client = this.getClient(clientId);

    if (typeof message === 'string') {
      // eslint-disable-next-line no-param-reassign
      message = this.stringToJson(message);

      const action = _.get(message, 'action', '');
      switch (action) {
        case 'me': {
          // Client is asking for his info

          this.send(clientId, {
            action: 'me',
            payload: { id: clientId, userId: client.userId },
          });

          break;
        }
        case 'subscribe': {
          // @todo handle add this subscriber
          const topic = _.get(message, 'payload.topic', null);
          if (topic) {
            this.handleAddSubscription(topic, clientId);
          }

          break;
        }
        case 'unsubscribe': {
          const unsubscribeTopic = _.get(message, 'payload.topic');
          if (unsubscribeTopic) {
            this.handleUnsubscribe(unsubscribeTopic, clientId);
          }

          break;
        }
        case 'publish': {
          const publishTopic = _.get(message, 'payload.topic', null);
          const publishMessage = _.get(message, 'payload.message');
          if (publishTopic) {
            const from = clientId;
            this.handlePublishMessage(publishTopic, publishMessage, from);
          }

          break;
        }
        case 'broadcast': {
          const broadcastTopicName = _.get(message, 'payload.topic', null);
          const broadcastMessage = _.get(message, 'payload.message');
          if (broadcastTopicName) {
            this.handlePublishMessage(broadcastTopicName, broadcastMessage, clientId, true);
          }

          break;
        }
        default:
          break;
      }
    } else {
      // maybe data message we handle later.
    }
  }

  /**
   * Convert string of message to JSON
   * @param message
   * @returns {*}
   */
  stringToJson(message: string): any {
    let res;
    try {
      res = JSON.parse(message);
    } catch (e) {
      console.log(e);
    }

    return res;
  }

  /**
   * Add new client connection to the map
   * @param client
   */
  addClient(client: ClientType) {
    if (!client.id) {
      // eslint-disable-next-line no-param-reassign
      client.id = this.autoId();
    }
    this.clients = this.clients.set(client.id, client);
  }

  /**
   * Remove a client after disconnecting
   * @param id
   */
  removeClient(id: string) {
    this.clients = this.clients.remove(id);
  }

  /**
   * Get a client connection
   * @param id
   * @returns {V | undefined}
   */
  getClient(id: string): ClientType {
    return this.clients.get(id);
  }

  /**
   * Generate an ID
   * @returns {*}
   */
  autoId(): string {
    return uuidv1();
  }

  /**
   * Send to client message
   * @param message
   */
  send(clientId: string, message: any) {
    const client = this.getClient(clientId);
    if (!client) {
      return;
    }
    const { ws } = client;
    let res;
    try {
      res = JSON.stringify(message);
    } catch (err) {
      console.log('An error convert object message to string', err);
    }

    ws.send(res);
  }
}

export default PubSub;
