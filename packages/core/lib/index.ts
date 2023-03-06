import PubSub from "./PubSub.js";
import PubSubClient from "./PubSubClient.js";
import Subscription from "./Subscription.js";

const replTargets = [
  "tidal",
  "sclang",
  "remote_sclang",
  "foxdot",
  "mercury",
  "sardine",
];
const webTargets = ["hydra", "strudel"];
const allTargets = [...replTargets, ...webTargets];
const nonBlockEvalTargets = ["mercury", "strudel"];

export {
  PubSub,
  PubSubClient,
  Subscription,
  replTargets,
  webTargets,
  allTargets,
  nonBlockEvalTargets,
};
