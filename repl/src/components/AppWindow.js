/* eslint-disable import/no-extraneous-dependencies */
import React from "react";
import { remote, ipcRenderer } from "electron";

const KNOWN_HUBS = ["ws://localhost:3000", "wss://flok-hub.herokuapp.com"];

const KNOWN_REPLS = ["tidal", "sclang", "foxdot"];

const REPLS = {
  tidal: { name: "TidalCycles" },
  sclang: { name: "SuperCollider" },
  foxdot: { name: "FoxDot" }
};

const DEFAULT_HUB = KNOWN_HUBS[0];
const DEFAULT_REPL = "tidal";

// const Log = ({ log }) => <pre>{log}</pre>;

class AppWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hub: DEFAULT_HUB,
      repl: DEFAULT_REPL,
      replData: {}
    };

    this.replWindows = {};

    this.onTextChange = this.onTextChange.bind(this);
    this.onStart = this.onStart.bind(this);

    this._setDataHandler();
  }

  onTextChange(e) {
    const { id, value } = e.target;
    this.setState({ [id]: value });
  }

  // eslint-disable-next-line class-methods-use-this
  onClose() {
    const window = remote.getCurrentWindow();
    window.close();
  }

  onStart() {
    const { hub, repl } = this.state;

    // For now we'll use the repl id as target id
    const target = repl;

    ipcRenderer.send("start-repl", { hub, repl, target });
  }

  _setDataHandler() {
    ipcRenderer.on("data", (_event, data) => {
      console.log("data", data);
      const { target, _type, lines } = data;

      this.setState((prevState, _props) => {
        const { replData } = prevState;

        if (!replData[target]) {
          replData[target] = [];
        }

        replData[target] = [...replData[target], ...lines];

        return { replData };
      });
    });
  }

  render() {
    const { hub, repl, replData } = this.state;

    return (
      <div>
        <h1>flok REPL</h1>
        <div className="toolbar">
          <form>
            <label htmlFor="hub">
              Hub
              <select id="hub" defaultValue={hub} onChange={this.onTextChange}>
                {KNOWN_HUBS.map(url => (
                  <option key={url} value={url}>
                    {url}
                  </option>
                ))}
                {/* <option>Custom...</option> */}
              </select>
            </label>

            <label htmlFor="repl">
              REPL
              <select
                id="repl"
                defaultValue={repl}
                onChange={this.onTextChange}
              >
                {KNOWN_REPLS.map(key => (
                  <option key={key} value={key}>
                    {REPLS[key].name}
                  </option>
                ))}
              </select>
            </label>

            <input type="button" value="Start" onClick={this.onStart} />
          </form>
        </div>
        <div className="log">
          <pre>{JSON.stringify(replData, null, " ")}</pre>
        </div>
      </div>
    );
  }
}

export default AppWindow;
