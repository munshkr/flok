import React from "react";
import ReactDOM from "react-dom";

import "./style.css";

import AppWindow from "../components/AppWindow";
import ReplWindow from "../components/ReplWindow";

const Router = ({ routes }) => {
  const route =
    new URLSearchParams(window.location.search).get("route") || "app";
  const Component = routes[route] || routes.default;
  return <Component />;
};

const Error404Window = () => <span>404</span>;

// A map of "route" => "component"
const routes = {
  default: Error404Window, // Default component to mount when no other route is detected
  app: AppWindow,
  repl: ReplWindow
};

ReactDOM.render(<Router routes={routes} />, document.getElementById("app"));
