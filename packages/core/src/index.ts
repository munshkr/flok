import PubSub from './PubSub';
import PubSubClient from './PubSubClient';
import Subscription from './Subscription';

const replTargets = [
  'tidal',
  'sclang',
  'remote_sclang',
  'foxdot',
  'mercury'
]

const webTargets = [
  'hydra'
]

const allTargets = [...replTargets, ...webTargets]

export { PubSub, PubSubClient, Subscription, replTargets, webTargets, allTargets };
