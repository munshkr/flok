import PubSub from './PubSub';
import PubSubClient from './PubSubClient';
import Subscription from './Subscription';

const replTargets = ['tidal', 'sclang', 'remote_sclang', 'foxdot', 'mercury', 'sardine'];
const webTargets = ['hydra', 'strudel'];
const allTargets = [...replTargets, ...webTargets];
const nonBlockEvalTargets = ['mercury', 'strudel'];

export { PubSub, PubSubClient, Subscription, replTargets, webTargets, allTargets, nonBlockEvalTargets };
